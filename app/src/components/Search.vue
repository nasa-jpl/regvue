<script setup lang="ts">
import { ref, Ref, computed, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import store from "../store";
import { createSearchIndex } from "../search";
import { Suggestion } from "../types";
import { Index, Query } from "lunr";

import AppleKeyboardCommand from "vue-material-design-icons/AppleKeyboardCommand.vue";
import Magnify from "vue-material-design-icons/Magnify.vue";
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
      boost: 50,
    }); // contains the query, no formatting

    // fuzzy search if the query is longer than 3 characters
    if (term.length > 3) {
      q.term(term, {
        editDistance: 2,
      });
      q.term(term, {
        usePipeline: false,
        wildcard: Query.wildcard.LEADING | Query.wildcard.TRAILING,
        editDistance: 2,
      });
    }
  });

  // Limit the amount of search results to return (helps decrease render lag)
  searchResults.length = Math.min(searchResults.length, 25);

  // Sort elements with same search score alphabetically
  searchResults.sort((a, b) => {
    if (a.score > b.score) {
      return -1;
    } else if (b.score > a.score) {
      return 1;
    } else {
      return a.ref.localeCompare(b.ref);
    }
  });

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
        type: "field",
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

const isMac = navigator.userAgent.includes("Mac");

const focusOnInput = () => {
  (document.getElementById("search-input") as HTMLInputElement).focus();
};

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

// Add a keyboard shortcut to open the search box
onBeforeMount(() => {
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key == "k") {
      event.preventDefault();

      if (focused.value) {
        focused.value = false;
        focusIndex.value = -1;
        (document.getElementById("search-input") as HTMLInputElement).blur();
      } else {
        (document.getElementById("search-input") as HTMLInputElement).focus();
      }
    }
  });
});
</script>

