<template>
  <Header :title="title" :links="links" :version="version"/>
  <div class="sidebar">
    <TreeTable class="p-treetable-sm" :value="sharedState.nodes" :expandedKeys="expandedKeys"
      :scrollable="true" scrollHeight="calc(100vh - 58px)"
      v-model:selectionKeys="selectionKeys" selectionMode="single" @node-select="onNodeSelect">
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
  <div class="app-version">
    Powered by <a :href="appInfo.url">{{ appInfo.name }} v{{ appInfo.version }}</a>
  </div>
</template>

<script>
import store from '@/store.js'
import packageInfo from '@/../package'

export default {
  created() {
    this.reg = {};

    store.load("eio.json")

    this.$watch(
      () => this.$route.params,
      (to, _from) => {
        if (to.regid) {
          store.untilLoaded(store)
            .then(_ => {
              this.selectElement(to.regid)
            })
        }
      }
    )
  },
  data() {
    return {
      appInfo: {
        name: packageInfo.name,
        url: packageInfo.homepage,
        version: packageInfo.version,
      },
      reg: null,
      sharedState: store.sharedState,

      expandedKeys: {},
      selectionKeys: {},
    }
  },
  methods: {
    onNodeSelect(node) {
      this.$router.push({ name: "reg", params: { regid: node.key } })
    },
    selectElement(element_id) {
      this.reg = this.sharedState.data.elements[element_id];

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
    },
  },
  computed: {
    title() {
      return this.sharedState.data?.design?.name || "FPGA Registers"
    },
    links() {
      let o = this.sharedState.data?.design?.links

      if (o) {
        return Object.entries(o)
          .map(([k, v]) => {
              let e = { href: v, text: k }
              return e
              })
      } else {
        return {}
      }
    },
    version() {
      return this.sharedState.data?.design?.version || "Unspecified"
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

.topbar .links {
  margin: auto;
  margin-top: .7rem;
  top: .7rem;
}

.sidebar {
  z-index: 10;
  width: 20rem;
  position: fixed;
  left: 0;
  top: 3.4rem;
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
  display: block;
  padding-left: 20rem;
  margin-top: 20px;
}

.p-treetable.p-treetable-sm .p-treetable-header {
      padding: 0.5rem 0.875rem;
}
.p-treetable.p-treetable-sm .p-treetable-thead > tr > th {
      padding: 0.3rem 0.72845rem;
}
.p-treetable.p-treetable-sm .p-treetable-tbody > tr > td {
      padding: 0.3rem 0.72845rem;
}
.p-treetable.p-treetable-sm .p-treetable-tfoot > tr > td {
      padding: 0.3rem 0.85rem;
}
.p-treetable.p-treetable-sm .p-treetable-footer {
      padding: 0.3rem 0.85rem;
}

.app-version {
  position: fixed;
  bottom: 0;
  right: 0;
  background-color: white;
  border-left: 1px solid black;
  border-top: 1px solid black;
  font-size: 10px;
  padding-left: 2px;
  padding-right: 2px;
}
</style>
