<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const baseUrl = window.location.href.substring(
  0,
  window.location.href.indexOf("/404")
);
const location = window.location;

const getRootHref = () => {
  return router.resolve({ name: "element", query: { data: route.query.data } })
    .href;
};

const getOpenPageHref = () => {
  return router.resolve({ name: "open" }).href;
};
</script>

<template>
  <div class="flex h-[90vh] w-screen flex-col items-center justify-center">
    <h1 class="mb-2 text-3xl">Page not found</h1>
    <p class="text-sm text-gray-600">
      {{ route.query.path ? baseUrl + route.query.path : location
      }}{{ route.query.data ? `?data=${route.query.data}` : "" }}
    </p>

    <div class="mt-10">
      <a
        class="underline hover:cursor-pointer hover:text-gray-500"
        :href="getRootHref()"
        >Return</a
      >
      home
    </div>
    <div>
      <a
        class="underline hover:cursor-pointer hover:text-gray-500"
        :href="getOpenPageHref()"
        >Open</a
      >
      new data file
    </div>
  </div>
</template>
