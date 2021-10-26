<template>
  <Splitter style="height: calc(100vh - 20px)">
    <SplitterPanel :size="20">
      <TreeTable class="p-treetable-sm" :value="nodes" :expandedKeys="expandedKeys"
        :scrollable="true" scrollHeight="100%"
        v-model:selectionKeys="selectionKeys" selectionMode="single" @node-select="onNodeSelect">
        <template #header>
          Address Map
        </template>
        <Column field="name" header="Name" :expander="true"></Column>
        <Column field="offset" header="Offset"></Column>
      </TreeTable>
    </SplitterPanel>
    <SplitterPanel :size="80">
      <Reg :reg="reg">
      </Reg>
    </SplitterPanel>
  </Splitter>
</template>

<script>
function item_to_node(items, item) {
  return item.children.map(child_id => {
    let child = items[child_id];

    let node = {
      key: child["id"],
      data: {
        name: child["name"],
        offset: child["offset"],
      }
    };

    if ("children" in child) {
      node["children"] = item_to_node(items, child);
    }

    return node;
  });
}

export default {
  created() {
    this.reg = {};

    fetch("data.json")
      .then(result => result.json())
      .then(json => {
        this.items = json;
        this.reg = this.items["regs.blk0.reg0"];
        this.nodes = item_to_node(this.items, this.items["root"]);
      });
  },
  data() {
    return {
      reg: null,
      items: null,

      nodes: null,
      expandedKeys: {
        regs: true,
        "regs.blk0": true,
      },
      selectionKeys: {
        "regs.blk0.reg0": true,
      },
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
</style>