<template>
  <!-- Show the input box display area -->
  <div
    class="z-50 flex h-fit w-56 flex-row justify-between rounded bg-white px-1 lg:absolute lg:left-[50%] lg:top-0 lg:mt-[0.3625rem] lg:translate-x-[-50%]"
    :class="focused ? 'outline outline-2 outline-blue-500' : ''"
    @click="focusOnInput"
  >
    <!-- Display the magnifying icon and input box on the left -->
    <div class="flex flex-row">
      <!-- Show a magnifying glass icon -->
      <magnify class="mt-[0.0625rem] mr-1 text-gray-400" />

      <!-- Show the input box that is bound to the query string -->
      <input
        id="search-input"
        :value="query"
        type="search"
        aria-label="Search"
        placeholder="Search"
        class="my-1 text-sm focus:outline-none sm:w-20 md:w-36"
        autocomplete="off"
        spellcheck="false"
        @input="updateQuery"
        @keyup.enter="focusIndex >= 0 ? go(suggestions[focusIndex]) : null"
        @keydown.down.prevent="focus(focusIndex + 1)"
        @keydown.up.prevent="focus(focusIndex - 1)"
        @keydown.escape="
          focused = false;
          focusIndex = -1;
          ($event.target as HTMLElement).blur();
        "
        @focus="
          focused = true;
          focusIndex = 0;
        "
      />
    </div>

    <!-- Display the keyboard shortcut to focus the search box on the right -->
    <div class="my-auto">
      <!-- Only show the shortcut if the input isn't focused -->
      <div
        v-if="!focused"
        class="flex h-fit flex-row rounded bg-gray-200 px-1 text-base text-gray-500/80"
      >
        <!-- Change the displayed icon based on if mac or windows -->
        <template v-if="isMac">
          <apple-keyboard-command id="apple-command-key" />
          <span class="mt-[0.05rem] text-[0.99rem]">K</span>
        </template>
        <div v-else id="window-ctrl-key" class="text-[0.8rem]">Ctrl+K</div>
      </div>
    </div>
  </div>

  <!-- Show grayed-out the background and suggestions window when the input is focused -->
  <div
    class="absolute top-2 z-40 mr-4 w-screen rotate-0 text-center text-base"
    @keydown.escape="
      focused = false;
      focusIndex = -1;
    "
  >
    <div
      v-if="focused"
      id="search-suggestions-div"
      class="absolute z-40 m-0 h-screen w-screen bg-gray-300/50 p-0 text-left backdrop-blur-lg"
      @click="
        focused = false;
        focusIndex = -1;
      "
    >
      <div
        class="relative top-9 z-50 m-auto mt-2 w-[450px] border border-black bg-white"
      >
        <!-- Search results header -->
        <div class="bg-blue-900 px-2 py-1 text-center text-white">
          {{ showSuggestions ? "Results" : "Recent Searches" }}
        </div>

        <section class="max-h-[500px] overflow-y-scroll">
          <!-- Display the search results if available and showSuggestions is true -->
          <template v-if="showSuggestions && suggestions.length > 0">
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
          </template>

          <!-- Display a section if there are no results -->
          <template v-else-if="showSuggestions && suggestions.length == 0">
            <div class="my-10 bg-white text-center text-sm text-gray-500">
              No results
            </div>
          </template>

          <!-- Display the recent searches if available and showSuggestions is false -->
          <div
            v-else-if="!showSuggestions && recentSuggestions.length"
            class="mb-4"
          >
            <div
              v-for="(suggestion, i) in recentSuggestions.slice().reverse()"
              :key="suggestion.name + i"
              class="flex flex-row justify-between"
              @mouseenter="focus(i, false)"
              @mouseleave="focus(-1, false)"
            >
              <SearchResult
                class="mr-0 mb-0 grow"
                :suggestion="suggestion"
                :index="i"
                :focus-index="focusIndex"
                :query="query"
                @mousedown="go(suggestion)"
              />
              <!-- Show an "x" button on the right side that will remove the recent suggestion -->
              <button
                class="z-[60] mt-3 px-3 text-gray-500 hover:cursor-pointer"
                @click.stop.prevent="removeRecentSuggestion(suggestion)"
              >
                x
              </button>
            </div>
          </div>

          <!-- Display a message if there are no recent suggestions to show -->
          <div
            v-else-if="!showSuggestions && !recentSuggestions.length"
            class="flex min-h-[125px] w-full flex-col justify-center bg-white text-center text-sm text-gray-500"
          >
            <p>No recent searches</p>
          </div>
        </section>

        <!-- Display the navigation options as icons -->
        <div
          class="flex flex-row content-center justify-between space-x-2 border-t border-gray-300 p-2 text-gray-400"
        >
          <!-- Display the select icon -->
          <div class="flex flex-row">
            <div
              class="mt-[0.125rem] mr-1 h-5 w-5 rounded bg-gray-200 text-gray-800"
            >
              <div class="m-auto mt-1 h-fit w-fit text-sm">↩</div>
            </div>
            <div>select</div>
          </div>

          <!-- Display the navigation icons -->
          <div class="flex flex-row">
            <!-- <arrow-left-bottom id="select-icon" /> -->
            <div
              class="mt-[0.125rem] mr-1 h-5 w-5 rounded bg-gray-200 text-gray-800"
            >
              <div class="m-auto h-fit w-fit text-sm">↑</div>
            </div>
            <div
              class="mt-[0.125rem] mr-1 h-5 w-5 rounded bg-gray-200 text-gray-800"
            >
              <div class="m-auto h-fit w-fit text-sm">↓</div>
            </div>
            <span>navigate</span>
          </div>

          <!-- Display the exit icon -->
          <div class="flex flex-row">
            <div
              class="mt-[0.125rem] mr-1 flex h-5 w-7 justify-center rounded bg-gray-200 text-gray-800"
            >
              <div class="h-fit w-fit text-sm">esc</div>
            </div>
            <div>exit</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Make apple-keyboard-command icon smaller */
#apple-command-key > svg {
  width: 1rem;
}

#navigation-icon > svg {
  stroke: white;
  stroke-width: 0.5px;
  width: 1.5rem;
}

#select-icon > svg {
  width: 1.25rem;
  stroke: white;
  stroke-width: 0.5px;
}
</style>
