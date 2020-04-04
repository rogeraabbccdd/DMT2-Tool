<template lang="pug">
  div.settings
    v-container(fill-height)
      v-row(:justify="'center'")
        v-col(cols='10')
          h1.white--text Tool Settings
          br
          v-text-field(:messages="['Select the folder where your client.exe is.']" v-model='path' label='Game path' required color="blue lighten-2" ref="path" @click="selectFolder()")
          br
          v-btn(color='green' @click="saveTool()") Save
          v-btn.mx-3(color='red' @click="resetStage()" v-if="savedPath.length > 0") Reset Stages
        v-col(cols='10' v-if="songs.length > 0")
          hr.my-5
        v-col(cols='10' v-if="songs.length > 0")
          h1.white--text Game Settings
          br
          v-row(justify="space-around")
            v-switch.ma-2(v-model='game.dev_mode' label='Show FPS')
            v-switch.ma-2(v-model='game.fullscreen' label='Fullscreen')
            v-switch.ma-2(v-model='game.show_cursor' label='Show cursor')
            v-switch.ma-2(v-model='game.vsync' label='VSync')
          v-subheader.pl-0 Key sound volume
          v-slider(v-model.number="game.sfx_volume" thumb-label="always" min="0" max="127")
          v-subheader.pl-0 BGM volume
          v-slider(v-model.number="game.bgm_volume" thumb-label="always" min="0" max="127")
          v-btn(color='green' @click="saveGame()") Save
</template>

<script>
import { remote } from 'electron'
import { eventBus } from '../main.js'

export default {
  name: 'settings',
  data () {
    return {
      path: '',
      game: {
        dev_mode: false,
        fullscreen: false,
        show_cursor: false,
        vsync: false,
        sfx_volume: 127,
        bgm_volume: 127
      }
    }
  },
  computed: {
    savedPath () {
      return this.$store.getters.tool.path
    },
    songs () {
      return this.$store.getters.songs
    }
  },
  methods: {
    selectFolder () {
      remote.dialog.showOpenDialog({
        properties: ['openDirectory']
      }, names => {
        if (names.length > 0) {
          let selected = names[0].replace(/\\/g, '/') + '/'
          this.path = selected
        }
      })
    },
    saveTool () {
      this.axios.post('http://localhost:616/saveSettings', { path: this.path })
        .then((res) => {
          if (res.data.success === true) {
            this.$swal({ type: 'success', title: 'Success' })
            this.$store.commit('saveTool', { type: 'path', value: this.path })
            eventBus.$emit('init')
          } else {
            this.$swal({ type: 'error', title: 'Error', text: res.data.msg })
          }
        }).catch((err) => {
          this.$swal({ type: 'error', title: 'Error', text: err })
        })
    },
    resetStage () {
      this.$swal({ type: 'warning', title: 'Are you sure?', text: 'All your stages will reset to default', showCancelButton: true })
        .then((e) => {
          if (e.value) {
            this.axios.get('http://localhost:616/resetStage')
              .then((res) => {
                if (res.data.success === true) {
                  eventBus.$emit('init')
                  this.$swal({ type: 'success', title: 'Success' })
                } else {
                  this.$swal({ type: 'error', title: 'Error', text: res.data.msg })
                }
              })
              .catch((err) => {
                this.$swal({ type: 'error', title: 'Error', text: err })
              })
          }
        })
    },
    saveGame () {
      this.axios.post('http://localhost:616/saveGame', this.game)
        .then((res) => {
          if (res.data.success === true) {
            this.$swal({ type: 'success', title: 'Success' })
            this.$store.commit('initSettings', this.game)
          } else {
            this.$swal({ type: 'error', title: 'Error', text: res.data.msg })
          }
        }).catch((err) => {
          this.$swal({ type: 'error', title: 'Error', text: err })
        })
    }
  },
  mounted () {
    this.path = this.$store.getters.tool.path
    this.game.dev_mode = this.$store.getters.settings.dev_mode
    this.game.fullscreen = this.$store.getters.settings.fullscreen
    this.game.show_cursor = this.$store.getters.settings.show_cursor
    this.game.vsync = this.$store.getters.settings.vsync
    this.game.sfx_volume = this.$store.getters.settings.sfx_volume
    this.game.bgm_volume = this.$store.getters.settings.bgm_volume
  }
}
</script>
