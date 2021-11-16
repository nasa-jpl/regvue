<template>
  <div class="sidebar">
    <Search @select-element="selectElement"></Search>
    <TreeTable class="p-treetable-sm" :value="sharedState.nodes" :expandedKeys="expandedKeys"
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
import store from '@/store.js'

export default {
  created() {
    this.reg = {};

    store.load("eio.json")
      .then(_ => {
        this.selectElement(store.first_reg())
      })
  },
  data() {
    return {
      reg: null,
      sharedState: store.sharedState,

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

      // Expand all parents of selected element
      let id = element_id;
      while (id.includes(".")) {
        id = id.replace(/\.\w+$/, '');
        this.expandedKeys[id] = true;
      }

      // Scroll to element
      let elems = document.getElementsByClassName(element_id)
      if (elems.length) {
        let elem = elems[0]
        elem.scrollIntoView({ block: "center" })
      }

      this.$router.push("/reg/" + element_id)
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
