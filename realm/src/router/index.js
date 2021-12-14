import { createRouter, createWebHashHistory } from 'vue-router'
import usePageLoading from './usePageLoading'

const { pageLoading } = usePageLoading()

const CitaadelPage = () => import(/* webpackChunkName: "citaadel-page" */ '@/components/CitaadelPage.vue')
const LandAuctionPage = () => import(/* webpackChunkName: "land-auction" */'@/components/LandAuctionPage.vue')
const ConfigData = () => import(/* webpackChunkName: "config" */ '@/components/ConfigData.vue')
const ConfigParcels = () => import(/* webpackChunkName: "config" */ '@/components/ConfigParcels.vue')

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

// Globally record loading state for lazy-loaded routes
router.beforeEach((to, from, next) => {
  if (typeof to.matched[0]?.components.default === 'function') {
    pageLoading.value = true
  }
  next()
})
router.beforeResolve((to, from, next) => {
  pageLoading.value = false
  next()
})

export default router
