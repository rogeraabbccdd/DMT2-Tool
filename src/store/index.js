import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    tool: {
      path: ''
    },
    settings: {
      dev_mode: false,
      fullscreen: false,
      show_cursor: false,
      vsync: false,
      sfx_volume: 127,
      bgm_volume: 127,
      card: '12345678ABCDEFGHIJKL'
    },
    songs: [],
    stages: [],
    defaultSongs: [],
    defaultStages: [],
    lastno: 0
  },
  mutations: {
    initTool (state, data) {
      state.tool = data
    },
    initSettings (state, data) {
      state.settings = data
    },
    initSongs (state, data) {
      state.songs = data
    },
    initStages (state, data) {
      state.stages = data
    },
    initDefaultSongs (state, data) {
      state.defaultSongs = data
    },
    initDefaultStages (state, data) {
      state.defaultStages = data
    },
    saveTool (state, data) {
      state.tool[data.type] = data.value
      localStorage.setItem('settings', JSON.stringify(state.tool))
    },
    lastno (state, data) {
      state.lastno = parseInt(data)
    }
  },
  getters: {
    tool (state) {
      return state.tool
    },
    settings (state) {
      return state.settings
    },
    stages: (state) => (data) => {
      return state.stages.slice(data.from, data.to + 1)
    },
    songs (state) {
      return state.songs
    },
    defaultStages: (state) => (data) => {
      return state.defaultStages.slice(data.from, data.to + 1)
    },
    defaultSongs (state) {
      return state.defaultSongs
    },
    lastno (state) {
      return state.lastno
    }
  }
})
