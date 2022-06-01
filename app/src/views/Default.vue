<script setup lang="ts">
import { onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import store from "../store";

const router = useRouter();
onBeforeMount(async () => {
  await store.untilLoaded();
  router.push({ name: "reg", params: { regid: store.getFirstRegister() } });
});
</script>

<template>
  <span></span>
</template>
