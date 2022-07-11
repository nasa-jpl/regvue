<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import { useCookies } from "vue3-cookies";
import { useRouter } from "vue-router";
import { useStore } from "src/store";

const MAX_SAVED_URLS_CNT = 5;

const store = useStore();
const emit = defineEmits(["input-changed"]);

let fetchError = ref("");
let openError = ref("");

const { cookies } = useCookies();
const router = useRouter();

// Get the recently search urls
const recentUrls = ref([] as string[]);
const showRecents = ref(false);
onBeforeMount(() => {
  let arr: string[];

  const jsonString = cookies.get("urls");
  if (jsonString) {
    arr = JSON.parse(jsonString);
  } else {
    arr = [];
  }

  recentUrls.value = arr;
});

// Prevent dropping a file outside the input box from opening the file
// in the browser
onBeforeMount(() => {
  window.addEventListener("dragover", (e) => {
    e.preventDefault();
  });

  window.addEventListener("drop", (e) => {
    // Disable default behavior of opening file in the browser window
    if ((e.target as HTMLElement)?.tagName != "INPUT") {
      e.preventDefault();
    }

    // Check if the dropped object has a URL field
    const url =
      e.dataTransfer?.getData("URL") || e.dataTransfer?.getData("text");
    if (url && url != "") {
      e.preventDefault();

      // Set the data-url-input equal to dropped object URL field
      const elem = document.getElementById(
        "data-url-input"
      ) as HTMLInputElement;
      elem.value = url;

      // Try to load the url of the dropped object
      onUrlDataInput();
    }
  });
});

const saveRecentUrlSearch = (url: string) => {
  let arr: string[];

  // If there is already a cookie value
  const jsonString = cookies.get("urls");
  if (jsonString) {
    // Decode the other recent urls in a string[]
    arr = JSON.parse(jsonString);

    // Add the new url
    arr.unshift(url);

    // Limit the amount of recent urls to show
    arr = arr.slice(0, Math.min(arr.length, MAX_SAVED_URLS_CNT));

    // Convert from set back to array to remove duplicates
    arr = [...new Set(arr)];
  } else {
    arr = [url];
  }

  // Store the array as a string cookie
  cookies.set("urls", JSON.stringify(arr));
};

const onUrlDataInput = async () => {
  fetchError.value = "";
  openError.value = "";

  const elem = document.getElementById("data-url-input") as HTMLInputElement;
  const result = await store.loadUrl(elem.value);

  if (result == "") {
    router.push({
      name: "default",
      query: { data: elem.value },
    });

    saveRecentUrlSearch(elem.value);
    emit("input-changed");
  } else {
    fetchError.value = result;
  }
};

const onDataFileOpen = async (event: Event) => {
  fetchError.value = "";
  openError.value = "";
  const elem = document.getElementById("data-url-input") as HTMLInputElement;
  elem.value = "";

  const target = event.target;
  if (!target) return;

  const files = (target as HTMLInputElement).files;
  if (!files || files.length == 0) return;
  const file = files[0];
  if (!file) {
    throw new Error("Could not find file after upload");
  }

  const reader = new FileReader();
  reader.onload = async (event) => {
    const result = await store.loadFile(event.target?.result as string);
    if (result == "") {
      router.push({ name: "default" });
      emit("input-changed");
    } else {
      openError.value = result;
    }
  };

  reader.readAsText(file);
};
</script>

<template>
  <div class="flex flex-col items-center justify-center space-y-4 text-center">
    <!-- Show drag and drop file input to open local data file -->
    <div class="flex w-[90%] items-center justify-center">
      <label
        id="data-file-drop-zone"
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
            <span class="font-semibold">Click to open</span> or drag and drop
          </p>
          <p
            class="m-auto text-sm text-rose-500"
            :class="!openError ? 'opacity-0' : ''"
          >
            {{ openError }}
          </p>
        </div>
        <input
          id="data-file-input"
          type="file"
          accept=".json"
          class="relative z-50 h-64 w-full opacity-0 hover:cursor-pointer"
          :onchange="onDataFileOpen"
        />
      </label>
    </div>

    <div>
      <div class="flex flex-row justify-center space-x-1">
        <!-- Show text input to get data from url -->
        <input
          id="data-url-input"
          list="recentUrls"
          class="w-[500px] rounded border border-gray-300 px-1"
          placeholder="https://example.com/data.json"
          @keydown.enter="onUrlDataInput()"
          @focus="showRecents = true"
          @blur="showRecents = false"
        />

        <!-- Show recent search options as quick select options -->
        <datalist id="recentUrls">
          <option v-for="url in recentUrls" :key="url" :value="url"></option>
        </datalist>

        <!-- Show a button to fetch from the url -->
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
        {{ fetchError }}
      </div>
    </div>
  </div>
</template>
