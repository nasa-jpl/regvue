<template>
  <div class="card">
  <h5>Horizontal</h5>
  <Splitter style="height: 300px" class="p-mb-5">
    <SplitterPanel class="p-d-flex p-ai-center p-jc-center">
      Panel 1
    </SplitterPanel>
    <SplitterPanel class="p-d-flex p-ai-center p-jc-center">
      Panel 2
    </SplitterPanel>
  </Splitter>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
