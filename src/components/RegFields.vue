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
      <tr v-for="field in reg.fields" :key="field" :class="{ highlight: field_name == field.name }">
        <td class="fields_bits">{{ bits(field.lsb, field.nbits) }}</td>
        <td class="fields_name">{{ field.name }}</td>
        <td class="fields_access">{{ field.access }}</td>
        <td class="fields_description"><span v-html='field.doc.replaceAll("\n", "<br>")'></span></td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps([
  'reg',
  'field_name',
]);
</script>

<script>
export default {
  data() {
    return {
    }
  },
  methods: {
    bits(lsb, nbits) {
      if (nbits == 1) {
        return lsb;
      } else {
        return (nbits + lsb - 1) + ":" + lsb;
      }
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
}

th {
  background-color: lightgray;
}

td {
  vertical-align: top;
  text-align: center;
}

.fields_bits {
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
  text-align: left;
}

.highlight {
  background-color: #fffbe5;
}
</style>
