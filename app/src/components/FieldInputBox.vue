<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { Bit, DisplayType, isUnknownBit } from "src/types";
import format from "src/format";
import parse from "src/parse";

import ChevronDown from "vue-material-design-icons/ChevronDown.vue";
import ChevronUp from "vue-material-design-icons/ChevronUp.vue";

const props = defineProps<{
  name: string;
  bitArray: Bit[];
  nbits: number;
  enums?: { name: string; value: string | number; doc: string }[];
  selectedDisplayType: DisplayType;
}>();

const emit = defineEmits(["value-changed", "enum-selected"]);

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

let cachedValue: Bit[];
onBeforeMount(() => {
  cachedValue = props.bitArray;
});

// Determine whether or not to show dropdown list of possible enum values
let showEnum = ref(false);

// Determine whether or not to show the error tooltip below the input
let showErrorTooltip = ref(false);

// Remove the highlight, deselect the input, and reformat the
// displayValue if there is no error
const deactivate = () => {
  if (!isError.value) {
    displayValue.value = format.bitArrayToString(
      props.bitArray,
      props.selectedDisplayType
    );
  }

  showErrorTooltip.value = false;
};

// Determine whether to emit the value change
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
    for (const char of value) {
      if (!/[0-9A-Fa-f]/.test(char) && !isUnknownBit(char)) {
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
    for (const char of value) {
      if (!/[0-1]/.test(char) && !isUnknownBit(char)) {
        return `Invalid binary character: '${char}'`;
      }
    }
  } else {
    // Characters must be a valid decimal character
    for (const char of value) {
      if (!/[0-9]/.test(char) && !isUnknownBit(char)) {
        return `Invalid decimal character: '${char}'`;
      }
    }
  }

  return "";
};

// Update the input value to be the enum value
const selectEnumValue = (value: string | number, preview = false) => {
  // Get the enum value as a Bit[]
  const ba = parse.stringToBitArray(value.toString(), props.nbits);

  // Set the input value to be equal to the enum value
  const elem = document.getElementById(
    "input-box-" + props.name
  ) as HTMLInputElement;
  elem.value = format.bitArrayToString(ba, props.selectedDisplayType);

  updateValue();

  // If not previewing the change, save the selected enum val as the cachedValue
  if (!preview) {
    cachedValue = ba;
    emit("enum-selected");
  }
};

const restoreCachedValue = () => {
  const value = format.bitArrayToString(cachedValue, props.selectedDisplayType);
  selectEnumValue(value, true);
};
</script>

<template>
  <div class="relative w-full" :class="isError ? 'bg-red-300/50' : ''">
    <!-- Show dropdown buttons to select enum values -->
    <button
      v-if="enums"
      class="fixed z-50 ml-[1px] rounded hover:cursor-pointer hover:bg-gray-200 hover:outline hover:outline-1 hover:outline-gray-300"
      :class="showEnum ? 'bg-gray-200 outline outline-1 outline-gray-300' : ''"
      @click.stop="showEnum = !showEnum"
    >
      <chevron-down v-if="!showEnum" />
      <chevron-up v-else />
    </button>

    <!-- Show the enum value dropdown options -->
    <div
      v-if="showEnum && enums"
      class="absolute top-6 z-50 mt-1 rounded border border-b-0 border-gray-400 bg-gray-200"
    >
      <div
        v-for="e in enums"
        class="border-b border-gray-400 px-1 hover:cursor-pointer hover:bg-gray-300"
      >
        <!-- Show individual enum value by name -->
        <button
          @mouseenter="selectEnumValue(e.value, true)"
          @mouseleave="restoreCachedValue()"
          @click="
            selectEnumValue(e.value);
            showEnum = false;
          "
        >
          {{ e.name }}
        </button>
      </div>
    </div>

    <input
      :id="'input-box-' + name"
      type="text"
      :value="displayValue"
      class="z-10 w-full bg-inherit text-center shadow-sm"
      @focus="($event.target as HTMLInputElement).select(); showErrorTooltip=true;"
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
