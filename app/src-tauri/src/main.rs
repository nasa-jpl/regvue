#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use clap::Parser;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use tokio::sync::{mpsc, Mutex};
use tracing::info;

use uart_dap::{self, UartDap};

#[derive(Parser)]
#[clap(author, version, about)]
struct Args {
    #[clap(long)]
    /// The path to the serial device.
    ///
    /// If a path is provided, the application will attempt to open the serial device on startup.
    serial_port: Option<String>,

    #[clap(long, default_value_t = 115200)]
    /// The baud rate for the serial device.
    baud_rate: u32,

    #[clap(long, value_enum, default_value_t = ArgEcho::Remote)]
    /// If the target device performs echo, then this should be set to remote.  Otherwise, a local
    /// echo needs to be performed.
    echo: ArgEcho,

    #[clap(long, value_enum, default_value_t = ArgLineEnding::CrLf)]
    /// Determines the line endings of the serial channel.
    line_ending: ArgLineEnding,
}

#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, clap::ValueEnum)]
enum ArgEcho {
    Local,
    Remote,
}

#[derive(Copy, Clone, PartialEq, Eq, PartialOrd, Ord, clap::ValueEnum)]
enum ArgLineEnding {
    Lf,
    #[clap(name = "crlf")]
    CrLf,
}

impl From<ArgEcho> for uart_dap::Echo {
    fn from(e: ArgEcho) -> Self {
        match e {
            ArgEcho::Local => Self::Local,
            ArgEcho::Remote => Self::Remote,
        }
    }
}

impl From<ArgLineEnding> for uart_dap::LineEnding {
    fn from(e: ArgLineEnding) -> Self {
        match e {
            ArgLineEnding::Lf => Self::Lf,
            ArgLineEnding::CrLf => Self::CrLf,
        }
    }
}

pub type AppError = Box<dyn std::error::Error + Send + Sync>;
pub type AppResult<T> = std::result::Result<T, AppError>;

struct AsyncProcInputTx {
    inner: Mutex<mpsc::Sender<uart_dap::Command>>,
}

fn main() -> AppResult<()> {
    tracing_subscriber::fmt::init();

    let args = Args::parse();

    let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel(1);
    let (async_proc_output_tx, mut async_proc_output_rx) = mpsc::channel(1);

    tauri::Builder::default()
        .manage(AsyncProcInputTx {
            inner: Mutex::new(async_proc_input_tx),
        })
        .invoke_handler(tauri::generate_handler![
            js2rs_write_command,
            js2rs_read_command
        ])
        .setup(move |app| {
            if let Some(serial_port) = args.serial_port {
                tauri::async_runtime::spawn(async move {
                    let uart_dap = UartDap::new(
                        &serial_port,
                        args.baud_rate,
                        args.echo.into(),
                        args.line_ending.into(),
                    )
                    .unwrap();
                    uart_dap
                        .run(async_proc_input_rx, async_proc_output_tx)
                        .await
                        .unwrap()
                });
            }

            let app_handle = app.handle();
            tauri::async_runtime::spawn(async move {
                while let Some(output) = async_proc_output_rx.recv().await {
                    rs2js(output, &app_handle);
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .map_err(|_| "error while running tauri application")?;

    Ok(())
}

#[derive(Clone, Serialize, Deserialize)]
enum EventType {
    Write,
    Read,
}

#[derive(Clone, Serialize, Deserialize)]
struct Event {
    #[serde(rename = "type")]
    typ: EventType,
    addr: u32,
    data: u32,
}

impl From<uart_dap::Event> for Event {
    fn from(e: uart_dap::Event) -> Self {
        match e {
            uart_dap::Event::Write { addr, data } => Event {
                typ: EventType::Write,
                addr,
                data,
            },
            uart_dap::Event::Read { addr, data } => Event {
                typ: EventType::Read,
                addr,
                data,
            },
        }
    }
}

#[tracing::instrument(skip_all)]
fn rs2js<R: tauri::Runtime>(event: uart_dap::Event, manager: &impl Manager<R>) {
    info!(?event);
    manager.emit_all("rs2js", Event::from(event)).unwrap();
}

fn parse_hex(s: &str) -> Result<u32, ()> {
    let s = s.strip_prefix("0x").ok_or(())?;
    u32::from_str_radix(s, 16).or(Err(()))
}

#[tauri::command]
#[tracing::instrument(skip_all)]
async fn js2rs_write_command(
    addr: &str,
    data: &str,
    state: tauri::State<'_, AsyncProcInputTx>,
) -> Result<(), ()> {
    info!(?addr, ?data);

    let addr = parse_hex(addr)?;
    let data = parse_hex(data)?;
    let command = uart_dap::Command::Write { addr, data };

    let async_proc_input_tx = state.inner.lock().await;
    async_proc_input_tx.send(command).await.map_err(|_| ())?;

    Ok(())
}

#[tauri::command]
#[tracing::instrument(skip_all)]
async fn js2rs_read_command(
    addr: &str,
    state: tauri::State<'_, AsyncProcInputTx>,
) -> Result<(), ()> {
    info!(?addr);

    let addr = parse_hex(addr)?;
    let command = uart_dap::Command::Read { addr, nbytes: 4 };

    let async_proc_input_tx = state.inner.lock().await;
    async_proc_input_tx.send(command).await.map_err(|_| ())?;

    Ok(())
}
