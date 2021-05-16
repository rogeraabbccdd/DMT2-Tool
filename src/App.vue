<template lang="pug">
  div#app
    v-app#inspire
      v-navigation-drawer(v-model='drawer' app clipped)
        v-list(dense)
          v-list-group(prepend-icon="music_note" no-action)
            template(v-slot:activator)
              v-list-item-content
                v-list-item-title Songs
            v-list-item(@click="goto('/')")
              v-list-item-content
                v-list-item-title Songs
            v-list-item(@click="goto('/custom')")
              v-list-item-content
                v-list-item-title Custom Songs
          v-list-group(prepend-icon="stars" no-action)
            template(v-slot:activator)
              v-list-item-content
                v-list-item-title Star Mixing
            v-list-item(@click="goto('/stage/star/1')")
              v-list-item-content
                v-list-item-title Stage 1
            v-list-item(@click="goto('/stage/star/2')")
              v-list-item-content
                v-list-item-title Stage 2
            v-list-item(@click="goto('/stage/star/3')")
              v-list-item-content
                v-list-item-title Stage 3
            v-list-item(@click="goto('/stage/star/4')")
              v-list-item-content
                v-list-item-title Bonus
          v-list-group(prepend-icon="album"  no-action)
            template(v-slot:activator)
              v-list-item-content
                v-list-item-title POP Mixing
            v-list-item(@click="goto('/stage/pop/1')")
              v-list-item-content
                v-list-item-title Stage 1
            v-list-item(@click="goto('/stage/pop/2')")
              v-list-item-content
                v-list-item-title Stage 2
            v-list-item(@click="goto('/stage/pop/3')")
              v-list-item-content
                v-list-item-title Stage 3
            v-list-item(@click="goto('/stage/pop/4')")
              v-list-item-content
                v-list-item-title Bonus
          v-list-item(@click="goto('/settings')")
            v-list-item-action
              v-icon settings
            v-list-item-content
              v-list-item-title Settings
          v-list-item(@click="play(0)" v-if="songs.length > 0")
            v-list-item-action
              v-icon play_arrow
            v-list-item-content
              v-list-item-title Start Game
          v-list-item(@click="play(1)" v-if="songs.length > 0")
            v-list-item-action
              v-icon play_arrow
            v-list-item-content
              v-list-item-title Start Game (Local Server)
          v-list-item(@click="openFolder()" v-if="songs.length > 0")
            v-list-item-action
              v-icon folder
            v-list-item-content
              v-list-item-title Open Folder
      v-app-bar(app clipped-left color="blue darken-2")
        v-app-bar-nav-icon(@click.stop='drawer = !drawer')
        v-toolbar-title DJMAX TECHNIKA 2 Tool
      v-content
        router-view
      v-footer(app)
        span © {{ new Date().getFullYear() }} Made with ❤ by Kento
        v-spacer
        span {{ version }}
      v-overlay.text-center(:value='overlay')
        v-progress-circular(:size='50' color='primary' indeterminate)
        br
        | LOADING
</template>

<script>
import { version } from '../package.json'
import { eventBus } from './main.js'
export default {
  name: 'App',
  data () {
    return {
      drawer: null,
      overlay: false,
      version
    }
  },
  computed: {
    path () {
      return this.$store.getters.tool.path
    },
    songs () {
      return this.$store.getters.songs
    }
  },
  methods: {
    goto (page) {
      if (this.$router.currentRoute.path !== page) this.$router.push(page)
    },
    init () {
      this.overlay = true
      this.axios.post('http://localhost:616/init', { path: this.path })
        .then((res) => {
          if (res.data.success === true) {
            let songs = res.data.songs
            this.$store.commit('lastno', songs[songs.length - 1].no)
            songs.sort((a, b) => {
              return a.FullName.localeCompare(b.FullName)
            })
            this.$store.commit('initSongs', songs)
            this.$store.commit('initStages', res.data.stage)
            this.$store.commit('initSettings', res.data.settings)
            this.$store.commit('initDefaultSongs', res.data.defaultSongs)
            this.$store.commit('initDefaultStages', res.data.defaultSong)
          } else {
            this.$swal({ type: 'error', title: 'Error', text: res.data.msg })
          }
          this.overlay = false
        }).catch((err) => {
          this.$swal({ type: 'error', title: 'Error', text: err })
          this.overlay = false
        })
    },
    play (server) {
      this.axios.get('http://localhost:616/play?server=' + server)
    },
    openFolder () {
      this.axios.get('http://localhost:616/folder')
    }
  },
  mounted () {
    const settings = localStorage.getItem('settings')
    if (settings !== null) {
      const settingsJSON = JSON.parse(settings)
      this.$store.commit('initTool', settingsJSON)
      this.init()
    }
    eventBus.$on('init', () => {
      this.init()
    })
  }
}
</script>
