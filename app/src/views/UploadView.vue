<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import store from "../store";

let fetchError = ref(false);
let uploadError = ref(false);

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

const onUrlDataInput = async () => {
  fetchError.value = false;
  uploadError.value = false;

  const elem = document.getElementById("data-url-input") as HTMLInputElement;
  const result = await store.loadUrl(elem.value);

  if (result) {
    router.push({
      name: "default",
      query: { data: elem.value },
    });
  } else {
    fetchError.value = true;
  }
};

const onDataFileUpload = async (event: DragEvent) => {
  fetchError.value = false;
  uploadError.value = false;
  const elem = document.getElementById("data-url-input") as HTMLInputElement;
  elem.value = "";

  const target = event.target;
  if (!target) return;

  const files = (target as HTMLInputElement).files;
  if (!files || files.length == 0) return;
  const file = files[0];

  const reader = new FileReader();
  reader.onload = async (event) => {
    const result = await store.loadFile(event.target?.result as string);
    if (result) {
      router.push({ name: "default" });
    } else {
      uploadError.value = true;
    }
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
      To get started, upload a register documentation file or provide a URL
      path.
    </div>

    <!-- Show drag and drop file input to upload local data file -->
    <div class="flex w-[90%] items-center justify-center">
      <label
        for="data-file-input"
        class="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
      >
        <div class="fixed flex flex-col items-center justify-center pt-10 pb-6">
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
          <p
            class="m-auto text-sm text-rose-500"
            :class="!uploadError ? 'opacity-0' : ''"
          >
            Error parsing uploaded file.
          </p>
        </div>
        <input
          id="data-file-input"
          type="file"
          class="relative z-50 h-64 w-full opacity-0 hover:cursor-pointer"
          :onchange="onDataFileUpload"
        />
      </label>
    </div>

    <!-- Show text input to get data from url -->
    <div>
      <div class="flex flex-row space-x-1">
        <input
          id="data-url-input"
          type="text"
          class="w-[500px] rounded border border-gray-300 px-1"
          placeholder="https://"
          @keydown.enter="onUrlDataInput()"
        />
        <button
          class="rounded border border-gray-300 bg-gray-200 px-1 text-sm shadow"
          @click="onUrlDataInput()"
        >
          go
        </button>
      </div>
      <div
        class="m-auto mt-3 text-sm text-rose-500"
        :class="!fetchError ? 'opacity-0' : ''"
      >
        Could not fetch from given URL.
      </div>
    </div>
  </div>
</template>
