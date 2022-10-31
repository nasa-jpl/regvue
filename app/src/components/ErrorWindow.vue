<script setup lang="ts">
import { ref } from "vue";

let showErrorWindow = ref(false);
let errorMessage = ref("");
let url = ref("");
let stackTrace = ref("");

const errorsToIgnore = [
  "ResizeObserver loop completed with undelivered notifications",
  "ResizeObserver loop limit exceeded",
];

// Capture when an error occurs and populate variables with it
const reportError = (event: string | Event, error: Error | undefined) => {
  showErrorWindow.value = true;
  errorMessage.value = event.toString();
  url.value = window.location.toString();
  stackTrace.value = error?.stack || "";
};

const isIgnoredError = (
  event: Event | string,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error
): boolean => {
  if (errorsToIgnore.some((message) => event.toString().includes(message))) {
    return true;
  } else if (
    // Special for ignored ResizeObserver error on webkit
    event.toString() == "Script error." &&
    source == "" &&
    lineno == 0 &&
    colno == 0 &&
    error == null
  ) {
    return true;
  } else {
    return false;
  }
};

// Catch synchronous errors
window.onerror = (
  event: Event | string,
  source?: string,
  lineno?: number,
  colno?: number,
  error?: Error
) => {
  if (!isIgnoredError(event, source, lineno, colno, error)) {
    reportError(event, error);
  }
};

// Catch async errors
window.onunhandledrejection = (event: PromiseRejectionEvent) =>
  reportError(event.reason, event.reason);
</script>

<template>
  <div
    v-if="showErrorWindow"
    id="error-background-div"
    class="absolute top-0 z-50 h-screen w-screen bg-gray-300/50"
  >
    <div
      id="error-div"
      class="relative m-auto mt-32 max-h-[500px] w-[650px] overflow-y-scroll rounded-lg border border-gray-300 bg-white text-center shadow"
      @click.stop
    >
      <!-- Add a button to close the error window -->
      <div class="absolute flex w-full justify-end">
        <button
          id="close-open-modal-button"
          class="right-0 rounded px-4 py-2 hover:cursor-pointer hover:bg-gray-200"
          @click="showErrorWindow = false"
        >
          x
        </button>
      </div>

      <!-- Show the error modal description test -->
      <div class="my-4">
        <div class="mb-2 text-lg">regvue has encountered an error.</div>

        <div class="text-sm">
          Please help us improve regvue by filing a
          <a
            class="text-blue-500 underline hover:cursor-pointer"
            href="https://github.jpl.nasa.gov/regvue/regvue/issues/new/choose"
            target="_blank"
            rel="noreferrer"
            >bug report</a
          >
          and including the information below.
        </div>

        <!-- Show the error stack trace -->
        <div
          class="m-4 max-h-[250px] overflow-y-scroll rounded bg-red-300/50 p-4 text-left text-xs"
        >
          <div>
            <span class="font-semibold">Error: </span>
            {{ errorMessage }}
          </div>
          <div>
            <span class="font-semibold">URL: </span>
            {{ url }}
          </div>
          <div class="font-semibold">Stack Trace:</div>
          <div>{{ stackTrace }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
