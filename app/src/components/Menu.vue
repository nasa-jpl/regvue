<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MenuNode } from "../types";

import MenuDown from "vue-material-design-icons/MenuDown.vue";
import MenuRight from "vue-material-design-icons/MenuRight.vue";

const props = defineProps<{
  nodes: MenuNode[];
}>();

const router = useRouter();
const route = useRoute();

// Given the nested structure of objects representing the nodes in the menu,
// create a flat list of all nodes and add a "depth" field and determine whether
// the node should be visible
const nodes = ref(
  computed(() => {
    let result: MenuNode[] = [];

    const addNode = (node: MenuNode, depth = 0) => {
      node.depth = depth;
      result.push(node);

      if (node.children) {
        let routeName = (route.params?.regid as string) || "";
        let routeArr = routeName.split(".");

        node.children.forEach((child: MenuNode) => {
          // Only mark a node as visible if it's parent node should be open
          if (routeName == child.key) {
            child.isVisible = true;
          } else if (
            // Check that each block of the child is in the route
            child.key.split(".").every((val) => routeArr.includes(val))
          ) {
            child.isVisible = true;
            openChildrenNodes(child);
          }
          addNode(child, depth + 1);
        });
      }
    };

    props.nodes.forEach((node: MenuNode) => {
      addNode(node, 0);
      // visibleKeys.value.add(node.key);
      node.isVisible = true;
    });
    return result;
  })
);

// Determine whether to add or remove all children of a node from visibleKeys
const toggleChildrenNodes = (node: MenuNode) => {
  if (node.children == null || node.children == []) return;

  // if (visibleKeys.value.has(node.children[0].key)) {
  if (node.children[0].isVisible) {
    closeChildrenNodes(node);
  } else {
    openChildrenNodes(node);
  }
};

// Opens all children of a node
// Optionally recursive to open all grandchildren nodes
const openChildrenNodes = (node: MenuNode, recursive = false) => {
  if (node == null) return;

  if (node.children) {
    node.children.forEach((child: MenuNode) => {
      child.isVisible = true;

      if (recursive) {
        openChildrenNodes(child, true);
      }
    });
  }
};

// Adds the keys of all the children of a node to visibleKeys
const closeChildrenNodes = (node: MenuNode) => {
  if (node == null) return;

  if (node.children) {
    node.children.forEach((child: MenuNode) => {
      // visibleKeys.value.delete(child.key);
      child.isVisible = false;
      closeChildrenNodes(child);
    });
  }
};

// Return the left margin indent in pixels for a menu node
const getIndent = (node: MenuNode) => {
  let result = 0;

  // Add an extra indent if there are no children to account for the missing button
  if (!node.children) {
    result += 25;
  }

  if (node.depth) {
    // 5px of margin per depth level
    result += (node.depth + 1) * 7;
  }

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

<template>
  <div class="text-md flex flex-shrink-0 flex-col overflow-y-scroll border-r-2">
    <!-- Show the nodes -->
    <div v-for="node in nodes" :key="node.key">
      <!--  Display only if the node is marked visible -->
      <div
        v-if="node.isVisible"
        :id="node.key"
        class="flex flex-row justify-between space-x-4 border-y-[0.5px] px-4 hover:cursor-pointer hover:bg-gray-200"
        :class="node.key == route.params.regid ? 'bg-blue-200' : ''"
        :style="`padding-left: ${getIndent(node)}px`"
        @click="onNodeSelect(node.key)"
      >
        <div class="flex flex-row justify-between" :title="node.data.name">
          <!--  Display the name and the open button for a menu node-->
          <div class="z-10" @click.stop="toggleChildrenNodes(node)">
            <!-- Show a close button if the node has open children-->
            <span
              v-if="
                node.children &&
                node.children.length > 0 &&
                node.children[0].isVisible
              "
            >
              <menu-down />
            </span>

            <!-- Show an open button if the node has closed children -->
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
</template>
