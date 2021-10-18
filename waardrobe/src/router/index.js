import { createRouter, createWebHashHistory } from "vue-router";
import GotchiPage from "@/components/GotchiPage.vue";

const routes = [
  {
    path: '/',
    name: 'Home',
    component: GotchiPage
  },
  {
    path: '/gotchi',
    name: 'GotchiPage',
    component: GotchiPage
  },
  {
    path: '/waardrobe',
    name: 'WaardrobePage',
    // route level code-splitting
    // this generates a separate chunk (waardrobe.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "waardrobe" */ '@/components/WaardrobePage.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
