<script setup lang="ts">
import { ref, Ref, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import { DisplayType, Field } from "src/types";
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
let resetTableKey = ref(0);

// Control whether or not to display LSB or MSB first
let useByteSwap = ref(store.useByteSwap);

// Control what base the field/register values should be displayed in
let selectedDisplayType: Ref<DisplayType> = ref(store.selectedDisplayType);

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

// Reset each field value to a named reset state
const resetValues = (resetState: string) => {
  props.fields.forEach((field) => {
    if (field.reset.resets.includes(resetState)) {
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

  <!-- Row of buttons used to edit the display/value of the BitTable -->
  <BitTableButtons
    :regId="regId"
    :fields="fields"
    :selected-display-type="selectedDisplayType"
    :use-byte-swap="useByteSwap"
    @toggle-byte-swap="toggleByteSwap()"
    @update-display-type="updateDisplayType($event)"
    @reset-values="resetValues($event)"
  />
</template>
