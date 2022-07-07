<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { DesignElement, DesignRoot, MenuNode } from "src/types";
import { useStore } from "src/store";
import format from "src/format";

import MenuDown from "vue-material-design-icons/MenuDown.vue";
import MenuRight from "vue-material-design-icons/MenuRight.vue";

defineProps<{
  menuVisible: boolean;
}>();

const emit = defineEmits(["menu-collapsed", "resize", "toggle-menu"]);

const router = useRouter();
const route = useRoute();
const store = useStore();

const currentElement = computed(() => {
  try {
    return (route.params.elementId as string[]).join(".");
  } catch {
    return "";
  }
});

// Combine a MenuNode's name and version
const getDisplayName = (node: MenuNode) => {
  let result = node.data.name;

  if (node.data.version) {
    result += " - " + node.data.version;
  }

  return result;
};

// Parses the store to generate an tree of MenuNode objects
const getNodes = (
  elements: Map<string, DesignElement>,
  element: DesignElement | DesignRoot
) => {
  if (!element.children) return [];

  return element.children.map((child_id) => {
    const child = elements.get(child_id);
    if (!child) {
      throw Error(`Could not find element with id ${child_id}`);
    }

    const node = {
      key: child.id,
      styleClass: child.id,
      data: {
        name: child.display_name ? child.display_name : child.name,
        version: child.version,
        addr: format.hex(child.addr || 0),
      },
    } as MenuNode;

    if (child.children) {
      node.children = getNodes(elements, child);
    }

    return node;
  });
};
let menuNodes = reactive(getNodes(store.elements, store.root));
watch(
  () => store.elements,
  () => (menuNodes = getNodes(store.elements, store.root))
);

// From the tree structure of MenuNodes create a flat list of all nodes and add
// a "depth" attribute and determine whether the node should be visible
const nodes = ref(
  computed(() => {
    let result: MenuNode[] = [];

    const addNode = (node: MenuNode, depth = 0) => {
      node.depth = depth;
      result.push(node);

      if (node.children) {
        node.children.forEach((child: MenuNode) => {
          // Only mark a node as visible if it's parent node should be open
          if (currentElement.value == child.key) {
            openChildrenNodes(node);
          } else if (
            // Ensure children further down the tree are not visible
            currentElement.value.includes(child.key) &&
            !child.key.includes(currentElement.value)
          ) {
            openChildrenNodes(node);
          }
          addNode(child, depth + 1);
        });
      }
    };

    menuNodes.forEach((node: MenuNode) => {
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

  const parent = elem?.parentNode as HTMLElement;
  parent?.scroll(0, (elem?.offsetTop || 0) - 500);
};

// Perform initial scroll to element on page load
onMounted(async () => {
  scrollToElement(currentElement.value);
});

// Change the route when a node is clicked on
const getNodeHref = (key: string) => {
  return router.resolve({
    name: "element",
    params: { elementId: key.split(".") },
    query: { data: route.query.data },
  }).href;
};

// Keep track of when the resize bar is being dragged
let beingDragged = ref(false);

onMounted(() => {
  const resizer = document.querySelector("#resizer");
  const sidebar = document.querySelector("#sidebar") as HTMLElement;

  // Call resizeSidebar() while the mouse is down
  resizer?.addEventListener("mousedown", () => {
    beingDragged.value = true;

    document.body.style.userSelect = "none";

    document.addEventListener("mousemove", resizeSidebar, false);

    // Stop resizing on mouseup
    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", resizeSidebar, false);
        beingDragged.value = false;
        document.body.style.userSelect = "auto";

        // Emit "menu-collapsed" if the sidebar has been made the minimum size
        if (sidebar.style.flexBasis == "0.75rem") {
          emit("menu-collapsed");
        }
      },
      false
    );
  });

  // Resize the sidebar to match the mouse position
  const resizeSidebar = (e: MouseEvent) => {
    emit("resize");
    const size = `${e.x - 5}px`;
    if (e.x > 150 && e.x < 230) {
      sidebar.style.flexBasis = "230px";
    } else if (e.x <= 150) {
      sidebar.style.flexBasis = "0.75rem";
    } else if (sidebar) {
      sidebar.style.flexBasis = size;
    }
  };
});
</script>

<template>
  <div
    id="sidebar"
    class="flex h-full shrink-0 flex-row overflow-hidden"
    :class="menuVisible ? 'basis-[21rem]' : 'max-w-[0.75rem] basis-3'"
  >
    <div
      id="navigation-menu"
      class="text-md mt-[1px] flex h-full flex-grow flex-col overflow-y-scroll bg-white pb-12"
      :class="menuVisible ? '' : 'hidden'"
    >
      <!-- Show the nodes -->
      <div v-for="node in nodes" :id="node.key" :key="node.key">
        <!--  Display only if the node is marked visible -->
        <a
          v-if="node.isVisible"
          :id="'menu-node-' + node.key.replaceAll('.', '-')"
          class="flex flex-row justify-between space-x-4 border-y-[0.5px] px-4 hover:cursor-pointer hover:bg-gray-200"
          :class="node.key == currentElement ? 'bg-blue-200' : ''"
          :style="`padding-left: ${getIndent(node)}px`"
          :href="getNodeHref(node.key)"
        >
          <div
            class="flex flex-grow flex-row overflow-x-hidden"
            :title="getDisplayName(node)"
          >
            <!--  Display the name and the open button for a menu node-->
            <button class="z-10" @click.stop="toggleChildrenNodes(node)">
              <!-- Show a close button if the node has open children-->
              <template
                v-if="
                  node.children &&
                  node.children.length > 0 &&
                  node.children[0]?.isVisible
                "
              >
                <menu-down class="close-menu-node-btn" />
              </template>

              <!-- Show an open button if the node has closed children -->
              <template v-else-if="node.children">
                <menu-right class="open-menu-node-btn" />
              </template>
            </button>

            <!-- Display the name of the node and truncate it if it is too long -->
            <div class="ml-0 truncate text-left">
              {{ getDisplayName(node) }}
            </div>
          </div>
          <!-- Display the address of the node -->
          <div>
            {{ node.data.addr }}
          </div>
        </a>
      </div>
    </div>

    <!-- Show a draggable bar that will resize the menu width -->
    <div
      id="resizer"
      class="relative mt-[1px] flex-shrink-0 basis-3 border bg-gray-100 hover:cursor-col-resize"
      @dblclick="emit('toggle-menu')"
    ></div>
  </div>
</template>

<style>
/* Give the resize bar a small dot image icon */
#resizer {
  background-repeat: no-repeat;
  background-position: 50%;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==");
  cursor: col-resize;
}
</style>
