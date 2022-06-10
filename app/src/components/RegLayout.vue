<script setup lang="ts">
import { ref, Ref, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { Bit, RegisterField, DisplayType } from "../types";
import parse from "../parse";
import store from "../store";

import FieldInputBox from "./FieldInputBox.vue";
import FieldName from "./FieldName.vue";

const props = defineProps<{
  fields: RegisterField[];
  selectedField?: string;
}>();

const emit = defineEmits([
  "select-field",
  "highlight-field",
  "stop-highlight-field",
]);

// Numeric value of the register
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

// Perform a byte swap on a bit array
const byteSwap = (bitArray: Bit[]) => {
  let res: Bit[] = [];
  for (let i = 0; i < 32; i += 8) {
    res.unshift(...bitArray.slice(i, i + 8));
  }
  return res;
};

// Toggles the useByteSwap variable and forces a reload/recalculate
// of register value
const toggleByteSwap = () => {
  useByteSwap.value = !useByteSwap.value;
  // Update store value so value persists on rerender
  store.setUseByteSwap(useByteSwap.value);

  updateRegisterValue();
  registerKeyIndex.value += 1;
};

const updateDisplayType = (displayType: DisplayType) => {
  selectedDisplayType.value = displayType;
  // Update store value so value persists on rerender
  store.setSelectedDisplayType(displayType);

  // Force a rerender of both field and register display values
  fieldKeyIndex.value += 1;
  registerKeyIndex.value += 1;
};

// Assigns each field.value to its field.reset
const resetValues = () => {
  props.fields.forEach(
    (field) =>
      (field.value = parse.stringToBitArray(
        field.reset.toString(),
        field.nbits
      ))
  );
  updateRegisterValue();

  fieldKeyIndex.value += 1;
  registerKeyIndex.value += 1;
};

// Ues the field values to obtain a new value for the register
const updateRegisterValue = () => {
  let result: Bit[] = [];

  props.fields.forEach((field) => {
    result.unshift(...field.value.slice());
  });

  if (useByteSwap.value) {
    result = byteSwap(result);
  }

  registerValue.value = result;
  console.log(result);
};
updateRegisterValue(); // Initial call on setup

// Parse the user input for the new field value and conditionally
// select the next input element
const onFieldValueChange = (field: RegisterField, value: string) => {
  console.log(value);
  let newValue = parse.stringToBitArray(value, field.nbits);
  console.log(newValue);
  // TODO renable this
  // Ensure the new value does not exceed the max field value
  // newValue = newValue & ((1 << field.nbits) - 1);
  field.value = newValue;

  // Update the register value
  updateRegisterValue();
  registerKeyIndex.value += 1;
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

  props.fields.forEach((field) => {
    field.value = value.slice(field.lsb, field.lsb + field.nbits);
  });
};

// Recalculate the register value when leaving the page
const route = useRoute();
watch(
  () => route.params.regid,
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
      class="w-full min-w-[525px] table-fixed overflow-x-scroll xs:text-xs sm:text-sm md:text-base"
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
            <FieldName :name="field.name" :nbits="field.nbits" />
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
              :selected-display-type="selectedDisplayType"
              @select-field="emit('select-field', field.name)"
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
      <button
        class="rounded border border-gray-400 bg-white px-1 shadow hover:bg-gray-100"
        title="Set all field values to their reset value"
        @click="resetValues"
      >
        Reset Values
      </button>
    </div>
  </div>
</template>
