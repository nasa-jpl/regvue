<script setup lang="ts">
import { ref, watch } from "vue";
import { Bit, DisplayType, Field } from "src/types";
import parse from "src/parse";

import FieldInputBox from "src/components/FieldInputBox.vue";
import FieldName from "src/components/FieldName.vue";

const props = defineProps<{
  fields: Field[];
  selectedDisplayType: DisplayType;
  selectedField?: string;
  useByteSwap: boolean;
}>();

const emit = defineEmits([
  "highlight-field",
  "stop-highlight-field",
  "select-field",
]);

const registerHover = ref(false);

// Store the value of the register as an array of 32 Bits
const registerValue = ref(
  props.fields[0]?.value.map(() => Array(32).map(() => 0 as Bit)) || []
);

// Index variables that can be incremeneted to force a reload of the child
// FieldInputBox components
const fieldKeyIndex = ref(0);
const registerKeyIndex = ref(0);

// Perform a byte swap on a Bit[]
const byteSwap = (bitArray: Bit[]) => {
  if (bitArray.length % 8 != 0) {
    throw Error("Tried to byte swap a value with not invalid number of bits");
  }

  const res: Bit[] = [];

  // Add 8 bits at a time to the front of the new Bit[] result
  for (let i = 0; i < bitArray.length; i += 8) {
    res.unshift(...bitArray.slice(i, i + 8));
  }
  return res;
};

// Parse the user input to update the field value
const onFieldValueChange = (field: Field, value: string, index: number) => {
  const newValue = parse.stringToBitArray(value, field.nbits);
  field.value[index] = newValue;

  // Update the register value
  updateRegisterValue(index);
  registerKeyIndex.value += 1;

  // Stop highlighting the field
  emit("stop-highlight-field");
};

// Obtains the input register value and uses it to update the field values
const onRegisterInput = (input: string, index: number) => {
  const value = parse.stringToBitArray(input);
  registerValue.value[index] = value;

  populateFieldValuesFromRegisterValue(value, index);
  fieldKeyIndex.value += 1;
};

// Ues the field values to obtain a new value for the register
const updateRegisterValue = (index: number) => {
  let result: Bit[] = [];

  // Loops through the fields and add their values to the front of the result arr
  props.fields.forEach((field) => {
    result.unshift(...(field.value[index] || []));
  });

  // Byte swap the values if enabled
  if (props.useByteSwap) {
    result = byteSwap(result);
  }

  registerValue.value[index] = result;
};
for (let i = 0; i < (props.fields[0]?.value || []).length; i++) {
  updateRegisterValue(i); // Initial call on setup
}

// Assigns all fields a new value based on a new register value
const populateFieldValuesFromRegisterValue = (value: Bit[], index: number) => {
  if (props.useByteSwap) {
    value = byteSwap(value);
  }

  // Assign each field by indexing the register value according to lsb and nbits
  props.fields.forEach((field) => {
    field.value[index] = value.slice(field.lsb, field.lsb + field.nbits);
  });
};

// When useByteSwap changes recalculate the register value
watch(
  () => props.useByteSwap,
  () => {
    for (let i = 0; i < (props.fields[0]?.value || []).length; i++) {
      updateRegisterValue(i);
    }
  }
);
</script>

<template>
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

      <template v-for="(_, i) in fields[0]?.value" :key="i">
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
              :key="i + '-' + fieldKeyIndex"
              :index="i"
              :name="field.name"
              :bit-array="field.value[i] || []"
              :nbits="field.nbits"
              :enums="field.enum || []"
              :selected-display-type="selectedDisplayType"
              @value-changed="onFieldValueChange(field, $event, i)"
            />
          </td>
        </tr>

        <!-- Display the overall register input box -->
        <tr>
          <td colspan="32" class="border border-black">
            <FieldInputBox
              :key="i + registerKeyIndex"
              :index="i"
              :class="
                registerHover && (fields[0]?.value || []).length > 1
                  ? 'bg-yellow-50'
                  : ''
              "
              name="register"
              :bit-array="registerValue[i] || []"
              :nbits="32"
              :enums="[]"
              :selected-display-type="selectedDisplayType"
              @value-changed="onRegisterInput($event, i)"
              @mouseenter="registerHover = true"
              @mouseleave="registerHover = false"
            />
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>
