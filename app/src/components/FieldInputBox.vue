<script setup lang="ts">
import { ref, nextTick } from "vue";
import { RegisterField, type DisplayType } from "../types";
import format from "../format";

const props = defineProps<{
  field: RegisterField;
  selectedDisplayType: DisplayType;
}>();
const emit = defineEmits(["select-field", "value-changed"]);

// Determines whether or not to show the input box
let active = ref(false);

// Hide the input box and remove the highlight
const deactivate = () => {
  active.value = false;
  emit("select-field", false);
};

// Show the input box, select it, and emit 'select-field' to highlight it
const activate = () => {
  active.value = true;
  emit("select-field", true);

  nextTick(() => {
    const elem = document.getElementById(
      "fieldInput-" + props.field.name
    ) as HTMLInputElement;
    elem.select();
  });
};

// Deactivate the input box and emit the value change
const updateValue = () => {
  const elem = document.getElementById(
    "fieldInput-" + props.field.name
  ) as HTMLInputElement;
  const value = elem.value;
  emit("value-changed", value);

  deactivate();
};
</script>

<template>
  <!-- Show an input box that has a value seperate from the field.value -->
  <div v-if="active">
    <input
      :id="'fieldInput-' + field.name"
      type="text"
      :value="
        format.getStringRepresentation(
          field.value,
          selectedDisplayType,
          field.nbits
        )
      "
      class="w-full bg-inherit text-center shadow-sm"
      @blur="deactivate"
      @keydown.enter="updateValue"
      @keydown.tab="updateValue"
      @input="field.nbits == 1 ? updateValue() : null"
    />
  </div>

  <!-- Show a static div with the formatted field value -->
  <div v-else>
    <div
      :id="'fieldInput-' + field.name"
      class="w-full bg-inherit text-center"
      @click="activate"
    >
      {{
        format.getStringRepresentation(
          field.value,
          selectedDisplayType,
          field.nbits
        )
      }}
    </div>
  </div>
</template>
