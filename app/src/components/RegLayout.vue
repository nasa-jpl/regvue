<script setup lang="ts">
import { ref, Ref, computed } from "vue";
import { RegisterField, type DisplayType } from "../types";
import format from "../format";
import parse from "../parse";

import FieldInputBox from "./FieldInputBox.vue";

const props = defineProps<{
  fields: RegisterField[];
  selectedField?: string;
}>();
const emit = defineEmits([
  "select-field",
  "highlight-field",
  "stop-highlight-field",
]);

let useByteSwap = ref(false);
let selectedDisplayType: Ref<DisplayType> = ref("hexadecimal");
let displayTypes = ["hexadecimal", "binary", "decimal"];

// Compute the overall register value based on the field values
const registerValue = computed(() => {
  let valuesArr = props.fields.map((field) => {
    let mask = (1n << BigInt(field.nbits)) - 1n;
    return (BigInt(field.value) & mask) << BigInt(field.lsb);
  });

  let result = Number(valuesArr.reduce((result, curr) => result | curr));
  if (useByteSwap.value) {
    result = byteSwap(result);
  }
  return result;
});

const byteSwap = (value: number) => {
  let newValue = 0n;

  for (let byteIdx = 0n; byteIdx < 32 / 8; byteIdx++) {
    const bitIdx = byteIdx * 8n;
    const byte = (BigInt(value) >> bitIdx) & 0xffn;
    const swappedByteIdx = (3n - byteIdx) * 8n;
    const swappedByte = byte << swappedByteIdx;
    newValue |= swappedByte;
  }

  return Number(newValue);
};

// Assigns each field.value to its field.reset
const resetFieldValues = () => {
  props.fields.forEach((field) => (field.value = field.reset));
};

// Enables byte swapping and updates the field values without changing the displayed register value
const swapFieldValues = () => {
  let elem = document.getElementById("register-input") as HTMLInputElement;
  let input = elem.value;
  if (input == "") {
    input = "0";
  }

  let value = parse.num(input);
  value = byteSwap(value);
  populateFieldValuesFromRegisterValue(value);
  useByteSwap.value = !useByteSwap.value;
};

// Parse the user input for the new field value and conditionally
// select the next input element
const onFieldValueChange = (
  field: RegisterField,
  value: string,
  selectNextElem: boolean
) => {
  // TODO Add validation check here
  if (value == "" || value.includes("-")) {
    value = "0";
  }
  let newValue = parse.num(value);

  // Ensure the new value does not exceed the max field value
  newValue = newValue & ((1 << field.nbits) - 1);
  field.value = newValue;

  // Deselect the current input box
  const currentElem = document.getElementById(`fieldInput-${field.name}`);
  currentElem?.blur();

  if (!selectNextElem) return;

  // Find and click on the next input box
  const nextFieldIndex = props.fields.indexOf(field) + 1;
  if (nextFieldIndex < props.fields.length) {
    const nextFieldName = props.fields[nextFieldIndex].name;
    const nextElem = document.getElementById(
      `fieldInput-${nextFieldName}`
    ) as HTMLInputElement;
    nextElem.click();
  }
};

// Obtains the input register value and uses it to update the field values
const onRegisterInput = (event: Event) => {
  let input = (event.target as HTMLInputElement).value;
  if (input == "") {
    input = "0";
  }

  const value = parse.num(input);
  populateFieldValuesFromRegisterValue(value);
};

// Assigns all fields a new value based on a new register value
const populateFieldValuesFromRegisterValue = (value: number) => {
  if (useByteSwap.value) {
    value = byteSwap(value);
  }

  for (let field of props.fields) {
    let mask = (1n << BigInt(field.nbits)) - 1n;
    let fieldValue = BigInt(value >> field.lsb) & mask;

    field.value = Number(fieldValue);
  }
};
</script>

<template>
  <div>
    <table class="w-full table-fixed">
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
            @click="
              emit('select-field', field.name, selectedField == field.name)
            "
          >
            <span
              :class="
                field.name.length > field.nbits * 4
                  ? 'my-2 rotate-180 vertical-rl'
                  : ''
              "
            >
              {{ field.name }}
            </span>
          </td>
        </tr>

        <!-- Display the individual field input boxes -->
        <tr>
          <td
            v-for="field in fields"
            :key="'fieldInput-' + field.name"
            class="border border-black"
            :class="selectedField == field.name ? 'bg-yellow-50' : ''"
            :colspan="field.nbits"
            @mouseenter="emit('highlight-field', field.name)"
            @mouseleave="emit('stop-highlight-field')"
          >
            <FieldInputBox
              :field="field"
              :selected-display-type="selectedDisplayType"
              @select-field="emit('select-field', field.name, $event)"
              @value-changed="
                onFieldValueChange(field, $event.value, $event.selectNextElem)
              "
            />
          </td>
        </tr>

        <!-- Display the overall register input box -->
        <tr>
          <td colspan="32" class="border border-black px-1">
            <input
              id="register-input"
              type="text"
              class="w-full text-center"
              :value="
                format.getStringRepresentation(
                  registerValue,
                  selectedDisplayType,
                  32
                )
              "
              maxlength="34"
              @keydown.enter="onRegisterInput"
              @blur="onRegisterInput"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="mt-2 flex flex-row justify-between">
      <div>
        <div class="flex flex-row space-x-1">
          <!-- Show byte swap button -->
          <button
            class="rounded border border-gray-400 px-1 hover:cursor-pointer"
            :class="
              useByteSwap
                ? 'bg-gray-200 font-semibold text-green-700'
                : 'hover:bg-gray-100'
            "
            title="Toggle byte swapping for the register value"
            @click="useByteSwap = !useByteSwap"
          >
            Byte Swap
          </button>

          <!-- Show the swap fields button -->
          <button
            class="rounded border border-gray-400 bg-white px-1 shadow hover:bg-gray-100"
            title="Toggle byte swapping without changing the register value"
            @click="swapFieldValues"
          >
            Swap Field Values
          </button>

          <!-- Show reset values button -->
          <button
            class="rounded border border-gray-400 bg-white px-1 shadow hover:bg-gray-100"
            title="Set all field values to their reset value"
            @click="resetFieldValues"
          >
            Reset Values
          </button>
        </div>
      </div>

      <div>
        <!-- Show buttons to change display type -->
        <div class="space-x-1">
          <button
            v-for="displayType in displayTypes"
            :key="displayType"
            class="rounded border border-gray-400 px-1 shadow"
            :class="
              selectedDisplayType == displayType
                ? 'bg-gray-200 font-semibold text-green-700'
                : 'hover:bg-gray-100'
            "
            :title="`Change display type to ${displayType}`"
            @click="selectedDisplayType = (displayType as DisplayType)"
          >
            <!-- Display capitalized -->
            {{
              displayType.substring(0, 1).toUpperCase() +
              displayType.substring(1)
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
