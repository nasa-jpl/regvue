
import { createRouter, createWebHashHistory } from 'vue-router'
import Reg from './views/Reg.vue'

const routes = [
  { name: "reg", path: '/reg/:regid', component: Reg },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})
