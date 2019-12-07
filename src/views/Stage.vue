<template lang="pug">
  div.stage
    v-container(fill-height v-if="stages.length > 0")
      v-row(:justify="'center'")
        v-col(cols="10")
          h1.white--text {{ mode.toUpperCase() }} MIXING Stage {{ num }}
          hr
          br
          v-row
            v-col(cols='4' v-for="(s, idx) in stages" :key="idx")
              v-card
                v-img.white--text.align-end(height='200px' :src="'./eyecatch/'+s[1]+'_1.jpg'")
                v-card-text.text--primary
                  div {{ s[14] }}
                  div(v-if="mode === 'star'")
                    div.yellow--text.lighten-1
                      | NM {{ s[15] }} / Speed: {{ s[2] / 2 }}x
                  div(v-else)
                    div.yellow--text.lighten-1
                      | NM {{ s[16] }} / Speed: {{ s[2] / 2 }}x
                    div.blue--text(v-if="s[17] > 0")
                      | HD {{ s[17] }} / Speed: {{ s[5] / 2 }}x
                    div(v-else)
                      br
                    div.red--text(v-if="s[18] > 0")
                      | MX {{ s[18] }} / Speed: {{ s[8] / 2 }}x
                    div(v-else)
                      br
                v-btn.btn-edit(absolute icon dark fab bottom right color='green' @click="edit(s, idx)")
                  v-icon edit
      v-row(:justify="'center'")
        v-col.text-center(cols="12")
          v-pagination(v-model='page' :length='3')
    v-container(fill-height v-else)
      v-row(:justify="'center'")
        v-col(cols="10")
          h1.white--text {{ mode.toUpperCase() }} MIXING Stage {{ num }}
          hr
          br
          p Can't find any songs in stage, please set your game path in settings page.
    v-dialog(v-model='dialog.show' width='500')
      v-card
        v-card-title.headline.blue.darken-2(primary-title) Edit song slot
        v-card-text
          v-container
            v-row
              v-col(cols="12")
                //- v-select(:items='songs' label='Select A Song' item-text="FullName" item-value="name" v-model="dialog.songID" @change="refreshDialog()")
                v-autocomplete(:items="songs" item-text="FullName" item-value="name" v-model="dialog.song" label='Song' @change="refreshDialog(dialog.song.name)")
            div(v-if="mode === 'star'")
              v-row
                v-col.yellow--text.lighten-1.align-self-center(cols="4")
                  h2 Star
                v-col(cols="8")
                  v-select(:items='speedItems' item-text="text" item-value="value" label='Speed' v-model="dialog.NM.speed")
            div(v-else)
              v-row
                v-col.yellow--text.lighten-1.align-self-center(cols="4")
                  h2 NM {{ dialog.NM.level }}
                v-col(cols="8")
                  v-select(:items='speedItems' item-text="text" item-value="value" label='Speed' v-model="dialog.NM.speed")
              v-row(v-if="dialog.HD.level > 0")
                v-col.blue--text.align-self-center(cols="4")
                  h2 HD {{ dialog.HD.level }}
                v-col(cols="8")
                  v-select(:items='speedItems' item-text="text" item-value="value" label='Speed' v-model="dialog.HD.speed")
              v-row(v-if="dialog.MX.level > 0")
                v-col.red--text.align-self-center(cols="4")
                  h2 MX {{ dialog.MX.level }}
                v-col(cols="8")
                  v-select(:items='speedItems' item-text="text" item-value="value" label='Speed' v-model="dialog.MX.speed")
        v-divider
        v-card-actions
          v-spacer
          v-btn(color='red' text @click="dialog.show = false") Cancel
          v-btn(color='green darken-1' text @click='saveSlot()') Save
</template>

<style lang="stylus">
.btn-edit
  position absolute
  bottom 0 !important
  right 0 !important
</style>

<script>
import { eventBus } from '../main.js'
export default {
  name: 'home',
  data () {
    return {
      page: 1,
      dialog: {
        show: false,
        song: '',
        songId: 0,
        slotNum: 0,
        Star: 0,
        NM: {
          speed: 0,
          level: 0
        },
        HD: {
          speed: 0,
          level: 0
        },
        MX: {
          speed: 0,
          level: 0
        }
      },
      speedItems: [
        {
          text: '0.5',
          value: 1
        },
        {
          text: '1',
          value: 2
        }
      ]
    }
  },
  computed: {
    mode () {
      return this.$route.params.mode
    },
    num () {
      return this.$route.params.num
    },
    to () {
      let mode = this.mode === 'star' ? 0 : 3
      return (mode + parseInt(this.num)) * 27 - (3 - this.page) * 9 - 1
    },
    from () {
      return this.to - 8
    },
    stages () {
      let result = this.$store.getters.stages({ from: this.from, to: this.to })
      result = result.map((r) => {
        let info = this.getSongInfo(r[1])
        r.push(info.FullName)
        r.push(info['Star_1'])
        r.push(info['Pop_1'])
        r.push(info['Pop_2'])
        r.push(info['Pop_3'])
        return r
      })
      return result
    },
    songs () {
      return this.$store.getters.songs
    }
  },
  methods: {
    getSongInfo (name) {
      return this.songs.filter((s) => { return s.name === name })[0]
    },
    edit (s, idx) {
      this.dialog.song = {
        FullName: this.getSongInfo(s[1]).FullName,
        name: this.getSongInfo(s[1]).name
      }
      this.dialog.slotNum = idx
      this.dialog.songId = s[0]
      this.dialog.NM.speed = { text: (s[2] / 2).toString(), value: parseInt(s[2]) }
      this.dialog.HD.speed = { text: (s[5] / 2).toString(), value: parseInt(s[5]) }
      this.dialog.MX.speed = { text: (s[8] / 2).toString(), value: parseInt(s[8]) }
      this.dialog.NM.level = (this.mode === 'star') ? s[15].toString() : s[16].toString()
      this.dialog.HD.level = s[17].toString()
      this.dialog.MX.level = s[18].toString()
      this.dialog.show = true
    },
    saveSlot () {
      let path = this.$store.getters.settings.path
      this.axios.post('http://localhost:616/saveSlot', { path, slot: this.dialog, mode: this.mode, num: this.num, page: this.page })
        .then((res) => {
          if (res.data.success === true) {
            this.$swal({ type: 'success', title: 'Success' })
            eventBus.$emit('init')
          } else {
            this.$swal({ type: 'error', title: 'Error', text: res.data.msg })
          }
        }).catch((err) => {
          this.$swal({ type: 'error', title: 'Error', text: err })
        })
    },
    refreshDialog () {
      this.dialog.NM.speed = { text: '1', value: 2 }
      this.dialog.HD.speed = { text: '1', value: 2 }
      this.dialog.MX.speed = { text: '1', value: 2 }
      let info = this.getSongInfo(this.dialog.song)
      this.dialog.songId = info.no
      this.dialog.NM.level = (this.mode === 'star') ? info['Star_1'] : info['Pop_1']
      this.dialog.HD.level = info['Pop_2']
      this.dialog.MX.level = info['Pop_3']
    }
  },
  beforeRouteUpdate (to, from, next) {
    this.page = 1
    next()
  }
}
</script>
