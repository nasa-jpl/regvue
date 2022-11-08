import * as base from "src/platform/base";

let platform = base;

export const isDesktop = import.meta.env.VITE_PLATFORM == "desktop";

if (isDesktop) {
  platform = await import("src/platform/desktop");
} else {
  platform = await import("src/platform/web");
}

export const regWriteCommand = platform.regWriteCommand;
export const regReadCommand = platform.regReadCommand;
export const listenForEvents = platform.listenForEvents;
export const appInfo = platform.appInfo;
