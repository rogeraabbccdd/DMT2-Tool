import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Custom from '../views/Custom.vue'
import Stage from '../views/Stage.vue'
import Settings from '../views/Settings.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/custom',
    name: 'custom',
    component: Custom
  },
  {
    path: '/settings',
    name: 'settings',
    component: Settings
  },
  {
    path: '/stage/:mode/:num',
    name: 'stage',
    component: Stage
  }
]

const router = new VueRouter({
  routes
})

export default router
