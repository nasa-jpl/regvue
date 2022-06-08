<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import store from "../store";

const router = useRouter();

// Prevent dropping a file outside the input box from opening the file
// in the browser
onBeforeMount(() => {
  window.addEventListener("dragover", (e) => {
    if ((e.target as HTMLElement)?.tagName != "INPUT") {
      e.preventDefault();
    }
  });
  window.addEventListener("drop", (e) => {
    if ((e.target as HTMLElement)?.tagName != "INPUT") {
      e.preventDefault();
    }
  });
});

const selectDataFile = () => {
  const elem = document.getElementById("data-url-input") as HTMLInputElement;

  router.push({
    name: "default",
    query: { data: elem.value },
  });
};

const onDataFileUpload = async (event: DragEvent) => {
  const target = event.target;
  if (!target) return;

  const files = (target as HTMLInputElement).files;
  if (!files || files.length == 0) return;
  const file = files[0];

  const reader = new FileReader();
  reader.onload = (event) => {
    store.loadFile(event.target?.result as string);
    router.push({ name: "default" });
  };

  reader.readAsText(file);
};
</script>

<template>
  <div
    class="m-auto mt-8 flex h-[90vh] max-w-[800px] flex-col items-center justify-center space-y-4 text-center"
  >
    <h1 class="mb-4 text-3xl font-bold text-gray-700">Welcome to regvue</h1>
    <div>
      To get started enter upload a register documentation file or provide a url
      path.
    </div>

    <!-- Show drag and drop file input to upload local data file -->
    <div class="flex w-[90%] items-center justify-center">
      <label
        for="data-file-input"
        class="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
      >
        <div class="fixed flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            class="mb-3 h-10 w-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          <p class="mb-2 text-sm text-gray-500">
            <span class="font-semibold">Click to upload</span> or drag and drop
          </p>
        </div>
        <input
          id="data-file-input"
          type="file"
          class="relative z-50 h-64 w-full opacity-0"
          :onchange="onDataFileUpload"
        />
      </label>
    </div>

    <!-- Show text input to get data from url -->
    <div class="flex flex-row space-x-1">
      <input
        id="data-url-input"
        type="text"
        class="border border-gray-300 shadow"
        placeholder="https://"
        @keydown.enter="selectDataFile()"
      />
      <button
        class="rounded border border-gray-300 bg-gray-200 px-1 text-sm shadow"
        @click="selectDataFile()"
      >
        go
      </button>
    </div>
  </div>
</template>
