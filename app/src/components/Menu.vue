<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { MenuNode } from "src/types";
import store from "src/store";

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

        node.children.forEach((child: MenuNode) => {
          // Only mark a node as visible if it's parent node should be open
          if (routeName == child.key) {
            openChildrenNodes(node);
          } else if (
            // Ensure children further down the tree are not visible
            routeName.includes(child.key) &&
            !child.key.includes(routeName)
          ) {
            openChildrenNodes(node);
          }
          addNode(child, depth + 1);
        });
      }
    };

    props.nodes.forEach((node: MenuNode) => {
      addNode(node, 0);
      node.isVisible = true;
    });
    return result;
  })
);

// Determine whether to add or remove all children of a node from visibleKeys
const toggleChildrenNodes = (node: MenuNode) => {
  if (node.children == null || node.children == []) return;

  if (node.children[0]?.isVisible) {
    closeChildrenNodes(node);
  } else {
    openChildrenNodes(node);
  }
};

// Opens all children of a node
const openChildrenNodes = (node: MenuNode) => {
  if (node == null) return;

  if (node.children) {
    node.children.forEach((child: MenuNode) => (child.isVisible = true));
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
    result += (node.depth + 1) * 5;
  }

  return result;
};

// Scroll to element
const scrollToElement = (element_id: string) => {
  const elem = document.getElementById(element_id);
  if (!elem) {
    throw Error(`Could not find element with id ${element_id}`);
  } else {
    const parent = elem.parentNode as HTMLElement;
    if (parent) {
      parent.scroll(0, elem.offsetTop - 500);
    }
  }
};

// Perform initial scroll to element on page load
onMounted(async () => {
  await store.untilLoaded();
  scrollToElement(route.params.regid as string);
});

// Change the route when a node is clicked on
const onNodeSelect = (key: string) => {
  router.push({
    name: "reg",
    params: { regid: key },
    query: { data: route.query.data },
  });
};
</script>

<template>
  <div
    id="navigation-menu"
    class="text-md mt-[1px] flex flex-shrink-0 flex-col overflow-y-scroll border-r-2 pb-12"
  >
    <!-- Show the nodes -->
    <div v-for="node in nodes" :key="node.key" :id="node.key">
      <!--  Display only if the node is marked visible -->
      <div
        v-if="node.isVisible"
        :id="'menu-node-' + node.key.replaceAll('.', '-')"
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
                node.children[0]?.isVisible
              "
            >
              <menu-down class="close-menu-node-btn" />
            </span>

            <!-- Show an open button if the node has closed children -->
            <span v-else-if="node.children">
              <menu-right class="open-menu-node-btn" />
            </span>
          </div>

          <!-- Display the name of the node and truncate it if it is too long -->
          <div class="ml-0 w-40 truncate text-left">
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
