<script setup lang="ts">
import { ref, Ref, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { Bit, DisplayType, Field } from "src/types";
import parse from "src/parse";
import { useStore } from "src/store";

import BitTable from "src/components/BitTable.vue";
import BitTableButtons from "src/components/BitTableButtons.vue";

const props = defineProps<{
  regId: string;
  fields: Field[];
  selectedField?: string;
}>();

const emit = defineEmits([
  "highlight-field",
  "stop-highlight-field",
  "select-field",
]);

const store = useStore();

// Incrementing this key will force the BitTable to rerender
const resetTableKey = ref(0);

// Control whether to highlight differing fields
const showDiff = ref(false);

// Control whether or not to display LSB or MSB first
const useByteSwap = ref(store.useByteSwap);

// Control what base the field/register values should be displayed in
const selectedDisplayType: Ref<DisplayType> = ref(store.selectedDisplayType);

// Toggles the useByteSwap variable
const toggleByteSwap = () => {
  // Update store value so value persists on rerender
  store.useByteSwap = useByteSwap.value;
  useByteSwap.value = !useByteSwap.value;

  resetTableKey.value += 1;
};

const toggleShowDiff = () => {
  showDiff.value = !showDiff.value;
  resetTableKey.value += 1;
};

const updateDisplayType = (displayType: DisplayType) => {
  // Update store value so value persists on rerender
  store.selectedDisplayType = displayType;
  selectedDisplayType.value = displayType;

  resetTableKey.value += 1;
};

// Reset each field value to a named reset state
const resetValues = (resetState: string) => {
  props.fields.forEach((field) => {
    if (field.reset.resets.includes(resetState)) {
      field.value = field.value.map(() =>
        parse.stringToBitArray(field.reset.value.toString(), field.nbits)
      );
    } else {
      field.value = field.value.map(() =>
        parse.stringToBitArray("?", field.nbits)
      );
    }
  });

  resetTableKey.value += 1;
};

// Add an index to field.value
const addValuesRow = () => {
  props.fields.forEach((field) => {
    field.value.push(Array(field.nbits).fill(0 as Bit));
  });

  resetTableKey.value += 1;
};

// Remove the last added field value index
const removeValuesRow = () => {
  props.fields.forEach((field) => {
    if (field.value.length > 1) {
      field.value.pop();
    }
  });
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
    :show-diff="showDiff"
    :use-byte-swap="useByteSwap"
    @highlight-field="emit('highlight-field', $event)"
    @stop-highlight-field="emit('stop-highlight-field')"
    @select-field="emit('select-field', $event)"
  />

  <!-- Row of buttons used to edit the display/value of the BitTable -->
  <BitTableButtons
    :regId="regId"
    :fields="fields"
    :selected-display-type="selectedDisplayType"
    :show-diff="showDiff"
    :use-byte-swap="useByteSwap"
    @toggle-byte-swap="toggleByteSwap()"
    @toggle-show-diff="toggleShowDiff()"
    @update-display-type="updateDisplayType($event)"
    @reset-values="resetValues($event)"
    @add-values-row="addValuesRow()"
    @remove-values-row="removeValuesRow()"
  />
</template>
