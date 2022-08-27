#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            js2rs_write_command,
            js2rs_read_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn js2rs_write_command(addr: &str, data: &str) -> Result<(), ()> {
    println!("js2rs_write_command addr:{addr} data:{data}");

    Ok(())
}

#[tauri::command]
async fn js2rs_read_command(addr: &str) -> Result<(), ()> {
    println!("js2rs_read_command addr:{addr}");

    Ok(())
}
