<script setup lang="ts">
import { ref, nextTick } from "vue";
import { type DisplayType } from "../types";
import format from "../format";

defineProps<{
  value: number;
  selectedDisplayType: DisplayType;
}>();
const emit = defineEmits(["value-changed"]);

// Determines whether or not to show the input box
let active = ref(false);

// Hide the input box and remove the highlight
const deactivate = () => {
  active.value = false;
};

// Show the input box and select it
const activate = () => {
  active.value = true;

  nextTick(() => {
    const elem = document.getElementById("register-input") as HTMLInputElement;
    elem.select();
  });
};

// Deactivate the input box and emit the value change
const updateValue = () => {
  const elem = document.getElementById("register-input") as HTMLInputElement;
  const value = elem.value;
  emit("value-changed", value);

  deactivate();
};
</script>

<template>
  <!-- Show an input box that has a value seperate from the field.value -->
  <div v-if="active">
    <input
      id="register-input"
      type="text"
      :value="format.getStringRepresentation(value, selectedDisplayType, 32)"
      class="w-full bg-inherit text-center shadow-sm"
      @blur="updateValue()"
      @keydown.enter="updateValue()"
      @keydown.tab.prevent="updateValue()"
    />
  </div>

  <!-- Show a static div with the formatted field value -->
  <div v-else>
    <div
      id="register-value"
      class="w-full bg-inherit text-center"
      @click="activate"
    >
      {{ format.getStringRepresentation(value, selectedDisplayType, 32) }}
    </div>
  </div>
</template>
