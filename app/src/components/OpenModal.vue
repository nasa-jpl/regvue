<script setup lang="ts">
import { onBeforeMount } from "vue";
import DataFileInput from "./DataFileInput.vue";

const emit = defineEmits(["hide-open-modal"]);

// Keyboard shortcut to close the modal on esc
const hideModalKeyboardShortcut = (event: KeyboardEvent) => {
  if (event.key == "Escape") {
    event.preventDefault();
    document.removeEventListener("keydown", hideModalKeyboardShortcut);
    emit("hide-open-modal");
  }
};

// Register the close modal keyboard shortcut
onBeforeMount(() => {
  document.addEventListener("keydown", hideModalKeyboardShortcut);
});
</script>

<template>
  <div
    id="open-modal-background-div"
    class="absolute top-0 z-50 h-screen w-screen bg-gray-300/50"
    @click="emit('hide-open-modal')"
  >
    <div
      id="open-modal-div"
      class="m-auto mt-28 w-[650px] rounded-lg border border-gray-300 bg-white text-center shadow"
      @click.stop
    >
      <!-- Add a button to close the modal -->
      <div class="flex w-full justify-end">
        <button
          id="close-open-modal-button"
          class="right-0 rounded px-4 py-2 hover:cursor-pointer hover:bg-gray-200"
          @click="emit('hide-open-modal')"
        >
          x
        </button>
      </div>

      <div class="mb-4">
        <!-- Title -->
        <h1>
          Open a new
          <a
            href="https://github.jpl.nasa.gov/regvue/regvue#generate-the-register-description"
            target="_blank"
            rel="noreferrer"
            class="text-blue-500 underline hover:cursor-pointer hover:text-blue-400"
            >Register Description File</a
          >
          or provide the URL for one.
        </h1>

        <!-- File/url input boxes -->
        <DataFileInput class="mt-4" @input-changed="emit('hide-open-modal')" />
      </div>
    </div>
  </div>
</template>
