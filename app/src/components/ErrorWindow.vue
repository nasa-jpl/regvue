<script setup lang="ts">
import { ref, onBeforeMount, onBeforeUnmount } from "vue";

let showErrorWindow = ref(false);
let errorMessage = ref("");
let url = ref("");
let stackTrace = ref("");

const errorsToIgnore = [
  "ResizeObserver loop completed with undelivered notifications",
  "ResizeObserver loop limit exceeded",
];

// Capture when an error occurs and populate variables with it
window.onerror = (event, _source, _lineno, _colno, error) => {
  if (!errorsToIgnore.some((error) => event.toString().includes(error))) {
    showErrorWindow.value = true;
    errorMessage.value = event.toString();
    url.value = window.location.toString();
    stackTrace.value = error?.stack || "";
  }
};

// Keyboard shortcut to close the modal on esc
const hideModalKeyboardShortcut = (event: KeyboardEvent) => {
  if (event.key == "Escape") {
    event.preventDefault();
    showErrorWindow.value = false;
  } else if (event.ctrlKey && event.key == "e") {
    throw new Error("TEST ERROR");
  }
};

// Register the close modal keyboard shortcut
onBeforeMount(() => {
  document.addEventListener("keydown", hideModalKeyboardShortcut);
});

// Remove the keyboard shortcut on unrender
onBeforeUnmount(() => {
  document.removeEventListener("keydown", hideModalKeyboardShortcut);
});
</script>

<template>
  <div
    v-if="showErrorWindow"
    id="error-background-div"
    class="absolute top-0 z-50 h-screen w-screen bg-gray-300/50"
    @click="showErrorWindow = false"
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

      <!-- Show the error description -->
      <div class="my-4">
        <h3 class="mb-2 text-lg">regvue has encountered an error</h3>

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
            {{ errorMessage.replace("Error: ", "") }}
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
