import { createRouter, createWebHashHistory } from 'vue-router'
import CitaadelPage from '@/components/CitaadelPage.vue'
import LandAuctionPage from '@/components/LandAuctionPage.vue'
import ConfigData from '@/components/ConfigData.vue'
import ConfigParcels from '@/components/ConfigParcels.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: {
      name: 'citaadel'
    }
  },
  {
    path: '/citaadel',
    name: 'citaadel',
    component: CitaadelPage
  },
  {
    path: '/land-auction/:auctionId',
    name: 'land-auction',
    component: LandAuctionPage,
    props: true
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
