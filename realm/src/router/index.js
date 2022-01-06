import { createRouter, createWebHistory } from 'vue-router'
import usePageLoading from './usePageLoading'
import NotFoundPage from './NotFoundPage.vue'

const { pageLoading } = usePageLoading()

const CitaadelPage = () => import(/* webpackChunkName: "citaadel-page" */ '@/components/CitaadelPage.vue')
const LandAuctionPage = () => import(/* webpackChunkName: "land-auction" */'@/components/LandAuctionPage.vue')
const ConfigData = () => import(/* webpackChunkName: "config" */ '@/components/ConfigData.vue')
const ConfigParcels = () => import(/* webpackChunkName: "config" */ '@/components/ConfigParcels.vue')
const ConfigDataPocket = () => import(/* webpackChunkName: "config-pocket" */ '@/components/ConfigDataPocket.vue')
const PocketsPage = () => import(/* webpackChunkName: "pocketses" */ '@/components/PocketsPage.vue')

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
    path: '/pocketses',
    name: 'pockets',
    component: PocketsPage
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
  },
  {
    path: '/config-data-pockets',
    name: 'config-data-pockets',
    component: ConfigDataPocket
  },
  {
    path: '/:pathMatch(.*)',
    component: NotFoundPage
  }
]

const router = createRouter({
  history: createWebHistory(),
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
