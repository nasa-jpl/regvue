
import { createRouter, createWebHashHistory } from 'vue-router'
import Reg from './views/Reg.vue'

const routes = [
  { name: "reg", path: '/reg/:regid', component: Reg, props: true },
  { name: "field", path: '/reg/:regid/field/:field_name', component: Reg, props: true },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})
