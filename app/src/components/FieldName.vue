<script setup lang="ts">
import { vResponsiveRotate } from "../directives/ResponsiveRotate";

defineProps<{
  name: string;
  nbits: number;
}>();
</script>

<template>
  <div v-responsive-rotate class="flex w-full justify-center">
    <span class="m-auto">
      {{ name }}
    </span>
  </div>
</template>

<style>
.rotate {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  transform: rotate(180deg);
  writing-mode: vertical-rl;
}
</style>
