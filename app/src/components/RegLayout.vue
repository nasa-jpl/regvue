<script setup lang="ts">
import { ref, Ref, computed, nextTick, onBeforeMount, watch } from "vue";
import { useRoute } from "vue-router";
import { Bit, DisplayType, Field } from "src/types";
import parse from "src/parse";
import { useStore } from "src/store";

import FieldInputBox from "src/components/FieldInputBox.vue";
import FieldName from "src/components/FieldName.vue";

import ChevronDown from "vue-material-design-icons/ChevronDown.vue";

const props = defineProps<{
  fields: Field[];
  selectedField?: string;
  resetState: string;
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

// Get a list of all available reset states
const resets = computed(() => {
  let res = new Set();
  for (const field of props.fields) {
    field.reset?.resets.forEach((reset) => res.add(reset));
  }

  let arr = [...res];
  arr = arr.filter(e => e != props.resetState);
  arr.sort();
  arr.unshift(props.resetState);

  return arr;
});

// Reset field values to the default reset state
onBeforeMount(() => {
  resetValues();
});

// Store the value of the register as an array of 32 Bits
let registerValue = ref(Array(32).map(() => 0 as Bit));

// Control whether or not to display LSB or MSB first
let useByteSwap = ref(store.useByteSwap);

// Control what base the field/register values should be displayed in
let selectedDisplayType: Ref<DisplayType> = ref(store.selectedDisplayType);
let displayTypes: DisplayType[] = ["binary", "decimal", "hexadecimal"];

// Index variables that can be incremeneted to force a reload of the child
// FieldInputBox components
let fieldKeyIndex = ref(0);
let registerKeyIndex = ref(0);

// Perform a byte swap on a Bit[]
const byteSwap = (bitArray: Bit[]) => {
  if (bitArray.length % 8 != 0) {
    throw Error("Tried to byte swap a value with not invalid number of bits");
  }

  let res: Bit[] = [];

  // Add 8 bits at a time to the front of the new Bit[] result
  for (let i = 0; i < bitArray.length; i += 8) {
    res.unshift(...bitArray.slice(i, i + 8));
  }
  return res;
};

// Toggles the useByteSwap variable and forces a reload/recalculate
// of register value
const toggleByteSwap = () => {
  useByteSwap.value = !useByteSwap.value;
  // Update store value so value persists on rerender
  store.useByteSwap = useByteSwap.value;

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
    if (field.reset.resets.includes(props.resetState)) {
      field.value = parse.stringToBitArray(
        field.reset.value.toString(),
        field.nbits
      );
    } else {
      field.value = parse.stringToBitArray("?", field.nbits);
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
}

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
  }

  registerValue.value = result;
};
updateRegisterValue(); // Initial call on setup

// Parse the user input to update the field value
const onFieldValueChange = (field: Field, value: string) => {
  const newValue = parse.stringToBitArray(value, field.nbits);
  field.value = newValue;

  // Update the register value
  updateRegisterValue();
  registerKeyIndex.value += 1;

  // Stop highlighting the field
  emit("stop-highlight-field");
};

// Obtains the input register value and uses it to update the field values
const onRegisterInput = (input: string) => {
  const value = parse.stringToBitArray(input);
  registerValue.value = value;

  populateFieldValuesFromRegisterValue(value);
  fieldKeyIndex.value += 1;
};

// Assigns all fields a new value based on a new register value
const populateFieldValuesFromRegisterValue = (value: Bit[]) => {
  if (useByteSwap.value) {
    value = byteSwap(value);
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
          v-for="bit in 32"
          :key="bit"
          class="border border-black font-medium"
          :class="
            Math.floor((bit - 1) / 4) % 2 == 0 ? 'bg-gray-100' : 'bg-gray-300'
          "
        >
          {{ 32 - bit }}
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
          <td colspan="32" class="border border-black">
            <FieldInputBox
              :key="'register-input-' + registerKeyIndex"
              name="register"
              :bit-array="registerValue"
              :nbits="32"
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
          <button
            v-for="(displayType, i) in displayTypes"
            :id="'select-display-type-' + displayType"
            :key="displayType"
            class="border-[0.5px] border-gray-400 px-1 shadow"
            :class="[
              selectedDisplayType == displayType
                ? 'bg-gray-200 font-semibold text-green-700'
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

        <!-- Show byte swap button -->
        <button
          id="toggle-byte-swap-button"
          class="rounded border border-gray-400 px-1 hover:cursor-pointer"
          :class="
            useByteSwap
              ? 'bg-gray-200 font-semibold text-green-700'
              : 'hover:bg-gray-100'
          "
          title="Toggle byte swapping for the register value"
          @click="toggleByteSwap()"
        >
          Byte Swap
        </button>
      </div>

      <!-- Show reset values button -->
      <div>
        <div class="flex flex-row">
          <!-- Button to reset values to the last selected reset state -->
          <button
            id="reset-values-button"
            class="rounded-tl border border-gray-400 bg-white px-1 shadow hover:bg-gray-100 w-24 truncate"
            :class="
              showResets ? '' : 'rounded-bl',
              resets.length > 1 ? 'border-r-0': 'rounded-r'
            "
            title="Set all field values to their reset value"
            @click="resetValues()"
          >
            {{ resets[0] }} Reset
          </button>

          <!-- Button to open dropdown menu with other states -->
          <button
            v-if="resets.length > 1"
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
          class="fixed mr-8 divide-y rounded-b border border-t-0 border-gray-400 w-[calc(7.5rem+2px)]"
        >
          <button
            v-for="reset in resets.slice(1)"
            class="w-full px-1 shadow hover:bg-gray-100 text-left truncate"
            :title="reset + ' Reset'"
            @mousedown="selectResetState(reset as string)"
          >
            {{ reset }} Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
