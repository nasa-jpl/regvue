<script setup lang="ts">
import { ref, Ref, nextTick, onBeforeMount, watch } from "vue";
import { useRoute } from "vue-router";
import { Bit, DataWidth, DisplayType, Field } from "src/types";
import { stringToBitArray } from "src/parse";
import { byteSwap, wordSwap } from "src/format";
import { useStore } from "src/store";

import FieldInputBox from "src/components/FieldInputBox.vue";
import FieldName from "src/components/FieldName.vue";

import ChevronDown from "vue-material-design-icons/ChevronDown.vue";

const props = defineProps<{
  fields: Field[];
  selectedField?: string;
  resets: string[];
  dataWidth: DataWidth;
}>();

const emit = defineEmits([
  "select-field",
  "highlight-field",
  "stop-highlight-field",
  "select-reset-state",
]);

const store = useStore();

// Control whether or not to show dropdown menu of possible reset states
let showResets = ref(false);

// Reset field values to the default reset state
onBeforeMount(() => {
  resetValues();
});

// Store the value of the register as an array of Bits
const registerValue = ref(Array(props.dataWidth).map(() => 0 as Bit));

// Control whether or not to display LSB or MSB first
const useByteSwap = ref(store.useByteSwap);
const useWordSwap = ref(store.useWordSwap);

// Control what base the field/register values should be displayed in
const selectedDisplayType: Ref<DisplayType> = ref(store.selectedDisplayType);
const displayTypes: DisplayType[] = ["binary", "decimal", "hexadecimal"];

// Index variables that can be incremeneted to force a reload of the child
// FieldInputBox components
const fieldKeyIndex = ref(0);
const registerKeyIndex = ref(0);

// Toggles the useByteSwap variable and forces a reload/recalculate
// of register value
const toggleByteSwap = () => {
  useByteSwap.value = !useByteSwap.value;
  useWordSwap.value = false;

  // Update store value so value persists on rerender
  store.useByteSwap = useByteSwap.value;
  store.useWordSwap = false;

  updateRegisterValue();
  registerKeyIndex.value += 1;
};

// Toggles the useWordSwap variable and forces a reload/recalculate
// of register value
const toggleWordSwap = () => {
  useWordSwap.value = !useWordSwap.value;
  useByteSwap.value = false;

  // Update store value so value persists on rerender
  store.useWordSwap = !store.useWordSwap;
  store.useByteSwap = false;

  updateRegisterValue();
  registerKeyIndex.value += 1;
};

const updateDisplayType = (displayType: DisplayType) => {
  selectedDisplayType.value = displayType;
  // Update store value so value persists on rerender
  store.selectedDisplayType = displayType;

  // Force a rerender of both field and register display values
  fieldKeyIndex.value += 1;
  registerKeyIndex.value += 1;
};

// Assigns each field.value based on its field.reset
const resetValues = () => {
  props.fields.forEach((field) => {
    if (props.resets[0] && field.reset.names.includes(props.resets[0])) {
      field.value = stringToBitArray(field.reset.value.toString(), field.nbits);
    } else {
      field.value = stringToBitArray("?", field.nbits);
    }
  });
  updateRegisterValue();

  fieldKeyIndex.value += 1;
  registerKeyIndex.value += 1;
};

// Emit an event when the user selects a new reset state
const selectResetState = (resetState: string) => {
  emit("select-reset-state", resetState);

  showResets.value = false;
  nextTick(() => resetValues());
};

// Ues the field values to obtain a new value for the register
const updateRegisterValue = () => {
  let result: Bit[] = [];

  // Loops through the fields and add their values to the front of the result arr
  props.fields.forEach((field) => {
    result.unshift(...field.value);
  });

  // Byte swap the values if enabled
  if (useByteSwap.value) {
    result = byteSwap(result);
  } else if (useWordSwap.value) {
    result = wordSwap(result);
  }

  registerValue.value = result;
};
updateRegisterValue(); // Initial call on setup

// Parse the user input to update the field value
const onFieldValueChange = (field: Field, value: string) => {
  const newValue = stringToBitArray(value, field.nbits);
  field.value = newValue;

  // Update the register value
  updateRegisterValue();
  registerKeyIndex.value += 1;

  // Stop highlighting the field
  emit("stop-highlight-field");
};

// Obtains the input register value and uses it to update the field values
const onRegisterInput = (input: string) => {
  const value = stringToBitArray(input);
  registerValue.value = value;

  populateFieldValuesFromRegisterValue(value);
  fieldKeyIndex.value += 1;
};

// Assigns all fields a new value based on a new register value
const populateFieldValuesFromRegisterValue = (value: Bit[]) => {
  if (useByteSwap.value) {
    value = byteSwap(value);
  } else if (useWordSwap.value) {
    value = wordSwap(value);
  }

  // Assign each field by indexing the register value according to lsb and nbits
  props.fields.forEach((field) => {
    field.value = value.slice(field.lsb, field.lsb + field.nbits);
  });
};

// Force input components to reload when leaving the page
const route = useRoute();
watch(
  () => route.params.elementId,
  () => {
    nextTick(() => {
      updateRegisterValue();
      fieldKeyIndex.value += 1;
      registerKeyIndex.value += 1;
    });
  }
);
</script>

