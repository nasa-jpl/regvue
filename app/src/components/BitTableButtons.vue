<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from "src/store";
import { DisplayType, Field } from "src/types";

import ChevronDown from "vue-material-design-icons/ChevronDown.vue";
import DeleteOutline from "vue-material-design-icons/DeleteOutline.vue";
import Plus from "vue-material-design-icons/Plus.vue";

const props = defineProps<{
  regId: string;
  fields: Field[];
  selectedDisplayType: DisplayType;
  useByteSwap: boolean;
}>();

const emit = defineEmits([
  "update-display-type",
  "toggle-byte-swap",
  "reset-values",
  "add-values-row",
  "remove-values-row",
]);

const store = useStore();

let displayTypes: DisplayType[] = ["binary", "decimal", "hexadecimal"];

// Control whether or not to show dropdown menu of possible reset states
let showResets = ref(false);

// Get a list of all available reset states
const resets = computed(() => {
  let res = new Set();
  for (const field of props.fields) {
    field.reset?.resets.forEach((reset) => res.add(reset));
  }
  let arr = [...res];

  const defaultState = store.elements.get(props.regId)?.default_reset;
  if (defaultState) {
    arr = arr.filter((e) => e != defaultState);
    arr.sort();
    arr.unshift(defaultState);
  }

  return arr;
});

const selectResetState = (state: string) => {
  emit("reset-values", state);

  const reg = store.elements.get(props.regId);
  if (!reg) {
    throw Error(`Could not find element with id ${props.regId}`);
  } else {
    reg.default_reset = state;
  }
};
</script>

<template>
  <div>
    <div class="mt-2 flex flex-row justify-between">
      <!-- Left side buttons -->
      <div class="flex flex-row space-x-2">
        <!-- Show buttons to change display type -->
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
            @click="emit('update-display-type', displayType)"
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
          @click="emit('toggle-byte-swap')"
        >
          Byte Swap
        </button>
      </div>

      <!-- Right side buttons -->
      <div class="flex flex-row items-center space-x-2">
        <!-- Show button to add additional input fields -->
        <button
          v-if="(fields[0]?.value || []).length <= 1"
          class="rounded border border-gray-400 text-gray-600/80 shadow hover:cursor-pointer hover:bg-gray-100"
          title="Add a second row of field values"
          @click="emit('add-values-row')"
        >
          <plus />
        </button>
        <!-- Show button to remove additional input fields -->
        <button
          v-else
          class="rounded border border-gray-400 text-gray-600/80 shadow"
          :class="
            (fields[0]?.value || []).length <= 1
              ? 'text-gray-400'
              : 'hover:cursor-pointer hover:bg-gray-100'
          "
          title="Remove the second row of field values"
          @click="emit('remove-values-row')"
          :disabled="(fields[0]?.value || []).length <= 1"
        >
          <delete-outline />
        </button>

        <!-- Show reset values button -->
        <div class="flex flex-row">
          <!-- Button to reset values to the last selected reset state -->
          <button
            id="reset-values-button"
            class="w-32 truncate rounded-tl border border-gray-400 bg-white px-1 shadow hover:bg-gray-100"
            :class="[
              showResets ? '' : 'rounded-bl',
              resets.length > 1 ? 'border-r-0' : 'rounded-r',
            ]"
            :title="'Reset field values to ' + resets[0] + ' Reset'"
            @click="emit('reset-values', resets[0])"
          >
            {{ resets[0] }} Reset
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

          <!-- Menu with buttons to reset to other reset states -->
          <div
            v-if="showResets"
            id="reset-states-div"
            class="fixed z-50 mr-8 mt-[calc(1.5rem+2px)] w-[calc(9.5rem+2px)] divide-y rounded-b border border-t-0 border-gray-400 bg-white"
          >
            <button
              v-for="(reset, i) in resets.slice(1)"
              :id="'select-reset-state-' + i"
              :key="reset as string"
              class="w-full truncate px-1 text-left shadow hover:bg-gray-100"
              :title="'Reset field values to ' + reset + ' Reset'"
              @mousedown="selectResetState(reset as string)"
            >
              {{ reset }} Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
