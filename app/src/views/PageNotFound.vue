<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const returnToRoot = () => {
  router.push({ name: "default", query: { data: route.query.data } });
};

const returnToUpload = () => {
  router.push({ name: "upload" });
};
</script>

<template>
  <div class="flex h-[90vh] w-screen flex-col items-center justify-center">
    <h1 class="mb-2 text-3xl">Page not found</h1>
    <p class="text-sm text-gray-600">{{ route.query.path }}</p>

    <div class="mt-10">
      <span
        class="underline hover:cursor-pointer hover:text-gray-500"
        @click="returnToRoot()"
        >Return</span
      >
      to root element
    </div>
    <div>
      <span
        class="underline hover:cursor-pointer hover:text-gray-500"
        @click="returnToUpload()"
        >Upload</span
      >
      new data file
    </div>
  </div>
</template>
