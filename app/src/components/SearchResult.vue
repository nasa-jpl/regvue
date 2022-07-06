<script setup lang="ts">
/* eslint-disable vue/no-v-html */
import { ref, computed } from "vue";
import { Suggestion } from "src/types";
import format from "src/format";
import { useStore } from "src/store";

const props = defineProps<{
  suggestion: Suggestion;
  index: number;
  focusIndex: number;
  query: string;
}>();

const store = useStore();

const dataWidth = store.root.data_width;

const elementId = ref(props.suggestion.path.params.elementId.join("."));
const field = computed(() => {
  if (props.suggestion.path?.query?.field) {
    return props.suggestion.path.query.field;
  }
  return "";
});

const id = computed(() => {
  if (field.value) {
    return elementId.value + ":" + field.value;
  } else {
    return elementId.value;
  }
});

const doc = computed(() => {
  const element = store.elements.get(elementId.value);
  if (!element) {
    throw Error(`Register ${elementId.value} does not exist in elements array`);
  }

  if (field.value) {
    const fields = element.fields;

    if (!fields) return "";

    for (let fieldEntry of fields) {
      if (fieldEntry.name == field.value) {
        return fieldEntry.doc;
      }
    }
    return "";
  } else {
    return element.doc;
  }
});

const type = computed(() => {
  if (props.suggestion.type == "reg") return "Register";
  if (props.suggestion.type == "blk") return "Block";
  if (props.suggestion.type == "mem") return "Memory";
  if (props.suggestion.type == "field") return "Field";
  return props.suggestion.type;
});

// Get the address as a hexadecimal string
const addr = computed(() => {
  const element = store.elements.get(elementId.value);
  if (!element) {
    throw Error(`Element ${elementId.value} does not exist in elements array`);
  }

  const addr = element.addr;
  if (addr) {
    return format.getStringRepresentation(addr, "hexadecimal", dataWidth);
  } else {
    return "";
  }
});

// Returns HTML formatted text that will wrap any text that matches the query in <b> tags
const boldMatchingText = (text: string, query: string, replaceAll = true) => {
  // Escape any regex characters in the query string
  query = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  if (replaceAll) {
    return text.replaceAll(
      new RegExp(query, "ig"),
      (match) => `<b>${match}</b>`
    );
  } else {
    return text.replace(new RegExp(query, "i"), (match) => `<b>${match}</b>`);
  }
};
</script>

<template>
  <div
    :id="'suggestion-' + index"
    class="m-4 max-h-[6rem] overflow-x-hidden rounded border border-gray-300 bg-gray-100 px-2 text-sm hover:cursor-pointer hover:bg-gray-200"
    :class="focusIndex == index ? 'outline outline-2 outline-blue-500' : ''"
  >
    <!-- Show the name of the suggestion and truncate if too long -->
    <div :title="suggestion.name" class="flex flex-row justify-between">
      <div
        class="search-result-name text-lg"
        v-html="boldMatchingText(suggestion.name, query)"
      ></div>
      <div class="mt-1">{{ type }}</div>
    </div>

    <div class="flex flex-row justify-between">
      <!-- Show the full hierarchy path of the element -->
      <div
        class="max-w-[20rem] truncate"
        v-html="boldMatchingText(id, query)"
      ></div>

      <!-- Show the address of the element -->
      <div v-html="boldMatchingText(addr, query, false)"></div>
    </div>

    <!-- Show the doc if it is present -->
    <div v-if="doc" class="">
      <div class="overflow-y-hidden text-ellipsis text-gray-400">
        <!-- Will only show 2 lines of text -->
        <div
          class="line-clamp"
          v-html="
            boldMatchingText(doc.replaceAll('\n', '. ').substring(0, 50), query)
          "
        ></div>
      </div>
    </div>
  </div>
</template>

<style>
.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

b {
  /* Make bold text have text-green-700 tailwind class color */
  --tw-text-opacity: 1;
  color: rgb(21 128 61 / var(--tw-text-opacity));
}
</style>
