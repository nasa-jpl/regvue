<script setup lang="ts">
import { RegisterField } from "../types";

defineProps<{
  fields: RegisterField[];
  selectedField?: string;
}>();
const emit = defineEmits([
  "navigate-to-field",
  "select-field",
  "deselect-field",
]);

const navigateToField = (fieldName: string) => {
  emit("navigate-to-field", fieldName);
};

const selectField = (fieldName: string) => {
  emit("select-field", fieldName);
};

const deselectField = () => {
  emit("deselect-field");
};
</script>

<template>
  <div class="flex flex-col border">
    <!-- Display headers -->
    <header class="flex bg-gray-200 py-1 text-left font-bold">
      <div class="w-20 shrink-0 text-center">Bits</div>
      <div class="w-40 shrink-0 text-center">Name</div>
      <div class="w-20 shrink-0 text-center">Access</div>
      <div class="grow text-center">Description</div>
    </header>

    <!-- Display row entries -->
    <div
      v-for="field in fields"
      :key="field.name"
      class="flex border-b text-left hover:cursor-pointer"
      :class="selectedField == field.name ? 'bg-yellow-50 font-medium' : ''"
      @mouseenter="selectField(field.name)"
      @mouseleave="deselectField"
      @click="navigateToField(field.name)"
    >
      <div class="flex w-20 shrink-0">
        <span class="m-auto">
          {{ field.nbits + field.lsb - 1 }}:{{ field.lsb }}
        </span>
      </div>
      <div class="flex w-40 shrink-0 border-l">
        <span class="m-auto">{{ field.name }}</span>
      </div>
      <div class="flex w-20 shrink-0 border-l px-2">
        <span class="m-auto">{{ field.access }}</span>
      </div>
      <div class="m-auto grow border-l px-2">{{ field.doc }}</div>
    </div>
  </div>
</template>
