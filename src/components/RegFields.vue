<template>
  <table>
    <thead>
      <tr>
        <th>Bits</th>
        <th>Name</th>
        <th>Access</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="field in reg.fields" :key="field">
        <td class="fields_nbits">{{ field.nbits }}</td>
        <td class="fields_name">{{ field.name }}</td>
        <td class="fields_access">{{ field.access }}</td>
        <td class="fields_description">{{ field.doc }}</td>
      </tr>
    </tbody>
  </table>
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
    return {
    }
  },
  computed: {
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
table {
  width: 100%;
  table-layout: fixed;
  text-align: left;
  vertical-align: top;
}

th {
    background-color: lightgray;
}
.fields_nbits {
    width: 10%;
}
.fields_name {
    width: 20%;
}
.fields_access {
    width: 10%;
}
.fields_description {
    width: 60%;
}
</style>
