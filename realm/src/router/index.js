import { createRouter, createWebHashHistory } from 'vue-router'
import CitaadelMap from '@/components/CitaadelMap.vue'
import ConfigData from '@/components/ConfigData.vue'
import ConfigParcels from '@/components/ConfigParcels.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: CitaadelMap
  },
  {
    path: '/config-data',
    name: 'config-data',
    component: ConfigData
  },
  {
    path: '/config-parcels',
    name: 'config-parcels',
    component: ConfigParcels
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
