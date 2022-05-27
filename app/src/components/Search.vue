<script setup lang="ts">
import { ref, Ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Suggestion } from "../types";
import store from "../store";

const sharedState = ref(store.sharedState);
const router = useRouter();

// Search query
let query = ref("");

// Boolean on whether or not the search bar is in focus
let focused = ref(false);

// Index of the suggestion currently in focus
let focusIndex = ref(0);

// Array used to keep track of recently selected suggestions
let recentSuggestions: Ref<Suggestion[]> = ref([]);

// Create a list of entires that have register or field names that
// contain the query text
let suggestions = computed(() => {
  const formattedQuery = query.value.trim().toLowerCase();

  let res = {
    regs: [] as Suggestion[],
    fields: [] as Suggestion[],
    all: [] as Suggestion[],
  };

  if (!sharedState.value.data || !sharedState.value.fields) {
    return res;
  }

  // Registers
  for (let id in sharedState.value?.data?.elements) {
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
  return focused.value && query.value != "" && suggestions.value;
});

// Change the route to go to the selected suggestion
const go = (suggestion: Suggestion) => {
  // Remove the suggestion if already present to ensure no duplicates
  removeRecentSuggestion(suggestion);

  // Add the the recentSuggestions array and limit length to 5
  recentSuggestions.value.push(suggestion);
  recentSuggestions.value = recentSuggestions.value.slice(-5);

  // Change the route to the selected reg/field
  router.push(suggestion.path);

  // Deselect the search input box
  const searchElem = document.getElementById("search-input") as HTMLElement;
  searchElem.blur();

  // Reset search variables
  query.value = "";
  focusIndex.value = -1;
  focused.value = false;
};

const focus = (i: number) => {
  // The lowest focusIndex should be -1 for "unfocused"
  if (i < -1) {
    i = -1;
  }

  // Perform checks to ensure the focusIndex doesn't go out of bounds
  if (showSuggestions.value) {
    if (i > suggestions.value.all.length - 1) {
      i = suggestions.value.all.length - 1;
    }
  } else {
    if (i > recentSuggestions.value.length - 1) {
      i = recentSuggestions.value.length - 1;
    }
  }

  focusIndex.value = i;

  // Scroll the new focused element into view
  const elem = document.getElementById(`suggestion-${focusIndex.value}`);
  elem?.scrollIntoView({ block: "end" });
};

// Removes a suggestion from the recentSuggestions array if present
const removeRecentSuggestion = (suggestion: Suggestion) => {
  // Find the index of the suggestion to remove
  let idx = recentSuggestions.value.findIndex(
    (element) => element.name == suggestion.name
  );

  // Remove the suggestion if present
  if (idx != -1) {
    recentSuggestions.value.splice(idx, 1);
  }
};
</script>

<template>
  <div
    class="relative z-40 mr-4 rotate-0 text-base"
    @keydown.escape="
      focused = false;
      focusIndex = -1;
    "
  >
    <!-- Show the input box that is bound to the query string -->
    <input
      id="search-input"
      v-model="query"
      type="search"
      aria-label="Search"
      placeholder="Search"
      class="absolute z-50 p-1 text-sm"
      autocomplete="off"
      spellcheck="false"
      @keyup.enter="go(suggestions.all[focusIndex])"
      @keydown.down="focus(focusIndex + 1)"
      @keydown.up="focus(focusIndex - 1)"
      @keydown.left.prevent="focus(0)"
      @keydown.right.prevent="
        showSuggestions
          ? focus(suggestions.all.length - 1)
          : focus(recentSuggestions.length - 1)
      "
      @keydown.escape="($event.target as HTMLElement).blur()"
      @focus="
        focused = true;
        focusIndex = 0;
      "
    />

    <!-- Display the list of suggestions if showSuggestions is true -->
    <div
      v-if="showSuggestions"
      id="search-suggestions-div"
      class="absolute z-40 m-0 h-screen w-screen bg-gray-300/50 p-0 text-left backdrop-blur-lg"
      @click="
        focused = false;
        focusIndex = -1;
      "
    >
      <div
        class="relative top-9 m-auto mt-2 max-h-[500px] w-[450px] overflow-y-scroll border border-black bg-white left-18"
      >
        <!-- Display a section for the register suggestions -->
        <section v-if="suggestions.regs.length > 0">
          <div class="bg-blue-900 px-2 py-1 text-center text-white">
            Registers
          </div>
          <ul>
            <!-- Display each individual suggestion -->
            <li
              v-for="(s, i) in suggestions.regs"
              :id="'suggestion-' + i"
              :key="i"
              class="border-b border-gray-300 px-2 hover:cursor-pointer hover:bg-gray-200 hover:text-green-700"
              :class="focusIndex == i ? 'bg-gray-200 text-green-700' : ''"
              @mousedown="go(s)"
              @mouseenter="focus(-1)"
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
          <div class="bg-blue-900 px-2 py-1 text-center text-white">Fields</div>
          <ul>
            <!-- Display each individual suggestion -->
            <li
              v-for="(s, i) in suggestions.fields"
              :id="'suggestion-' + (i + suggestions.regs.length)"
              :key="i + suggestions.regs.length"
              class="border-b border-gray-300 px-2 hover:cursor-pointer hover:bg-gray-200 hover:text-green-700"
              :class="
                focusIndex == i + suggestions.regs.length
                  ? 'bg-gray-200 text-green-700'
                  : ''
              "
              @mousedown="go(s)"
              @mouseenter="focus(-1)"
            >
              <!-- Show the name of the suggestion and truncate if too long -->
              <a :href="router.resolve(s.path).href" @click.prevent>
                <div class="truncate" :title="s.name">{{ s.name }}</div>
              </a>
            </li>
          </ul>
        </section>

        <!-- Display a section if there are no results -->
        <section v-if="suggestions.all.length == 0">
          <div class="bg-blue-900 px-2 py-1 text-center text-white">
            Results
          </div>
          <div class="my-10 bg-white text-center text-sm text-gray-500">
            No results
          </div>
        </section>
      </div>
    </div>

    <!-- If the query is empty ("") but the search box is focused show a list of recent searches -->
    <div
      v-else-if="focused"
      id="search-recents-div"
      class="absolute z-40 m-0 h-screen w-screen bg-gray-300/50 p-0 text-left backdrop-blur-lg"
      @click="
        focused = false;
        focusIndex = -1;
      "
    >
      <div
        class="relative top-9 m-auto mt-2 max-h-[500px] w-[450px] overflow-y-scroll border border-black bg-white left-18"
      >
        <section>
          <!-- Show section title -->
          <div class="bg-blue-900 px-2 py-1 text-center text-white">
            Recent Searches
          </div>

          <ul v-if="recentSuggestions.length" class="min-h-[125px] bg-white">
            <!-- Display each recent suggestion as a li -->
            <li
              v-for="(s, i) in recentSuggestions.slice().reverse()"
              :id="'suggestion-' + i"
              :key="i"
              class="border-b border-gray-300 px-2 hover:cursor-pointer hover:bg-gray-200 hover:text-green-700"
              :class="focusIndex == i ? 'bg-gray-200 text-green-700' : ''"
              @mouseenter="focus(-1)"
            >
              <div class="flex flex-row justify-between">
                <!-- Show the name of the suggestion and truncate if too long -->
                <a
                  :href="router.resolve(s.path).href"
                  class="grow"
                  @click.prevent="go(s)"
                >
                  <div class="truncate" :title="s.name">{{ s.name }}</div>
                </a>

                <!-- Show an "x" button on the right side that will remove the recent suggestion -->
                <button
                  class="z-50 pl-3 pr-1 text-gray-500 hover:cursor-pointer"
                  @click.stop="removeRecentSuggestion(s)"
                >
                  x
                </button>
              </div>
            </li>
          </ul>

          <!-- Display a message if there are no recent suggestions to show -->
          <div
            v-else
            class="flex min-h-[125px] flex-col justify-center bg-white text-center text-sm text-gray-500"
          >
            <p>No recent searches</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
