<script setup lang="ts">
import { onBeforeMount, ref, nextTick } from "vue";
import { Bit, DisplayType, isUnknownBit } from "src/types";
import format from "src/format";
import parse from "src/parse";

import ChevronDown from "vue-material-design-icons/ChevronDown.vue";

const props = defineProps<{
  name: string;
  bitArray: Bit[];
  nbits: number;
  enums: { name: string; value: string | number; doc: string }[];
  selectedDisplayType: DisplayType;
}>();

const emit = defineEmits(["value-changed"]);

// Determine whether or not to display an error
let isError = ref(false);

// What to show the user when they enter an error
let errorMessage = ref("");

// Value to display when user stops editing
let displayValue = ref(
  format.bitArrayToString(props.bitArray, props.selectedDisplayType)
);
onBeforeMount(() => {
  for (const e of props.enums) {
    if (e.value == parse.num(displayValue.value)) {
      displayValue.value = `${e.name} (${displayValue.value})`;
      return;
    }
  }
});

// Keep track of the last value that the user fully selected
let cachedValue: Bit[];
onBeforeMount(() => {
  cachedValue = props.bitArray;
});

// Determine whether or not to show dropdown list of possible enum values
let showEnum = ref(false);

// Determine whether or not to show the error tooltip below the input
let showErrorTooltip = ref(false);

// Focuses on the input box
const focusOnInput = () => {
  (
    document.querySelector(`#input-box-${props.name}`) as HTMLInputElement
  ).focus();
};

// Remove the highlight, deselect the input, and reformat the
// displayValue if there is no error
const deactivate = () => {
  showEnum.value = false;
  showErrorTooltip.value = false;

  if (!isError.value) {
    displayValue.value = format.bitArrayToString(
      props.bitArray,
      props.selectedDisplayType
    );

    for (const e of props.enums) {
      if (e.value == parse.num(displayValue.value)) {
        displayValue.value = `${e.name} (${displayValue.value})`;
        return;
      }
    }
  }
};

// Determine whether to emit the value change
const updateValue = (addEnumName = false) => {
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
  // Loop through enum values
  if (addEnumName) {
    for (const e of props.enums) {
      if (e.value == parse.num(value)) {
        displayValue.value = `${e.name} (${value})`;
        return;
      }
    }
  }

  displayValue.value = value;
};

// Update the input value to be the enum value
const selectEnumValue = (value: string | number, preview = false) => {
  // Get the enum value as a Bit[]
  const bitArr = parse.stringToBitArray(value.toString(), props.nbits);

  // Set the input value to be equal to the enum value
  const elem = document.getElementById(
    "input-box-" + props.name
  ) as HTMLInputElement;
  elem.value = format.bitArrayToString(bitArr, props.selectedDisplayType);

  // If not previewing the change, save the selected enum val as the cachedValue
  if (preview) {
    updateValue(true);
  } else {
    updateValue();
    cachedValue = bitArr;
  }
};

// Restores the last user input value
const restoreCachedValue = () => {
  const value = format.bitArrayToString(cachedValue, props.selectedDisplayType);
  selectEnumValue(value, true);
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
</script>

<template>
  <div class="relative w-full" :class="isError ? 'bg-red-300/50' : ''">
    <div class="grid">
      <input
        :id="'input-box-' + name"
        type="text"
        :value="displayValue"
        class="z-10 col-start-1 row-start-1 w-full justify-self-center truncate bg-inherit px-1 text-center shadow-sm"
        :title="displayValue"
        @focus="
          ($event.target as HTMLInputElement).select();
          showErrorTooltip=true;
          showEnum=true;
        "
        @blur="nextTick(() => deactivate())"
        @keydown.esc="($event.target as HTMLInputElement).blur()"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
        @input="
          updateValue();
          showEnum = false;
        "
        @keydown.delete="updateValue()"
        @mouseenter="showErrorTooltip = true"
        @mouseleave="showErrorTooltip = false"
      />

      <chevron-down
        v-if="enums.length"
        class="z-20 col-start-1 row-start-1 justify-self-end hover:cursor-pointer"
        @click="focusOnInput()"
      />
    </div>

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

    <!-- Show the enum value dropdown options -->
    <div
      v-else-if="showEnum && enums.length"
      class="absolute top-[calc(1.25rem+1px)] left-[50%] z-50 mt-1 w-fit translate-x-[-50%]"
    >
      <div
        class="rounded border border-b-0 border-gray-400 border-t-gray-400 bg-white"
      >
        <div
          v-for="e in enums"
          :key="e.name"
          class="border-b border-gray-400 px-1 hover:cursor-pointer hover:bg-gray-300"
        >
          <!-- Show individual enum value by as "name (value)" -->
          <button
            class="w-full truncate text-left"
            @mouseenter="selectEnumValue(e.value, true)"
            @mouseleave="restoreCachedValue()"
            @click="selectEnumValue(e.value, false)"
          >
            {{ e.name }}
            ({{
              format.getStringRepresentation(
                parse.num(e.value.toString()),
                selectedDisplayType,
                nbits
              )
            }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
