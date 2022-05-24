<script setup lang="ts">
import { ref } from "vue";
import { RegisterField } from "../types";
import parse from "../parse";

const props = defineProps<{
  fields: RegisterField[];
  selectedField?: string;
}>();
const emit = defineEmits([
  "navigate-to-field",
  "select-field",
  "deselect-field",
]);

let useByteSwap = ref(false);
// let bytes = ref("0x" + "0".repeat(32));
let bytes = ref("0x0123456789abcdef0123456789abcdef");

const byteSwap = (value: number) => {
  let newValue = 0;

  // NOTE: This assumes 32-bit values
  for (let byteIndex = 0; byteIndex < 32 / 8; byteIndex++) {
    const bitIndex = byteIndex * 8;
    const byte = (value >> bitIndex) & 0xff;
    const swappedByteIndex = (3 - byteIndex) * 8;
    const swappedByte = byte << swappedByteIndex;
    newValue |= swappedByte;
  }

  return newValue;
};

const updateFields = (event: Event) => {
  const element = event.currentTarget as HTMLInputElement;
  let value = parse.num(element.value);

  if (useByteSwap.value) {
    value = byteSwap(value);
  }

  for (const field of props.fields) {
    const fieldMask = (1n << BigInt(field.nbits)) - 1n;
    const fieldValue = BigInt(value >> field.lsb) & fieldMask;
    field.reset = Number(fieldValue);
  }
};

const navigateToField = (fieldName: string) => {
  emit("navigate-to-field", fieldName);
};

const selectField = (fieldName: string) => {
  emit("select-field", fieldName);
};

const deselectField = () => {
  emit("deselect-field");
};

const getBitIndex = (parentFieldIdx: number, currentBitIdx: number) => {
  // Need to loop through the fields and count nbits to find
  // the currentBits overall index in the bytes string
  let idx = 0;
  for (let i = 0; i < props.fields.length; i++) {
    if (parentFieldIdx == i) {
      idx += currentBitIdx;
      break;
    } else {
      idx += props.fields[i].nbits;
    }
  }

  if (useByteSwap.value) {
    idx = 32 - (idx + 1);
  }

  return idx;
};

// Parses bit inputs and selects the next input on the screen
const handleBitInput = (event: Event) => {
  const elem = event.target as HTMLInputElement;
  const parent = elem.parentElement;

  const idArray = parent?.id?.split("-") as string[];
  const parentFieldIdx = parseInt(idArray[1]);
  const currentBitIdx = parseInt(idArray[2]);

  const nbits = props.fields[parentFieldIdx].nbits;

  // Attempt to update the byte string
  let error = updateBytes(elem.value, parentFieldIdx, currentBitIdx);
  if (error) {
    return;
  }

  // Find the next input element to focus on using the id
  let nextElem;
  if (currentBitIdx + 1 < nbits) {
    nextElem = document.getElementById(
      `bitInput-${parentFieldIdx}-${currentBitIdx + 1}`
    ) as HTMLInputElement;
  } else if (parentFieldIdx + 1 < props.fields.length) {
    nextElem = document.getElementById(
      `bitInput-${parentFieldIdx + 1}-0`
    ) as HTMLInputElement;
  }

  // Deselect the current input element and focus on the next one
  elem.blur();
  nextElem?.focus();
};

// Updates the bytes variable. Returns true if an error occured
const updateBytes = (
  value: string,
  parentFieldIdx: number,
  currentBitIdx: number
) => {
  // Check if the value is a valid hexadecimal digit
  if (isNaN(parseInt(value, 16)) || value.length != 1) {
    return true;
  }
  const idx = getBitIndex(parentFieldIdx, currentBitIdx);

  // Replace the given byte at the found index
  // Need to skip the first 2 characters to account
  // for the '0x' at the beginning of the byte string
  console.log(bytes.value);
  bytes.value =
    bytes.value.substring(0, idx + 2) +
    value +
    bytes.value.substring(idx + 2 + 1);
  console.log(bytes.value);
  return false;
};

const getBitValue = (fieldIdx: number, bitIdx: number) => {
  const idx = getBitIndex(fieldIdx, bitIdx);
  return bytes.value.substring(2 + idx, 2 + (idx + 1));
};
</script>

<template>
  <div>
    <table class="w-full table-fixed">
      <thead>
        <!-- Display the number boxes -->
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
            @mouseenter="selectField(field.name)"
            @mouseleave="deselectField"
            @click="navigateToField(field.name)"
          >
            <span
              :class="
                field.name.length > field.nbits * 4
                  ? 'rotate my-2 rotate-180'
                  : ''
              "
            >
              {{ field.name }}
            </span>
          </td>
        </tr>

        <!-- Display the individual field input boxes -->
        <tr>
          <template v-for="(field, i) in fields">
            <td
              v-for="(_, j) in field.nbits"
              :id="'bitInputWrapper-' + i + '-' + j"
              :key="field.name + '-' + j"
              class="border border-black"
              :class="selectedField == field.name ? 'bg-yellow-50' : ''"
              @mouseenter="selectField(field.name)"
              @mouseleave="deselectField"
            >
              <input
                :id="'bitInput-' + i + '-' + j"
                type="text"
                :value="getBitValue(i, j)"
                maxlength="1"
                class="w-full bg-inherit px-1 text-center"
                @focus="($event.target as HTMLInputElement).select()"
                @click="($event.target as HTMLInputElement).select()"
                @input="handleBitInput"
              />
            </td>
          </template>
        </tr>

        <!-- Display the overall register input box -->
        <tr>
          <td colspan="32" class="border border-black px-1">
            <input
              type="text"
              class="w-full text-center"
              :value="bytes"
              @input="updateFields"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <div>
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

<style>
.rotate {
  writing-mode: vertical-rl;
}
</style>
