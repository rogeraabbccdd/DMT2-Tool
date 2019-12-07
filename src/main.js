import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'

import axios from 'axios'
import VueAxios from 'vue-axios'

import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import './styles/style.stylus'

Vue.use(VueAxios, axios)
Vue.use(VueSweetalert2)

Vue.config.productionTip = false

export const eventBus = new Vue()

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
