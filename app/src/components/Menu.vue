<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import MenuDown from "vue-material-design-icons/MenuDown.vue";
import MenuRight from "vue-material-design-icons/MenuRight.vue";

const props = defineProps({
  nodes: {
    type: Object,
    default: () => null,
  },
});
const visibleKeys = ref(new Set<string>());

const route = useRoute();
const router = useRouter();

// TODO when clicking on APD_SRAM_DMA, APB_SRAM's children become visible

// Given the nested structure of objects representing the nodes in the menu,
// create a flat list of all nodes and add a "depth" field determine whether the
// node should be visible
const nodes = ref(
  computed(() => {
    let result: any[] = [];

    const addNode = (node: any, depth = 0) => {
      node["depth"] = depth;
      result.push(node);

      if (node.children) {
        node.children.forEach((child: any) => {
          let routeName = (route.params?.regid as string) || "";

          // Only mark a node as visible if it's parent node should be open
          if (routeName.includes(child.key) && !child.key.includes(routeName)) {
            visibleKeys.value.add(child.key);
            openAllChildren(child);
          } else if (routeName == child.key) {
            // visibleKeys.value.add(child.key);
          }
          addNode(child, depth + 1);
        });
      }
    };

    props.nodes.forEach((node: any) => {
      addNode(node, 0);
      visibleKeys.value.add(node.key);
    });
    return result;
  })
);

// Determine whether to add or remove all children of a node from visibleKeys
const toggleChildren = (node: any) => {
  if (node.children == null || node.children == []) return;

  if (visibleKeys.value.has(node.children[0].key)) {
    closeAllChildren(node);
  } else {
    openAllChildren(node);
  }
};

// Opens all children of a node. Optionally recursive to open all grandchildren nodes
const openAllChildren = (node: any, recursive = false) => {
  if (node == null) return;

  if (node.children) {
    node.children.forEach((child: any) => {
      visibleKeys.value.add(child.key);

      if (recursive) {
        openAllChildren(child);
      }
    });
  }
};

// Adds all children of a node to visibleKeys
const closeAllChildren = (node: any) => {
  if (node == null) return;

  if (node.children) {
    node.children.forEach((child: any) => {
      visibleKeys.value.delete(child.key);
      closeAllChildren(child);
    });
  }
};

// Return the left margin indent in pixels for a menu node
const getIndent = (node: any) => {
  let result = 0;

  // Add an extra indent if there are no children to account for the missing button
  if (!node.children) {
    result += 25;
  }

  // 5px of margin per depth level
  result += (node.depth + 1) * 7;

  return result;
};

// Scroll to element
const scrollToElement = (element_id: string) => {
  const elems = document.getElementsByClassName(element_id);
  if (elems.length) {
    let elem = elems[0];
    elem.scrollIntoView({ block: "center" });
  }
};
// Perform initial scroll to element on page load
if (route.params.regid) {
  const reg = route.params.regid as string;
  const regArray = reg.split(".");
  const lastReg = regArray[regArray.length - 1];
  scrollToElement(lastReg);
}

// Change the route when a node is clicked on
const onNodeSelect = (key: string) => {
  router.push({
    name: "reg",
    params: { regid: key },
  });
};
</script>

<!-- TODO keep selected node highlighted -->
<template>
  <div class="text-md flex flex-shrink-0 flex-col overflow-y-scroll border-r-2">
    <!-- Display the headers -->

    <!-- Show values -->
    <div class="mt-1">
      <div v-for="node in nodes" :key="node">
        <!--  Display only if the node is marked visible -->
        <div
          v-if="visibleKeys.has(node.key)"
          :id="node.key"
          class="flex flex-row justify-between space-x-4 border-y-[0.5px] px-4 hover:cursor-pointer hover:bg-gray-200"
          :style="`padding-left: ${getIndent(node)}px`"
          @click="onNodeSelect(node.key)"
        >
          <div class="flex flex-row justify-between" :title="node.data.name">
            <!--  Display the name and the open button for a menu node-->
            <div class="z-10" @click.stop="toggleChildren(node)">
              <span
                v-if="
                  node.children &&
                  node.children.length > 0 &&
                  visibleKeys.has(node.children[0].key)
                "
              >
                <menu-down />
              </span>

              <span v-else-if="node.children">
                <menu-right />
              </span>
            </div>

            <!-- Display the name of the node and truncate it if it is too long -->
            <div
              class="ml-0 w-40 truncate text-ellipsis text-left"
              :class="node.key"
            >
              {{ node.data.name }}
            </div>
          </div>
          <!-- Display the address of the node -->
          <div>
            {{ node.data.addr }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
