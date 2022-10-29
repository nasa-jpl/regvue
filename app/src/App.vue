<script setup lang="ts">
import packageInfo from "../package.json";
import { parseBigInt, stringToBitArray } from "src/parse";
import { listen, Event } from "@tauri-apps/api/event";
import { ref, provide, onMounted, Ref } from "vue";
import { valueToFields } from "src/format";
import { useStore } from "src/store";
import {
  DesignElement,
  LastRs2JsEvent,
  Rs2JsEvent,
  Rs2JsEventRaw,
} from "src/types";

import AppVersion from "src/components/AppVersion.vue";
import ErrorWindow from "src/components/ErrorWindow.vue";
import LoadingIndicator from "src/components/LoadingIndicator.vue";

const appInfo = {
  name: packageInfo.name,
  url: packageInfo.homepage,
  version: packageInfo.version,
};

const appName =
  import.meta.env.VITE_PLATFORM == "desktop"
    ? appInfo.name + "-desktop"
    : appInfo.name;

const store = useStore();

const lastRs2JsEvent: Ref<undefined | Rs2JsEvent> = ref(undefined);
provide(LastRs2JsEvent, lastRs2JsEvent);

if (import.meta.env.VITE_PLATFORM == "desktop") {
  onMounted(async () => {
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
</script>

<template>
  <div class="overflow-hidden text-[#2c3e50]">
    <!-- Show the main window -->
    <div class="h-screen">
      <router-view />
    </div>

    <!-- Show an error window that will capture and display console errors -->
    <ErrorWindow />

    <!-- Show a loading indicator -->
    <LoadingIndicator />

    <!-- Display a link to the GitHub repo at the bottom right of the page -->
    <AppVersion
      :url="appInfo.url"
      :name="appName"
      :version="appInfo.version"
      class="absolute bottom-4 right-4"
    />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
}
</style>
