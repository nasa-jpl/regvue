<script setup lang="ts">
import { ref, Ref, computed, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { DisplayType, Field } from "src/types";
import parse from "src/parse";
import { useStore } from "src/store";

import BitTable from "src/components/BitTable.vue";

import ChevronDown from "vue-material-design-icons/ChevronDown.vue";

const props = defineProps<{
  fields: Field[];
  selectedField?: string;
  resetState: string;
}>();

const emit = defineEmits([
  "highlight-field",
  "stop-highlight-field",
  "select-reset-state",
  "select-field",
]);

const store = useStore();

// Incrementing this key will force the BitTable to rerender
let resetTableKey = ref(0);

// Control whether or not to show dropdown menu of possible reset states
let showResets = ref(false);

// Control whether or not to display LSB or MSB first
let useByteSwap = ref(store.useByteSwap);

// Control what base the field/register values should be displayed in
let selectedDisplayType: Ref<DisplayType> = ref(store.selectedDisplayType);
let displayTypes: DisplayType[] = ["binary", "decimal", "hexadecimal"];

// Get a list of all available reset states
const resets = computed(() => {
  let res = new Set();
  for (const field of props.fields) {
    field.reset?.resets.forEach((reset) => res.add(reset));
  }

  let arr = [...res];
  arr = arr.filter((e) => e != props.resetState);
  arr.sort();
  arr.unshift(props.resetState);

  return arr;
});

// Toggles the useByteSwap variable
const toggleByteSwap = () => {
  // Update store value so value persists on rerender
  store.useByteSwap = useByteSwap.value;
  useByteSwap.value = !useByteSwap.value;

  resetTableKey.value += 1;
};

const updateDisplayType = (displayType: DisplayType) => {
  // Update store value so value persists on rerender
  store.selectedDisplayType = displayType;
  selectedDisplayType.value = displayType;

  resetTableKey.value += 1;
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

  resetTableKey.value += 1;
};

// Emit an event when the user selects a new reset state
const selectResetState = (resetState: string) => {
  emit("select-reset-state", resetState);

  showResets.value = false;
  nextTick(() => resetValues());
};

// Force BitTable to reload when leaving the page
const route = useRoute();
watch(
  () => route.params.elementId,
  () => nextTick(() => (resetTableKey.value += 1))
);
</script>

<template>
  <!-- Table to display editable field and register values -->
  <BitTable
    :key="resetTableKey"
    :fields="fields"
    :selected-display-type="selectedDisplayType"
    :selected-field="(selectedField as string)"
    :use-byte-swap="useByteSwap"
    @highlight-field="emit('highlight-field', $event)"
    @stop-highlight-field="emit('stop-highlight-field')"
    @select-field="emit('select-field', $event)"
  />

  <div>
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
            class="w-32 truncate rounded-tl border border-gray-400 bg-white px-1 shadow hover:bg-gray-100"
            :class="[
              showResets ? '' : 'rounded-bl',
              resets.length > 1 ? 'border-r-0' : 'rounded-r',
            ]"
            :title="'Reset field values to ' + resets[0] + ' Reset'"
            @click="resetValues()"
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
        </div>

        <!-- Menu with buttons to reset to other reset states -->
        <div
          v-if="showResets"
          id="reset-states-div"
          class="fixed z-50 mr-8 w-[calc(9.5rem+2px)] divide-y rounded-b border border-t-0 border-gray-400 bg-white"
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
</template>
