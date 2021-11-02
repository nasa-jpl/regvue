<template>
  <div class="sidebar">
    <TreeTable class="p-treetable-sm" :value="nodes" :expandedKeys="expandedKeys"
      :scrollable="true" scrollHeight="100vh"
      v-model:selectionKeys="selectionKeys" selectionMode="single" @node-select="onNodeSelect">
      <template #header>
      Address Map
      </template>
      <Column field="name" header="Name" :expander="true"
        headerClass="sidebar-name-header" bodyClass="sidebar-name-body">
      </Column>
      <Column field="addr" header="Address"
        headerClass="sidebar-addr-header" bodyClass="sidebar-addr-body">
      </Column>
    </TreeTable>
  </div>
  <div class="view">
    <Reg :reg="reg"></Reg>
  </div>
</template>

<script>
function item_to_node(items, item) {
  return item.children.map(child_id => {
    let child = items[child_id];

    let node = {
      key: child["id"],
      data: {
        name: child["name"],
        addr: child["addr"],
      }
    };

    if ("children" in child) {
      node["children"] = item_to_node(items, child);
    }

    return node;
  });
}

function firstReg(items) {
  for (let key in items) {
    if (items[key].type == "reg") {
      return items[key];
    }
  }
}

export default {
  created() {
    this.reg = {};

    fetch("data.json")
      .then(result => result.json())
      .then(json => {
        this.items = json;
        this.reg = firstReg(this.items);
        this.selectionKeys[this.reg.id] = true;

        // Expand all parents of selected
        let id = this.reg.id;
        while (id.includes(".")) {
          id = id.replace(/\.\w+$/, '');
          this.expandedKeys[id] = true;
        }

        this.nodes = item_to_node(this.items, this.items["root"]);
      });
  },
  data() {
    return {
      reg: null,
      items: null,

      nodes: null,
      expandedKeys: {},
      selectionKeys: {},
    }
  },
  methods: {
    onNodeSelect(node) {
      console.log(node);
      this.reg = this.items[node.key];
    },
  },
  name: 'App'
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  margin: 10px;
}

.sidebar {
  width: 400px;
  position: fixed;
  left: 0;
  top: 0;
  margin: 0;
  box-sizing: border-box;
  border-right: 1px solid black;
  overflow-y: auto;
  min-height: 100vh;
}

.sidebar-addr-body span {
  text-align: right;
}

.view {
  padding-left: 400px;
}

</style>
