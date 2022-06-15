<script setup lang="ts">
import DataFileInput from "src/components/DataFileInput.vue";
</script>

<template>
  <div
    class="m-auto mt-8 flex h-[90vh] max-w-[800px] flex-col items-center justify-center space-y-4 text-center"
  >
    <h1 class="mb-4 text-3xl font-bold text-gray-700">Welcome to regvue</h1>
    <div>
      To get started, open a
      <a
        href="https://github.jpl.nasa.gov/regvue/regvue#generate-the-register-description"
        target="_blank"
        rel="noreferrer"
        class="text-blue-500 underline hover:cursor-pointer hover:text-blue-400"
        >Register Description File</a
      >
      or provide the URL for one.
    </div>

    <DataFileInput class="w-[750px]" />
  </div>
</template>
