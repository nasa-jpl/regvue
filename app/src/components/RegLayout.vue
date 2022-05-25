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

  let result = valuesArr.reduce((result, curr) => result | curr);
  return Number(result);
});

// Assigns each field.value to its field.reset
const resetFieldValues = () => {
  props.fields.forEach((field) => (field.value = field.reset));
};

// Parse the user input for the new field value
const onFieldValueChange = (field: RegisterField, value: string) => {
  // TODO Add validation check here
  field.value = parse.num(value);

  // Deselect the current input box
  let currentElem = document.getElementById(`fieldInput-${field.name}`);
  currentElem?.blur();

  // Find and click on the next input box
  let nextFieldIndex = props.fields.indexOf(field) + 1;
  if (nextFieldIndex < props.fields.length) {
    let nextFieldName = props.fields[nextFieldIndex].name;
    const nextElem = document.getElementById(
      `fieldInput-${nextFieldName}`
    ) as HTMLInputElement;
    nextElem.click();
  }
};

// Assigns all fields a new field based on the inputted register value
const onRegisterInput = (event: Event) => {
  let value = Number((event.target as HTMLInputElement).value);

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
              @value-changed="onFieldValueChange(field, $event)"
            />
          </td>
        </tr>

        <!-- Display the overall register input box -->
        <tr>
          <td colspan="32" class="border border-black px-1">
            <input
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
      <!-- Show buttons to change display type -->
      <div>
        <button
          v-for="displayType in displayTypes"
          :key="displayType"
          class="mr-1 rounded border border-gray-400 px-1 shadow"
          :class="
            selectedDisplayType == displayType
              ? 'bg-gray-200 font-semibold text-green-700'
              : 'hover:bg-gray-100'
          "
          @click="selectedDisplayType = (displayType as DisplayType)"
        >
          <!-- Display capitalized -->
          {{
            displayType.substring(0, 1).toUpperCase() + displayType.substring(1)
          }}
        </button>
      </div>

      <!-- Show clear values button -->
      <button
        class="rounded border border-gray-400 bg-white px-1 shadow hover:bg-gray-100"
        @click="resetFieldValues"
      >
        Clear Values
      </button>
    </div>

    <!-- Show byte swap checkbox -->
    <div class="mt-1">
      <input
        v-model="useByteSwap"
        type="checkbox"
        name="byteswap-checkbox"
        :binary="true"
      />
      <label for="byteswap-checkbox" class="ml-1"> Byte Swap </label>
    </div>
  </div>
</template>
