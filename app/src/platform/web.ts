import { DesignElement, Rs2JsEvent } from "src/types";
import { Ref } from "vue";
import packageInfo from "../../package.json";

export async function fetch(input: RequestInfo | URL): Promise<Response> {
  return await window.fetch(input);
}

export function regWriteCommand(_reg: DesignElement, _data: bigInt.BigInteger) {
  // Not implemented
}

export function regReadCommand(_reg: DesignElement) {
  // Not implemented
}

export async function listenForEvents(
  _lastRs2JsEvent: Ref<undefined | Rs2JsEvent>
) {}

export const appInfo = {
  name: packageInfo.name,
  url: packageInfo.homepage,
  version: packageInfo.version,
};
