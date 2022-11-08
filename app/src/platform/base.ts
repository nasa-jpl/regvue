import { DesignElement, Rs2JsEvent } from "src/types";
import { Ref } from "vue";

export async function fetch(_input: RequestInfo | URL): Promise<Response> {
  return new Response();
}

export function regWriteCommand(
  _reg: DesignElement,
  _data: bigInt.BigInteger
) {}

export function regReadCommand(_reg: DesignElement) {}

export async function listenForEvents(
  _lastRs2JsEvent: Ref<undefined | Rs2JsEvent>
) {}

export const appInfo = {
  name: "",
  url: "",
  version: "",
};
