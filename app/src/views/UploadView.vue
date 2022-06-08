<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const selectDataFile = () => {
  const elem = document.getElementById("data-url-input") as HTMLInputElement;

  router.push({
    name: "default",
    query: { data: elem.value },
  });
};
</script>

<template>
  <div
    class="m-auto flex h-[90vh] max-w-[800px] flex-col items-center justify-center space-y-4 text-center"
  >
    <h1 class="mb-4 text-3xl font-bold text-gray-700">Welcome to regvue</h1>
    <div>
      To get started enter upload a register documentation file or provide a url
      path.
    </div>
    <div class="flex flex-row space-x-1">
      <input
        id="data-url-input"
        type="text"
        class="border border-gray-300 shadow"
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
