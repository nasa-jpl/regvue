<template>
  <RegLayout :reg="reg"></RegLayout>
  <RegFields :reg="reg"></RegFields>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps([
  'reg'
]);
</script>
