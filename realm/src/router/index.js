import { createRouter, createWebHistory } from 'vue-router'
import useSiteHead from '@/data/useSiteHead'
import usePageLoading from './usePageLoading'
import NotFoundPage from './NotFoundPage.vue'

const { pageLoading, pageLazyLoadError } = usePageLoading()

const CitaadelPage = () => import(/* webpackChunkName: "citaadel-page" */ '@/components/CitaadelPage.vue')
const LandAuctionsPage = () => import(/* webpackChunkName: "land-auctions" */'@/components/LandAuctionsPage.vue')
const LandAuctionPage = () => import(/* webpackChunkName: "land-auction" */'@/components/LandAuctionPage.vue')
const ConfigData = () => import(/* webpackChunkName: "config" */ '@/components/ConfigData.vue')
const ConfigParcels = () => import(/* webpackChunkName: "config" */ '@/components/ConfigParcels.vue')
const ConfigDataPocket = () => import(/* webpackChunkName: "config-pocket" */ '@/components/ConfigDataPocket.vue')
const ConfigDataWearableSets = () => import(/* webpackChunkName: "config-wearable-sets" */ '@/components/ConfigDataWearableSetsPage.vue')
const PocketsPage = () => import(/* webpackChunkName: "pocketses" */ '@/components/PocketsPage.vue')
const WearableSetsPage = () => import(/* webpackChunkName: "wearable-sets" */ '@/components/WearableSetsPage.vue')
const RarityFarmingsPage = () => import(/* webpackChunkName: "rf" */ '@/components/RarityFarmingsPage.vue')
const RarityFarmingPage = () => import(/* webpackChunkName: "rf" */ '@/components/RarityFarmingPage.vue')
const LendingPage = () => import(/* webpackChunkName: "lending" */ '@/components/LendingPage.vue')
const LendingAvailablePage = () => import(/* webpackChunkName: "lending-available" */ '@/components/LendingAvailablePage.vue')
const LendingActivityPage = () => import(/* webpackChunkName: "lending-activity" */ '@/components/LendingActivityPage.vue')
const LendingBorrowerPage = () => import(/* webpackChunkName: "lending-borrower" */ '@/components/LendingBorrowerPage.vue')
const LendingManagerPage = () => import(/* webpackChunkName: "lending-manager" */ '@/components/LendingManagerPage.vue')
const LendingLandsPage = () => import(/* webpackChunkName: "lending-lands" */ '@/components/LendingLandsPage.vue')
const LendingExportPage = () => import(/* webpackChunkName: "lending-export" */ '@/components/LendingExportPage.vue')
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
    path: '/land-auction',
    name: 'land-auctions',
    component: LandAuctionsPage,
    children: [
      {
        path: ':auctionId',
        name: 'land-auction',
        component: LandAuctionPage,
        props: true,
        meta: {
          head: {
            title: 'Land Auction',
            description: 'Filter and explore the Land parcels that were/are up for auction from the Aavegotchi Realm'
          }
        }
      }
    ]
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
    path: '/rf',
    name: 'rf-index',
    component: RarityFarmingsPage,
    children: [
      {
        path: ':season/:round',
        name: 'rf',
        component: RarityFarmingPage,
        props: true,
        meta: {
          head: {
            title: 'Rarity Farming',
            description: 'See historical rarity farming leaderboard results'
          }
        }
      }
    ]
  },
  {
    path: '/lending',
    name: 'lending-index',
    component: LendingPage,
    children: [
      {
        path: 'available',
        name: 'lending-available',
        component: LendingAvailablePage,
        meta: {
          head: {
            title: 'Gotchi Lending Listings',
            description: 'Filter and explore the gotchis available for lending'
          }
        }
      },
      {
        path: 'activity',
        name: 'lending-activity',
        component: LendingActivityPage,
        meta: {
          head: {
            title: 'Gotchi Lending Activity',
            description: 'See recently-agreed gotchi lendings'
          }
        }
      },
      {
        path: 'borrower',
        name: 'lending-borrower',
        component: LendingBorrowerPage,
        props: route => ({
          address: route.query.address
        }),
        meta: {
          head: {
            title: 'Gotchi Borrower',
            description: 'Overview of your borrowed gotchis'
          }
        }
      },
      {
        path: 'manager',
        name: 'lending-manager',
        component: LendingManagerPage,
        props: route => ({
          address: route.query.address,
          thirdPartyAddress: route.query.thirdPartyAddress,
          vaultOwnerAddress: route.query.vaultOwnerAddress
        }),
        meta: {
          head: {
            title: 'Gotchi Lending Manager',
            description: 'Management overview of your gotchi lendings'
          }
        }
      },
      {
        path: 'lands',
        name: 'lending-lands',
        component: LendingLandsPage,
        props: route => ({
          address: route.query.address
        }),
        meta: {
          head: {
            title: 'Lands',
            description: 'Overview of your lands with their channeling status'
          }
        }
      },
      {
        path: 'export',
        name: 'lending-export',
        component: LendingExportPage,
        meta: {
          head: {
            title: 'Gotchi Lending Exports',
            description: 'Export gotchi lendings data'
          }
        }
      }
    ]
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

// Production website can produce routing errors when new versions are deployed
// but a user already has an old page open.
// When they attempt to navigate, the lazy load will fail because
// the old hashed file no longer exists on the server. This is a silent error by default.
router.onError(error => {
  console.log('Router onError detected...', error)
  if (
    error &&
    error.message &&
    (
      error.message.indexOf('Loading chunk') !== -1 ||
      error.message.indexOf('Loading CSS chunk') !== -1
    )
  ) {
    console.log('Detected webpack lazy-load failure')
    // enable this later
    if (Date.now() < 0) {
      pageLazyLoadError.value = true
    }
  }
})

export default router
