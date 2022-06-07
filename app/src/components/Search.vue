<script setup lang="ts">
import { ref, Ref, computed, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import store from "../store";
import { createSearchIndex } from "../search";
import { Suggestion } from "../types";
import { Index, Query } from "lunr";

import SearchResult from "./SearchResult.vue";

const sharedState = ref(store.sharedState);
const router = useRouter();

// Create the search object
let searchObject: Index;
onBeforeMount(async () => {
  searchObject = await createSearchIndex();
});

// Search query
let query = ref("");

// Boolean on whether or not the search bar is in focus
let focused = ref(false);

// Index of the suggestion currently in focus
let focusIndex = ref(0);

// Array used to keep track of recently selected suggestions
let recentSuggestions: Ref<Suggestion[]> = ref([]);

// Create a list of entires that match the search query
let suggestions = computed(() => {
  let res: Suggestion[] = [];
  if (!sharedState.value.data || !sharedState.value.fields) {
    return res;
  }

  // Remove whitespace and make the search query lowercase
  const term = query.value.trim().toLowerCase();

  // Search for index entries that match the formatted query
  const searchResults = searchObject.query((q: Query) => {
    q.term(term, { boost: 100 }); // exact match
    q.term(term, {
      usePipeline: false,
      wildcard: Query.wildcard.LEADING | Query.wildcard.TRAILING,
      boost: 10,
    }); // contains the query, no formatting

    // fuzzy search if the query is longer than 3 characters
    if (term.length > 3) {
      q.term(term, {
        editDistance: 3,
      });
      q.term(term, {
        usePipeline: false,
        wildcard: Query.wildcard.LEADING | Query.wildcard.TRAILING,
        editDistance: 3,
      });
    }
  });

  // Limit the amount of search results to return (helps decrease render lag)
  searchResults.length = Math.min(searchResults.length, 25);

  // Create a Suggestion object for each query result
  for (const result of searchResults) {
    const id = result.ref;

    if (id.includes(":")) {
      // Fields will have the id "<reg id>:<field name>"
      const regid = id.split(":")[0];
      const fieldName = id.split(":")[1];

      const path = {
        name: "reg",
        params: { regid: regid },
        query: { field: fieldName },
      };

      const suggestion = {
        type: "fld",
        name: fieldName,
        path: path,
      };
      res.push(suggestion);
    } else {
      // Otherwise it is a register/mem entry

      const item = sharedState.value.data.elements[id];

      const path = {
        name: "reg",
        params: { regid: id },
      };

      const suggestion = {
        type: item.type,
        name: item.name,
        path: path,
      };
      res.push(suggestion);
    }
  }

  return res;
});

// Determine whether or not to show the suggestions
let showSuggestions = computed(() => {
  return focused.value && query.value != "" && suggestions.value;
});

// Update the query value
let timer: number;
const updateQuery = () => {
  clearTimeout(timer);
  const elem = document.getElementById("search-input") as HTMLInputElement;

  // Add a buffer before updating if query is small to prevent lag from
  // multiple searches for small queries
  if (elem.value.length < 3) {
    timer = setTimeout(() => {
      query.value = elem.value;
    }, 250); // delay updating the value by this amount in milliseconds
  } else {
    query.value = elem.value;
  }
};

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

const focus = (i: number, scrollIntoView = true) => {
  // The lowest focusIndex should be -1 for "unfocused"
  if (i < -1) {
    i = -1;
  }

  // Perform checks to ensure the focusIndex doesn't go out of bounds
  if (showSuggestions.value) {
    if (i > suggestions.value.length - 1) {
      i = suggestions.value.length - 1;
    }
  } else {
    if (i > recentSuggestions.value.length - 1) {
      i = recentSuggestions.value.length - 1;
    }
  }

  focusIndex.value = i;

  if (scrollIntoView) {
    const elem = document.getElementById("suggestion-" + i);
    elem?.scrollIntoView({ block: "nearest" });
  }
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
    class="absolute z-40 mr-4 w-screen rotate-0 text-center text-base"
    @keydown.escape="
      focused = false;
      focusIndex = -1;
    "
  >
    <!-- Show the input box that is bound to the query string -->
    <input
      id="search-input"
      :value="query"
      type="search"
      aria-label="Search"
      placeholder="Search"
      class="absolute top-2 z-50 translate-x-[-50%] p-1 text-sm"
      autocomplete="off"
      spellcheck="false"
      @input="updateQuery"
      @keyup.enter="focusIndex >= 0 ? go(suggestions[focusIndex]) : null"
      @keydown.down.prevent="focus(focusIndex + 1)"
      @keydown.up.prevent="focus(focusIndex - 1)"
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
        class="relative top-9 m-auto mt-2 w-[450px] border border-black bg-white"
      >
        <!-- Search results header -->
        <div class="bg-blue-900 px-2 py-1 text-center text-white">Results</div>
        <section
          v-if="suggestions.length > 0"
          class="max-h-[500px] overflow-y-scroll"
        >
          <!-- Display each individual suggestion -->
          <SearchResult
            v-for="(suggestion, i) in suggestions"
            :key="suggestion.name + i"
            :suggestion="suggestion"
            :index="i"
            :focus-index="focusIndex"
            :query="query"
            @mousedown="go(suggestion)"
            @mouseenter="focus(i, false)"
            @mouseleave="focus(-1, false)"
          />
        </section>

        <!-- Display a section if there are no results -->
        <section v-if="suggestions.length == 0">
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
        class="relative top-9 m-auto mt-2 w-[450px] border border-black bg-white"
      >
        <!-- Show recent searches section title -->
        <div class="bg-blue-900 px-2 py-1 text-center text-white">
          Recent Searches
        </div>
        <section class="max-h-[500px] overflow-y-scroll">
          <!-- Display each individual recent suggestion -->
          <template v-if="recentSuggestions.length">
            <div
              v-for="(suggestion, i) in recentSuggestions.slice().reverse()"
              :key="suggestion.name + i"
              class="flex flex-row justify-between hover:bg-gray-200"
              :class="focusIndex == i ? 'bg-gray-200 ' : ''"
              @mouseenter="focus(i, false)"
              @mouseleave="focus(-1, false)"
            >
              <SearchResult
                class="grow"
                :suggestion="suggestion"
                :index="i"
                :focus-index="focusIndex"
                :query="query"
                @mousedown="go(suggestion)"
              />
              <!-- Show an "x" button on the right side that will remove the recent suggestion -->
              <button
                class="z-50 pl-3 pr-1 text-gray-500 hover:cursor-pointer"
                @click.stop="removeRecentSuggestion(suggestion)"
              >
                x
              </button>
            </div>
          </template>

          <!-- Display a message if there are no recent suggestions to show -->
          <div
            v-else
            class="flex min-h-[125px] w-full flex-col justify-center bg-white text-center text-sm text-gray-500"
          >
            <p>No recent searches</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
