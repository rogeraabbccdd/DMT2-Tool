import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    settings: {
      path: ''
    },
    songs: [],
    stages: [],
    lastno: 0
  },
  mutations: {
    init (state, data) {
      state.settings = data
    },
    initSongs (state, data) {
      state.songs = data
    },
    initStages (state, data) {
      state.stages = data
    },
    saveState (state, data) {
      state.settings[data.type] = data.value
      localStorage.setItem('settings', JSON.stringify(state.settings))
    },
    lastno (state, data) {
      state.lastno = parseInt(data)
    }
  },
  getters: {
    settings (state) {
      return state.settings
    },
    stages: (state) => (data) => {
      return state.stages.slice(data.from, data.to + 1)
    },
    songs (state) {
      return state.songs
    },
    lastno (state) {
      return state.lastno
    }
  }
})
