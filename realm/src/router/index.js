import { createRouter, createWebHistory } from 'vue-router'
import useSiteHead from '@/data/useSiteHead'
import usePageLoading from './usePageLoading'
import NotFoundPage from './NotFoundPage.vue'

const { pageLoading } = usePageLoading()

const CitaadelPage = () => import(/* webpackChunkName: "citaadel-page" */ '@/components/CitaadelPage.vue')
const LandAuctionPage = () => import(/* webpackChunkName: "land-auction" */'@/components/LandAuctionPage.vue')
const ConfigData = () => import(/* webpackChunkName: "config" */ '@/components/ConfigData.vue')
const ConfigParcels = () => import(/* webpackChunkName: "config" */ '@/components/ConfigParcels.vue')
const ConfigDataPocket = () => import(/* webpackChunkName: "config-pocket" */ '@/components/ConfigDataPocket.vue')
const ConfigDataWearableSets = () => import(/* webpackChunkName: "config-wearable-sets" */ '@/components/ConfigDataWearableSetsPage.vue')
const PocketsPage = () => import(/* webpackChunkName: "pocketses" */ '@/components/PocketsPage.vue')
const WearableSetsPage = () => import(/* webpackChunkName: "wearable-sets" */ '@/components/WearableSetsPage.vue')
const TempPlayground = () => import(/* webpackChunkName: "temp-playground" */ '@/components/TempPlayground.vue')

const { headData } = useSiteHead()

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
    component: CitaadelPage,
    meta: {
      head: {
        title: 'The Citaadel',
        description: 'Filter and explore the Citaadel map and Baazaar parcel listings from the Aavegotchi Realm'
      }
    }
  },
  {
    path: '/land-auction/:auctionId',
    name: 'land-auction',
    component: LandAuctionPage,
    props: true,
    meta: {
      head: {
        title: 'Land Auction',
        description: 'Filter and explore the Land parcels that were/are up for auction from the Aavegotchi Realm'
      }
    }
  },
  {
    path: '/pocketses',
    name: 'pockets',
    component: PocketsPage,
    meta: {
      head: {
        title: 'Gotchi Pockets',
        description: 'Examine the contents of gotchi pockets: spirit force and GHST'
      }
    }
  },
  {
    path: '/wearable-sets/:mode',
    name: 'wearable-sets',
    component: WearableSetsPage,
    props: true,
    meta: {
      head: {
        title: 'Wearable Sets',
        description: 'Full details of all wearable sets, grouped by gotchi types'
      }
    }
  },
  {
    path: '/wearable-sets',
    name: 'wearable-sets-index',
    redirect: {
      name: 'wearable-sets',
      params: { mode: 'gotchi' }
    }
  },
  {
    path: '/playground',
    name: 'playground',
    component: TempPlayground,
    meta: {
      head: {
        title: 'Temporary Playground',
        description: ''
      }
    }
  },
  {
    path: '/config-data',
    name: 'config-data',
    component: ConfigData,
    meta: {
      head: {
        title: 'Configure Data: Realm',
        description: 'Admin page for fetching data'
      }
    }
  },
  {
    path: '/config-parcels',
    name: 'config-parcels',
    component: ConfigParcels,
    meta: {
      head: {
        title: 'Configure Data: Parcel Groups',
        description: 'Admin page for fetching data'
      }
    }
  },
  {
    path: '/config-pockets',
    name: 'config-pockets',
    component: ConfigDataPocket,
    meta: {
      head: {
        title: 'Configure Data: Gotchi Pockets',
        description: 'Admin page for fetching data'
      }
    }
  },
  {
    path: '/config-wearable-sets',
    name: 'config-wearable-sets',
    component: ConfigDataWearableSets,
    meta: {
      head: {
        title: 'Configure Data: Wearable Sets',
        description: 'Admin page for fetching data'
      }
    }
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
  headData.value.pageTitle = to.meta?.head?.title || ''
  headData.value.description = to.meta?.head?.description || ''
  next()
})

export default router
