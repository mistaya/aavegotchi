import { createRouter, createWebHistory } from 'vue-router'
import useSiteHead from '@/site/useSiteHead'
import usePageLoading from './usePageLoading'
import useNetwork from '@/environment/useNetwork'
import NotFoundPage from './NotFoundPage.vue'

const { pageLoading, pageLazyLoadError } = usePageLoading()
const { baseAllowed, polygonAllowed } = useNetwork()

const CitaadelPage = () => import(/* webpackChunkName: "citaadel-page" */ '@/pages/land/CitaadelPage.vue')
const CitaadelMainPage = () => import(/* webpackChunkName: "citaadel-main" */ '@/pages/land/CitaadelMainPage.vue')
const CitaadelSpilloverPage = () => import(/* webpackChunkName: "citaadel-spillover" */ '@/pages/land/CitaadelSpilloverPage.vue')
const LandAuctionsPage = () => import(/* webpackChunkName: "land-auctions" */'@/pages/land/LandAuctionsPage.vue')
const LandAuctionPage = () => import(/* webpackChunkName: "land-auction" */'@/pages/land/LandAuctionPage.vue')
const ParcelPage = () => import(/* webpackChunkName: "parcel" */ '@/pages/land/ParcelPage.vue')
const ConfigData = () => import(/* webpackChunkName: "config" */ '@/pages/land/ConfigData.vue')
const ConfigParcels = () => import(/* webpackChunkName: "config" */ '@/pages/land/ConfigParcels.vue')
const ConfigDataPocket = () => import(/* webpackChunkName: "config-pocket" */ '@/pages/pockets/ConfigDataPocket.vue')
const ConfigDataWearableSets = () => import(/* webpackChunkName: "config-wearable-sets" */ '@/pages/wearables/ConfigDataWearableSetsPage.vue')
const PocketsPage = () => import(/* webpackChunkName: "pocketses" */ '@/pages/pockets/PocketsPage.vue')
const WearableSetsPage = () => import(/* webpackChunkName: "wearable-sets" */ '@/pages/wearables/WearableSetsPage.vue')
const RarityFarmingsPage = () => import(/* webpackChunkName: "rf" */ '@/pages/rf/RarityFarmingsPage.vue')
const RarityFarmingPage = () => import(/* webpackChunkName: "rf" */ '@/pages/rf/RarityFarmingPage.vue')
const LendingPage = () => import(/* webpackChunkName: "lending" */ '@/pages/lending/LendingPage.vue')
const LendingAvailablePage = () => import(/* webpackChunkName: "lending-available" */ '@/pages/lending/LendingAvailablePage.vue')
const LendingActivityPage = () => import(/* webpackChunkName: "lending-activity" */ '@/pages/lending/LendingActivityPage.vue')
const LendingBorrowerPage = () => import(/* webpackChunkName: "lending-borrower" */ '@/pages/lending/LendingBorrowerPage.vue')
const LendingManagerPage = () => import(/* webpackChunkName: "lending-manager" */ '@/pages/lending/LendingManagerPage.vue')
const LendingLandsIndexPage = () => import(/* webpackChunkName: "lending-lands" */ '@/pages/lending/LendingLandsIndexPage.vue')
const LendingLandsOwnerPage = () => import(/* webpackChunkName: "lending-lands-owner" */ '@/pages/lending/LendingLandsOwnerPage.vue')
const LendingLandsWhitelistPage = () => import(/* webpackChunkName: "lending-lands-whitelist" */ '@/pages/lending/LendingLandsWhitelistPage.vue')
const LendingLandsPublicPage = () => import(/* webpackChunkName: "lending-lands-public" */ '@/pages/lending/LendingLandsPublicPage.vue')
const LendingExportPage = () => import(/* webpackChunkName: "lending-export" */ '@/pages/lending/LendingExportPage.vue')
const TempPlayground = () => import(/* webpackChunkName: "temp-playground" */ '@/pages/playground/TempPlayground.vue')

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
    children: [
      {
        path: 'main',
        name: 'citaadel-main',
        component: CitaadelMainPage,
        meta: {
          head: {
            title: 'The Citaadel',
            description: 'Filter and explore the Citaadel map and Baazaar parcel listings from the Aavegotchi Realm'
          },
          networks: ['polygon']
        }
      },
      // redirect from old channeling page to spillover
      {
        path: 'channeling',
        redirect: {
          name: 'citaadel-spillover'
        }
      },
      {
        path: 'spillover',
        name: 'citaadel-spillover',
        component: CitaadelSpilloverPage,
        meta: {
          head: {
            title: 'Spillover Activity',
            description: 'See recent channelings/harvestings in the Citaadel'
          },
          networks: ['polygon']
        }
      },
      {
        path: 'parcel/:parcelId?',
        name: 'parcel',
        component: ParcelPage,
        props: true,
        meta: {
          head: {
            title: 'Parcel Details',
            description: 'View details about a parcel'
          },
          analyticsUrl: '/citaadel/parcel/ID',
          networks: ['polygon']
        }
      }
    ]
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
          },
          networks: []
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
      },
      networks: ['base', 'polygon']
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
      },
      networks: []
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
          },
          networks: []
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
          },
          networks: ['base', 'polygon']
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
          },
          networks: ['base', 'polygon']
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
          },
          networks: ['base', 'polygon']
        }
      },
      {
        path: 'manager',
        name: 'lending-manager',
        component: LendingManagerPage,
        props: route => ({
          address: route.query.address,
          thirdPartyAddress: route.query.thirdPartyAddress,
          originalOwnerAddress: route.query.originalOwnerAddress
        }),
        meta: {
          head: {
            title: 'Gotchi Lending Manager',
            description: 'Management overview of your gotchi lendings'
          },
          networks: ['base', 'polygon']
        }
      },
      {
        path: 'lands-public',
        redirect: {
          name: 'lending-lands-public'
        }
      },
      {
        path: 'lands',
        name: 'lending-lands',
        component: LendingLandsIndexPage,
        meta: {
          head: {
            title: 'Lands',
            description: 'Overview of lands with their channeling and harvesting status'
          },
          networks: ['base', 'polygon']
        },
        children: [
          {
            path: 'owner/:address',
            name: 'lending-lands-owner',
            component: LendingLandsOwnerPage,
            props: true,
            meta: {
              head: {
                title: 'Lands',
                description: 'Overview of your lands with their channeling and harvesting status'
              },
              analyticsUrl: '/lending/lands/owner/ADDRESS',
              networks: ['base', 'polygon']
            }
          },
          {
            path: 'public',
            name: 'lending-lands-public',
            component: LendingLandsPublicPage,
            meta: {
              head: {
                title: 'Lands open to public',
                description: 'Overview of lands with public access to channeling and harvesting'
              },
              networks: ['base', 'polygon']
            }
          },
          {
            path: 'whitelist',
            name: 'lending-lands-whitelist',
            component: LendingLandsWhitelistPage,
            props: route => ({
              queryWhitelistIds: route.query.whitelistIds,
              queryAddress: route.query.address
            }),
            meta: {
              head: {
                title: 'Lands open to whitelist',
                description: 'Overview of lands with whitelist access to channeling and harvesting'
              },
              networks: ['base', 'polygon']
            }
          }
        ]
      },
      {
        path: 'export',
        name: 'lending-export',
        component: LendingExportPage,
        meta: {
          head: {
            title: 'Gotchi Lending Exports',
            description: 'Export gotchi lendings data'
          },
          networks: ['base', 'polygon']
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
      },
      networks: ['base', 'polygon']
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

// Analytics
router.afterEach((to, from) => {
  if (to.meta.analyticsUrl) {
    window.trackView(to.meta.analyticsUrl)
  } else {
    window.trackView(to.path)
  }
})

// Networks allowed
router.beforeResolve((to, from, next) => {
  const networks = to.meta?.networks
  polygonAllowed.value = networks?.includes('polygon') || false
  baseAllowed.value = networks?.includes('base') || false
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
    pageLazyLoadError.value = true
  }
})

export default router
