import { listen, Event } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { Ref } from "vue";

import packageInfo from "../../package.json";
import { DesignElement, Rs2JsEvent, Rs2JsEventRaw } from "src/types";
import { valueToFields } from "src/format";
import { useStore } from "src/store";
import { parseBigInt, stringToBitArray } from "src/parse";

export function regWriteCommand(reg: DesignElement, data: bigInt.BigInteger) {
  if (reg.addr) {
    console.log("js2rs_write_command");
    invoke("js2rs_write_command", {
      addr: "0x" + reg.addr.toString(16),
      data: data,
    });
  }
}

export function regReadCommand(reg: DesignElement) {
  if (reg.addr) {
    console.log("js2rs_read_command");
    invoke("js2rs_read_command", {
      addr: "0x" + reg.addr.toString(16),
    });
  }
}

export async function listenForEvents(
  lastRs2JsEvent: Ref<undefined | Rs2JsEvent>
) {
  const store = useStore();
  await listen("rs2js", (event: Event<Rs2JsEventRaw>) => {
    console.log("rs2js", event.payload);

    const rs2jsEvent: Rs2JsEvent = {
      type: event.payload.type,
      addr: parseBigInt(event.payload.addr),
      data: stringToBitArray("0x" + event.payload.data.toString(16)),
    };

    const element = findRegByAddr(rs2jsEvent.addr, store.elements);
    if (element && element?.fields) {
      valueToFields(store.swap, rs2jsEvent.data, element.fields);
    }

    lastRs2JsEvent.value = rs2jsEvent;
  });
}

const findRegByAddr = (
  bigaddr: bigInt.BigInteger,
  elements: Map<string, DesignElement>
): DesignElement | undefined => {
  for (const element of elements.values()) {
    if (element.type == "reg" && element?.addr?.equals(bigaddr)) {
      return element;
    }
  }
  return undefined;
};

export const appInfo = {
  name: packageInfo.name + "-desktop",
  url: packageInfo.homepage,
  version: packageInfo.version,
};
