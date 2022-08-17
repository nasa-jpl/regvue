<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "src/store";

const store = useStore();

const isLoading = computed(() => store.isLoading);
</script>

<template>
  <div
    v-if="isLoading"
    class="absolute top-0 left-0 z-[100] flex h-screen w-screen justify-center"
  >
    <div
      class="mt-64 h-fit rounded-lg border border-gray-300 bg-white p-4 shadow-lg"
    >
      <div class="loader bg-transparent">Loading...</div>
    </div>
  </div>
</template>

<style>
/* From https://projects.lukehaas.me/css-loaders/ */
.loader {
  font-size: 10px;
  text-indent: -9999em;
  width: 11em;
  height: 11em;
  border-radius: 50%;
  background: #81b9f8;
  background: -moz-linear-gradient(
    left,
    #81b9f8 10%,
    rgba(129, 185, 248, 0) 42%
  );
  background: -webkit-linear-gradient(
    left,
    #81b9f8 10%,
    rgba(129, 185, 248, 0) 42%
  );
  background: -o-linear-gradient(left, #81b9f8 10%, rgba(129, 185, 248, 0) 42%);
  background: -ms-linear-gradient(
    left,
    #81b9f8 10%,
    rgba(129, 185, 248, 0) 42%
  );
  background: linear-gradient(
    to right,
    #81b9f8 10%,
    rgba(129, 185, 248, 0) 42%
  );
  position: relative;
  -webkit-animation: load3 1.4s infinite linear;
  animation: load3 1.4s infinite linear;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
}
.loader:before {
  width: 50%;
  height: 50%;
  background: #81b9f8;
  border-radius: 100% 0 0 0;
  position: absolute;
  top: 0;
  left: 0;
  content: "";
}
.loader:after {
  background: white;
  width: 75%;
  height: 75%;
  border-radius: 50%;
  content: "";
  margin: auto;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}
@-webkit-keyframes load3 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes load3 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
</style>
