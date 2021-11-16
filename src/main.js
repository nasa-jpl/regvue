import "primeflex/primeflex.css";
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";

import devtools from '@vue/devtools'
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

import Search from '@/components/Search.vue'
import RegLayout from '@/components/RegLayout.vue'
import RegFields from '@/components/RegFields.vue'

import PrimeVue from 'primevue/config';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';

if (process.env.NODE_ENV === 'development') {
  devtools.connect()
}

createApp(App)
  .use(PrimeVue)
  .use(router)
  .component('Search', Search)
  .component('RegLayout', RegLayout)
  .component('RegFields', RegFields)
  .component('TreeTable', TreeTable)
  .component('Column', Column)
  .mount('#app');
