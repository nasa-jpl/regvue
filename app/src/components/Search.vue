<script setup lang="ts">
import { computed, ref, Ref, onBeforeMount, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Query } from "lunr";
import { createSearchIndex } from "src/search";
import { Suggestion } from "src/types";
import { useStore } from "src/store";

import AppleKeyboardCommand from "vue-material-design-icons/AppleKeyboardCommand.vue";
import Magnify from "vue-material-design-icons/Magnify.vue";
import SearchResult from "src/components/SearchResult.vue";

const route = useRoute();
const router = useRouter();
const store = useStore();

// Create the search object
let searchObject = createSearchIndex(store.elements);

// Search query
let query = ref("");

// Boolean on whether or not the search bar is in focus
let focused = ref(false);

// Index of the suggestion currently in focus
let focusIndex = ref(0);

const isMac = navigator.userAgent.includes("Mac");

// Array used to keep track of recently selected suggestions
let recentSuggestions: Ref<Suggestion[]> = ref([]);

// Create a list of entires that match the search query
let suggestions = computed(() => {
  let res: Suggestion[] = [];
  if (!store.elements || store.elements.size == 0) {
    return res;
  }

  // Remove whitespace and make the search query lowercase
  const term = query.value.trim().toLowerCase();

  // Search for index entries that match the formatted query
  const searchResults = searchObject.query((q: Query) => {
    q.term(term, { boost: 100 }); // exact match

    // Can't check for embedded term if term is only 1 character due to lunr error
    // https://github.com/olivernn/lunr.js/issues/279
    if (term.length > 1) {
      q.term(term, {
        usePipeline: false,
        wildcard: Query.wildcard.LEADING | Query.wildcard.TRAILING,
        boost: 50,
      }); // contains the query, no formatting
    } else {
      q.term(term, {
        usePipeline: false,
        wildcard: Query.wildcard.TRAILING,
        boost: 50,
      }); // starts with the query, no formatting
    }

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
      if (id.split(":").length != 2) {
        throw Error(`Invalid field id passed: ${id}.`);
      }
      const [regId, fieldName] = id.split(":");
      if (!regId || !fieldName) {
        throw Error(`Invalid field id: ${regId}:${fieldName}.`);
      }

      const path = {
        name: "element",
        params: { elementId: regId.split(".") },
        query: route.query.data
          ? { field: fieldName, data: route.query.data }
          : { field: fieldName },
      };

      const suggestion = {
        type: "field" as Suggestion["type"],
        name: fieldName,
        path: path,
      };
      res.push(suggestion);
    } else {
      // Otherwise it is a register/mem entry

      const item = store.elements.get(id);
      if (!item) {
        throw Error(`Could not find ${id} in elements list.`);
      }

      const path = {
        name: "element",
        params: { elementId: id.split(".") },
        query: route.query.data ? { data: route.query.data } : {},
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

const focusOnInput = () => {
  (document.getElementById("search-input") as HTMLInputElement).focus();
};

// Update the query value
let timer: number;
const updateQuery = () => {
  clearTimeout(timer);

  // Add a buffer before updating to prevent lag
  timer = setTimeout(() => {
    const elem = document.getElementById("search-input") as HTMLInputElement;
    query.value = elem.value;
  }, 150); // delay updating the search query by this amount in milliseconds
};

// Change the route to go to the selected suggestion
const go = (suggestion: Suggestion | number, suggestions?: Suggestion[]) => {
  // If a number was passed for suggestion get the suggestion at that index from suggestions
  if (typeof suggestion == "number") {
    // Ensure an array for suggestions was passed
    if (suggestions) {
      // Ensure there is a valid suggestion at the given index
      if (!suggestions[suggestion]) {
        throw Error(`Could not find suggestion with index ${suggestion}`);
      }
      suggestion = suggestions[suggestion] as Suggestion;
    } else {
      throw Error(
        `Used numeric index to find Suggestion without providing suggestions array.`
      );
    }
  }

  // Remove the suggestion if already present to ensure no duplicates
  removeRecentSuggestion(suggestion);

  // Add the the recentSuggestions array and limit length to 5
  recentSuggestions.value.push(suggestion);
  recentSuggestions.value = recentSuggestions.value.slice(-5);

  // Change the route to the selected reg/field
  router.push(suggestion.path);

  // Deselect the search input box
  const searchElem = document.getElementById(
    "search-input"
  ) as HTMLInputElement;
  searchElem.value = "";
  searchElem.blur();

  // Reset search variables
  query.value = "";
  focusIndex.value = -1;
  focused.value = false;
};

// Returns the href attribute that a suggestion maps to
const getSuggestionLink = (suggestion: Suggestion) => {
  return router.resolve(suggestion.path).href;
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

// Toggles the focus of the search window based on keyboard event
const useKeyboardShortcut = (event: KeyboardEvent) => {
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
};

// Add the keyboard shortcut to open the search box
onBeforeMount(() => {
  document.addEventListener("keydown", useKeyboardShortcut);
});

// Remove the keyboard shortcut to avoid collisions the next time
// the component is mounted
onUnmounted(() => {
  document.removeEventListener("keydown", useKeyboardShortcut);
});

// Rebuild the search index if the store changes
watch(
  () => store.elements,
  () => {
    searchObject = createSearchIndex(store.elements);

    recentSuggestions.value = [];
    query.value = "";
  }
);
</script>

<template>
  <!-- Show the input box display area -->
  <div
    id="search-input-div"
    class="z-50 flex h-fit w-36 flex-row justify-between rounded bg-white px-1 md:w-56 lg:absolute lg:left-[50%] lg:top-[0.125rem] lg:mt-[0.3625rem] lg:translate-x-[-50%]"
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
        type="search"
        aria-label="Search"
        placeholder="Search"
        class="my-1 w-16 text-sm focus:outline-none md:w-36"
        autocomplete="off"
        spellcheck="false"
        @input="updateQuery"
        @keyup.enter="
          ($event: Event) => {
            if (focusIndex < 0) {
              focused = false;
              focusIndex = -1;
              ($event.target as HTMLInputElement).blur();
            }
            else if (showSuggestions) {
              go(focusIndex, suggestions);
            } else {
              go(recentSuggestions.length - 1 - focusIndex, recentSuggestions);
            }
          }
        "
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
    v-if="focused"
    class="absolute top-2 z-40 mr-4 w-screen rotate-0 text-center text-base"
    @keydown.escape="
      focused = false;
      focusIndex = -1;
    "
  >
    <div
      id="search-background-div"
      class="absolute z-40 m-0 h-screen w-screen bg-gray-300/50 p-0 text-left backdrop-blur-lg"
      @click="
        focused = false;
        focusIndex = -1;
      "
    >
      <div
        class="relative top-9 z-50 m-auto mt-2 w-[450px] rounded-lg border border-black bg-white"
      >
        <!-- Search results header -->
        <div class="rounded-t-lg bg-blue-900 px-2 py-1 text-center text-white">
          {{ showSuggestions ? "Results" : "Recent Searches" }}
        </div>

        <section class="max-h-[500px] overflow-y-scroll">
          <!-- Display the search results if available and showSuggestions is true -->
          <div
            v-if="showSuggestions && suggestions.length > 0"
            id="search-results-div"
          >
            <a
              v-for="(suggestion, i) in suggestions"
              :key="i"
              :href="getSuggestionLink(suggestion)"
            >
              <SearchResult
                :key="suggestion.name + i"
                :suggestion="suggestion"
                :index="i"
                :focus-index="focusIndex"
                :query="query"
                @mousedown="go(suggestion)"
                @mouseenter="focus(i, false)"
                @mouseleave="focus(-1, false)"
              />
            </a>
          </div>

          <!-- Display a section if there are no results -->
          <div
            v-else-if="showSuggestions && suggestions.length == 0"
            id="no-search-results-div"
            class="flex min-h-[102px] w-full flex-col justify-center bg-white text-center text-sm text-gray-500"
          >
            No results
          </div>

          <!-- Display the recent searches if available and showSuggestions is false -->
          <div
            v-else-if="!showSuggestions && recentSuggestions.length"
            id="recent-searches-div"
            class="mb-4"
          >
            <div
              v-for="(suggestion, i) in recentSuggestions.slice().reverse()"
              :key="suggestion.name + i"
              class="flex flex-row justify-between"
              @mouseenter="focus(i, false)"
              @mouseleave="focus(-1, false)"
            >
              <a class="grow" :href="getSuggestionLink(suggestion)">
                <SearchResult
                  class="mr-0 mb-0"
                  :suggestion="suggestion"
                  :index="i"
                  :focus-index="focusIndex"
                  :query="query"
                  @mousedown="go(suggestion)"
                />
              </a>

              <!-- Show an "x" button on the right side that will remove the recent suggestion -->
              <button
                :id="'remove-recent-search-btn-' + i"
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
            id="no-recent-searches-div"
            class="flex min-h-[102px] w-full flex-col justify-center bg-white text-center text-sm text-gray-500"
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
