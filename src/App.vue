<template>
  <div class="sidebar">
    <input type="text" placeholder="Search" @input="search($event.target.value)">
    <TreeTable class="p-treetable-sm" :value="nodes" :expandedKeys="expandedKeys"
      :scrollable="true" scrollHeight="calc(100vh - 75px)"
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
    <router-view></router-view>
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
      return key;
    }
  }
}

import store from '@/store.js'

export default {
  created() {
    this.reg = {};

    store.load("eio.json")
      .then(_ => {
        this.selectElement(firstReg(this.sharedState.items))

        this.nodes = item_to_node(this.sharedState.items, this.sharedState.items["root"]);
      })
  },
  data() {
    return {
      reg: null,
      sharedState: store.sharedState,

      nodes: null,
      expandedKeys: {},
      selectionKeys: {},
    }
  },
  methods: {
    onNodeSelect(node) {
      console.log(node);
      this.$router.push("/reg/" + node.key)
    },
    selectElement(element_id) {
      this.reg = this.sharedState.items[element_id];

      this.selectionKeys = {};
      this.selectionKeys[element_id] = true;

      // Expand all parents of selected
      let id = element_id;
      while (id.includes(".")) {
        id = id.replace(/\.\w+$/, '');
        this.expandedKeys[id] = true;
      }

      this.$router.push("/reg/" + element_id)
    },
    search(text) {
      let fields = Array.from(this.sharedState.fields.keys())
      let matching_fields = fields.filter(field_id => {
        return field_id.toLowerCase().includes(text.toLowerCase())
      })
      if (matching_fields.length == 1) {
        let field_id = matching_fields[0]
        let element_id = this.sharedState.fields.get(field_id)
        this.selectElement(element_id)
      }
    }
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
