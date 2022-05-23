<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import store from "../store";

const sharedState = ref(store.sharedState);
const router = useRouter();

// Search query
let query = ref("");

// Boolean on whether or not the search bar is in focus
let focused = ref(false);

// Index of the suggestion currently in focus
let focusIndex = ref(0);

// Interfaces that defines the properties on a entry in the list
// of suggestions
interface Suggestion {
  type: string;
  name: string;
  path: {
    name: string;
    params: {
      regid: string;
    };
  };
}

// Create a list of entires that have register or field names that
// contain the query text
let suggestions = computed(() => {
  const formattedQuery = query.value.trim().toLowerCase();

  let res = {
    regs: [] as Suggestion[],
    fields: [] as Suggestion[],
    all: [] as Suggestion[],
  };

  // Registers
  for (let id in sharedState.value.data.elements) {
    let item = sharedState.value.data.elements[id];

    if (
      item.type == "reg" &&
      item.name.toLowerCase().includes(formattedQuery)
    ) {
      let path = {
        name: "reg",
        params: { regid: id },
      };

      let suggestion = {
        type: "Register",
        name: id,
        path: path,
      };

      res.regs.push(suggestion);
      res.all.push(suggestion);
    }
  }

  // Fields
  for (let [field_id, element_id] of sharedState.value.fields) {
    let fieldName = field_id.replace(/.*\./, "");
    if (fieldName.toLowerCase().includes(formattedQuery)) {
      const path = {
        name: "field",
        params: {
          regid: element_id,
          fieldName: fieldName,
        },
      };

      const suggestion = {
        type: "Field",
        name: field_id,
        path: path,
      };

      res.fields.push(suggestion);
      res.all.push(suggestion);
    }
  }

  return res;
});

// Determine whether or not to show the suggestions
let showSuggestions = computed(() => {
  return focused.value && suggestions.value && suggestions.value.all.length;
});

// Change the route to point to the selected suggestion
const go = (i: number) => {
  if (!showSuggestions.value) return;

  let path = suggestions.value.all[i].path;
  router.push(path);
  query.value = "";
  focusIndex.value = -1;
  focused.value = false;
};

const focus = (i: number) => {
  focusIndex.value = i;
};

const unfocus = () => {
  focusIndex.value = -1;
};
</script>

<template>
  <div class="relative mr-4 text-base">
    <!-- Show the input box that is bound to the query string -->
    <input
      v-model="query"
      type="search"
      aria-label="Search"
      placeholder="Search"
      class="p-1 text-sm"
      autocomplete="off"
      spellcheck="false"
      @keyup.enter="go(focusIndex)"
      @focus="focused = true"
      @blur="focused = false"
    />

    <!-- Display the list of suggestions if showSuggestions is true -->
    <div
      v-if="showSuggestions"
      class="absolute top-8 -right-0 z-50 mt-2 max-h-[500px] w-[450px] overflow-y-scroll border border-black bg-white"
      @mouseleave="unfocus"
    >
      <!-- Display a section for the register suggestions -->
      <section v-if="suggestions.regs.length > 0">
        <div class="bg-blue-900 px-2 py-1 text-white">Registers</div>
        <ul>
          <li
            v-for="(s, i) in suggestions.regs"
            :key="i"
            class="border-b border-gray-300 px-2 hover:cursor-pointer hover:bg-gray-200 hover:text-green-700"
            @mousedown="go(i)"
            @mouseenter="focus(i)"
          >
            <!-- Show the name of the suggestion and truncate if too long -->
            <a :href="router.resolve(s.path).href" @click.prevent>
              <div class="truncate" :title="s.name">{{ s.name }}</div>
            </a>
          </li>
        </ul>
      </section>

      <!-- Display a section for the field suggestions -->
      <section v-if="suggestions.fields.length > 0">
        <div class="bg-blue-900 px-2 py-1 text-white">Fields</div>
        <ul>
          <li
            v-for="(s, i) in suggestions.fields"
            :key="i + suggestions.regs.length"
            class="border-b border-gray-300 px-2 hover:cursor-pointer hover:bg-gray-200 hover:text-green-700"
            @mousedown="go(i + suggestions.regs.length)"
            @mouseenter="focus(i + suggestions.regs.length)"
          >
            <!-- Show the name of the suggestion and truncate if too long -->
            <a :href="router.resolve(s.path).href" @click.prevent>
              <div class="truncate" :title="s.name">{{ s.name }}</div>
            </a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
