<template>
  <RegLayout :reg="reg"></RegLayout>
  <div id="doc"><span v-html='doc'></span></div>
  <RegFields :reg="reg"></RegFields>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps([
  'reg'
]);
</script>

<script>
export default {
  data() {
    return {};
  },
  computed: {
    doc() {
      // The doc key may not be present
      if (this.reg.doc) {
        return this.reg.doc.replaceAll("\n", "<br>");
      } else {
        return "";
      }
    }
  }
}
</script>

<style scoped>
#doc {
  text-align: left;
}
</style>
