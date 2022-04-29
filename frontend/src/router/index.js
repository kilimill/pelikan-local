import { createRouter, createWebHistory } from 'vue-router'
import Error404 from '@/views/Error404.vue'
import ErrorPage from '@/views/ErrorPage.vue'

const routes = [
  {
    path: '/',
    name: 'Entry',
    component: () => import('@/views/EntryPoint'),
  },
  {
    path: '/room',
    name: 'Room',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Room.vue')
  },
  {
    path: '/playback',
    name: 'Playback',
    component: () => import('@/views/Playback')
  },
  {
    path: '/error',
    name: 'ErrorPage',
    component: ErrorPage
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Error404',
    component: Error404
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
