<script setup lang="ts">
import { vResponsiveRotate } from "src/directives/ResponsiveRotate";

defineProps<{
  name: string;
}>();
</script>

<template>
  <div v-responsive-rotate class="flex w-full items-center justify-center">
    {{ name }}
  </div>
</template>

<style>
/* The ResponsiveRotate directive will add a "rotate" class to objects that this style will apply to */
.rotate {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  transform: rotate(180deg);
  writing-mode: vertical-rl;
}
</style>
