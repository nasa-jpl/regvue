<script setup lang="ts">
import { RegisterField } from "../types";
import format from "../format";

defineProps<{
  fields: RegisterField[];
}>();
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
            class="border border-black text-center"
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
            class="border border-black px-1"
          >
            <input
              type="text"
              :value="format.field_value(field, field.reset)"
              class="w-full text-center"
            />
          </td>
        </tr>

        <!-- Display the overall register input box -->
        <tr>
          <td colspan="32" class="border border-black px-1">
            <input type="text" class="w-full text-center" />
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