<template>
  <div>
    <table
      class="z-10 w-full min-w-[525px] table-fixed overflow-x-scroll xs:text-xs sm:text-sm md:text-base"
    >
      <thead>
        <!-- Display the bit number boxes -->
        <th
          v-for="bit in dataWidth"
          :key="bit"
          class="border border-black text-xs font-medium"
          :class="
            Math.floor((bit - 1) / 4) % 2 == 0 ? 'bg-gray-100' : 'bg-gray-300'
          "
        >
          {{ dataWidth - bit }}
        </th>
      </thead>
      <tbody>
        <!-- Display the field names -->
        <tr>
          <td
            v-for="field in fields"
            :key="field.name"
            :colspan="field.nbits"
            class="border border-black text-center hover:cursor-pointer"
            :class="selectedField == field.name ? 'bg-yellow-50' : ''"
            @mouseenter="emit('highlight-field', field.name)"
            @mouseleave="emit('stop-highlight-field')"
            @click="emit('select-field', field.name)"
          >
            <FieldName :name="field.name" />
          </td>
        </tr>

        <!-- Display the individual field input boxes -->
        <tr>
          <td
            v-for="field in fields"
            :key="field.name"
            class="border border-black"
            :class="selectedField == field.name ? 'bg-yellow-50' : ''"
            :colspan="field.nbits"
            @mouseenter="emit('highlight-field', field.name)"
            @mouseleave="emit('stop-highlight-field')"
          >
            <FieldInputBox
              :key="field.name + '-' + fieldKeyIndex"
              :name="field.name"
              :bit-array="field.value"
              :nbits="field.nbits"
              :enums="field.enum || []"
              :selected-display-type="selectedDisplayType"
              @value-changed="onFieldValueChange(field, $event)"
            />
          </td>
        </tr>

        <!-- Display the overall register input box -->
        <tr>
          <td :colspan="dataWidth" class="border border-black">
            <FieldInputBox
              :key="'register-input-' + registerKeyIndex"
              name="register"
              :bit-array="registerValue"
              :nbits="dataWidth"
              :enums="[]"
              :selected-display-type="selectedDisplayType"
              @value-changed="onRegisterInput($event)"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-2 flex flex-row justify-between">
      <!-- Show buttons to change display type -->
      <div class="flex flex-row space-x-2">
        <div>
          <!-- Label for the base buttons -->
          <div class="text-sm text-gray-500">Base</div>

          <!-- Create a select base button for each display type -->
          <button
            v-for="(displayType, i) in displayTypes"
            :id="'select-display-type-' + displayType"
            :key="displayType"
            class="border-[0.5px] border-gray-400 px-1 shadow"
            :class="[
              selectedDisplayType == displayType
                ? 'text-shadow bg-gray-200 text-green-700'
                : 'hover:bg-gray-100',
              i == 0 ? 'rounded-l' : '',
              i == displayTypes.length - 1 ? 'rounded-r' : '',
            ]"
            :title="`Change display type to ${displayType}`"
            @click="updateDisplayType(displayType)"
          >
            <!-- Display first letter capitalized -->
            {{ displayType.substring(0, 1).toUpperCase() }}
          </button>
        </div>

        <div>
          <!-- Label for the swap buttons -->
          <div class="text-sm text-gray-500">Swap</div>

          <!-- Show byte swap button -->
          <button
            id="toggle-byte-swap-button"
            class="rounded-l border border-gray-400 px-1 hover:cursor-pointer"
            :class="
              useByteSwap
                ? 'text-shadow bg-gray-200 text-green-700'
                : 'hover:bg-gray-100'
            "
            title="Toggle byte swapping for the register value"
            @click="toggleByteSwap()"
          >
            Byte
          </button>

          <!-- Show the word swap button -->
          <button
            id="toggle-word-swap-button"
            class="rounded-r border border-gray-400 px-1 hover:cursor-pointer"
            :class="
              useWordSwap
                ? 'text-shadow bg-gray-200 text-green-700'
                : 'hover:bg-gray-100'
            "
            title="Toggle word swapping for the register value"
            @click="toggleWordSwap()"
          >
            Word
          </button>
        </div>
      </div>

      <!-- Show reset values button -->
      <div>
        <div class="text-right text-sm text-gray-500">Reset</div>

        <div class="flex flex-row">
          <!-- Button to reset values to the last selected reset state -->
          <button
            id="reset-values-button"
            class="w-20 truncate rounded-tl border border-gray-400 bg-white px-1 shadow hover:bg-gray-100"
            :class="[
              showResets ? '' : 'rounded-bl',
              resets.length > 1 ? 'border-r-0' : 'rounded-r',
            ]"
            :title="'Reset field values to ' + resets[0] + ' Reset'"
            @click="resetValues()"
          >
            {{ resets[0] }}
          </button>

          <!-- Button to open dropdown menu with other states -->
          <button
            v-if="resets.length > 1"
            id="reset-states-dropdown-button"
            class="rounded-tr border border-gray-400 bg-white shadow hover:cursor-pointer hover:bg-gray-100"
            :class="showResets ? '' : 'rounded-br'"
            @click="showResets = !showResets"
            @blur="showResets = false"
          >
            <chevron-down />
          </button>
        </div>

        <!-- Menu with buttons to reset to other reset states -->
        <div
          v-if="showResets"
          id="reset-states-div"
          class="fixed z-50 mr-8 w-[calc(6.5rem+2px)] divide-y rounded-b border border-t-0 border-gray-400 bg-white"
        >
          <button
            v-for="(reset, i) in resets.slice(1)"
            :id="'select-reset-state-' + i"
            :key="reset as string"
            class="w-full truncate px-1 text-left shadow hover:bg-gray-100"
            :title="'Reset field values to ' + reset + ' Reset'"
            @mousedown="selectResetState(reset as string)"
          >
            {{ reset }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Emulates bold w/o affecting text width and thus w/o reflow */
.text-shadow {
  text-shadow: 1px 0 0 rgb(21 128 61);
}
</style>
