<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { Bit, DisplayType } from "../types";
import format from "../format";
import parse from "../parse";

const props = defineProps<{
  name: string;
  bitArray: Bit[];
  nbits: number;
  selectedDisplayType: DisplayType;
}>();

const emit = defineEmits(["select-field", "value-changed"]);

// Determine whether or not to display an error
let isError = ref(false);

// What to show the user when they enter an error
let errorMessage = ref("");

// Value to display when user stops editing
let displayValue = ref(
  format.bitArrayToString(
    props.bitArray,
    props.selectedDisplayType
    // props.nbits
  )
);

// Determine whether or not to show the error tooltip below the input
let showErrorTooltip = ref(false);

// Remove the highlight, deselect the input, and reformat the
// displayValue if there is no error
const deactivate = () => {
  if (!isError.value) {
    nextTick(() => {
      displayValue.value = format.bitArrayToString(
        props.bitArray,
        props.selectedDisplayType
        // props.nbits
      );
    });
  }

  emit("select-field", false);
  showErrorTooltip.value = false;
};

// Determine whether to emit the value change and call deactivate()
const updateValue = () => {
  const elem = document.getElementById(
    "input-box-" + props.name
  ) as HTMLInputElement;
  const value = elem.value;

  const message = getErrorMessage(value);

  if (message == "") {
    emit("value-changed", value);
    isError.value = false;
    errorMessage.value = "";
  } else {
    elem.focus();
    isError.value = true;
    errorMessage.value = message;
  }
  displayValue.value = value;
};

// Returns an error message for the input value. No error returns as ""
const getErrorMessage = (value: string) => {
  if (value == "") {
    return "Empty value";
  }

  // Check that value can be parsed
  try {
    parse.num(value);
  } catch {
    return "Value could not be parsed as a number";
  }

  // Check that the value does not exceed max bit value
  const maxPossibleValue = Number((1n << BigInt(props.nbits)) - 1n);
  if (parse.num(value) > maxPossibleValue) {
    return "Exceeds max possible value";
  }

  // Remove any underscores and starting base encodings for character check
  value = value.replaceAll("_", "");
  if (value.startsWith("0x") || value.startsWith("0X")) {
    value = value.substring(2);
    // There should be a value after the base encoding
    if (value.length == 0) {
      return "Expected a value to follow base encoding";
    }

    // Characters must be a valid hex character
    for (let char of value) {
      if (!/[0-9A-Fa-f]|[?]/.test(char)) {
        return `Invalid hex character: '${char}'`;
      }
    }
  } else if (value.startsWith("0b") || value.startsWith("0B")) {
    value = value.substring(2);

    // There should be a value after the base encoding
    if (value.length == 0) {
      return "Expected a value to follow base encoding";
    }

    // Characters must be a valid binary character
    for (let char of value) {
      if (!/[0-1]|[?]/.test(char)) {
        return `Invalid binary character: '${char}'`;
      }
    }
  } else {
    // Characters must be a valid decimal character
    for (let char of value) {
      if (!/[0-9]|[?]/.test(char)) {
        return `Invalid decimal character: '${char}'`;
      }
    }
  }

  return "";
};

watch(
  () => props.bitArray,
  (to, from) => {
    console.log(`bit array changed from ${from} to ${to}`);
  }
);
</script>

<template>
  <div class="relative w-full">
    <input
      :id="'input-box-' + name"
      type="text"
      :value="displayValue"
      class="w-full bg-inherit text-center shadow-sm"
      :class="isError ? 'inner-border bg-red-300/50' : ''"
      @focus="($event.target as HTMLInputElement).select(); showErrorTooltip=true;"
      @click="($event.target as HTMLInputElement).select(); showErrorTooltip=true;"
      @blur="deactivate"
      @keydown.esc="($event.target as HTMLInputElement).blur()"
      @keydown.enter="($event.target as HTMLInputElement).blur()"
      @input="updateValue()"
      @keydown.delete="updateValue()"
      @mouseenter="showErrorTooltip = true"
      @mouseleave="showErrorTooltip = false"
    />

    <!-- Show that the field value has an error -->
    <div
      v-if="isError && showErrorTooltip"
      class="absolute top-[1.1rem] left-[50%] z-20 translate-x-[-50%] text-center"
    >
      <!-- Display small triangle pointing up -->
      <div
        class="m-auto h-0 w-0 border-[6px] border-transparent border-b-red-500"
      ></div>
      <!-- Display error message as a floating tool tip -->
      <div class="min-w-[250px]">
        <div
          class="rounded border-2 border-t-4 border-gray-300 border-t-red-500 bg-gray-200 px-2 text-gray-800"
        >
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.inner-border {
  -webkit-box-shadow: inset 0 0 0 2px red;
  -moz-box-shadow: inset 0 0 0 2px red;
  box-shadow: inset 0 0 0 2px red;
}
</style>
