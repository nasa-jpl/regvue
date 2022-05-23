<script setup lang="ts">
import { ref } from "vue";
import { RegisterField } from "../types";
import format from "../format";
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

let byte_swap = ref(false);

const byteSwap = (value: number) => {
  return value;
};

const updateFields = (event: Event) => {
  const element = event.currentTarget as HTMLInputElement;
  let value = parse.num(element.value);

  if (byte_swap.value) {
    value = byteSwap(value);
  }

  for (const field of props.fields) {
    let fieldMask = (1n << BigInt(field.nbits)) - 1n;
    let fieldValue = BigInt(value >> field.lsb) & fieldMask;
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
          <td
            v-for="field in fields"
            :key="field.name"
            :colspan="field.nbits"
            class="border border-black"
            @mouseenter="selectField(field.name)"
            @mouseleave="deselectField"
          >
            <input
              type="text"
              :value="format.field_value(field, field.reset)"
              class="w-full px-1 text-center"
              :class="selectedField == field.name ? 'bg-yellow-50' : ''"
            />
          </td>
        </tr>

        <!-- Display the overall register input box -->
        <tr>
          <td colspan="32" class="border border-black px-1">
            <input
              type="text"
              class="w-full text-center"
              @input="updateFields"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.rotate {
  writing-mode: vertical-rl;
}
</style>
