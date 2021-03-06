<template lang="pug">
  div.stage
    v-container(fill-height v-if="stages.length > 0 && songs.length > 0")
      v-row(:justify="'center'")
        v-col(cols="12" md="10")
          h1.white--text {{ mode.toUpperCase() }} MIXING Stage {{ num === '4' ? 'Bonus' : num }}
          hr
          br
          v-row
            v-col(cols='4' v-for="(s, idx) in stages" :key="idx")
              v-card
                v-img.white--text.align-end(height='200px' :src="getEyecatchUrl(s)")
                  template(v-slot:placeholder)
                    v-img.white--text.align-end(height='200px' :src="'./eyecatch/placeholder.jpg'")
                v-card-text.text--primary
                  div {{ s[14] }}
                  div(v-if="mode === 'star'")
                    div.yellow--text.lighten-1
                      | NM {{ s[15] }} / Speed: {{ s[2] / 2 }}x
                    div.blue--text(v-if="s[16] > 0")
                      | HD {{ s[16] }} / Speed: {{ s[5] / 2 }}x
                    div(v-else)
                      br
                    div.red--text(v-if="s[17] > 0")
                      | MX {{ s[17] }} / Speed: {{ s[8] / 2 }}x
                    div(v-else)
                      br
                    div.purple--text.text--lighten-3(v-if="s[18] > 0")
                      | EX {{ s[18] }} / Speed: {{ s[11] / 2 }}x
                    div(v-else)
                      br
                  div(v-else)
                    div.yellow--text.lighten-1
                      | NM {{ s[19] }} / Speed: {{ s[2] / 2 }}x
                    div.blue--text(v-if="s[20] > 0")
                      | HD {{ s[20] }} / Speed: {{ s[5] / 2 }}x
                    div(v-else)
                      br
                    div.red--text(v-if="s[21] > 0")
                      | MX {{ s[21] }} / Speed: {{ s[8] / 2 }}x
                    div(v-else)
                      br
                    div.purple--text.text--lighten-3(v-if="s[22] > 0")
                      | EX {{ s[22] }} / Speed: {{ s[11] / 2 }}x
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
                v-autocomplete(:items="filteredSongs" item-text="FullName" item-value="no" v-model="dialog.songId" label='Song' @change="refreshDialog()")
            div
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
              v-row(v-if="dialog.EX.level > 0")
                v-col.purple--text.text--lighten-3.align-self-center(cols="4")
                  h2 EX {{ dialog.EX.level }}
                v-col(cols="8")
                  v-select(:items='speedItems' item-text="text" item-value="value" label='Speed' v-model="dialog.EX.speed")
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
        },
        EX: {
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
      let mode = this.mode === 'star' ? 0 : 4
      return (mode + parseInt(this.num)) * 27 - (3 - this.page) * 9 - 1
    },
    from () {
      return this.to - 8
    },
    stages () {
      let result = this.$store.getters.stages({ from: this.from, to: this.to })
      result = result.map((r) => {
        let info = this.getSongInfo(r[0])
        r.push(info.FullName)
        r.push(info['Star_1'])
        r.push(info['Star_2'])
        r.push(info['Star_3'])
        r.push(info['Star_4'])
        r.push(info['Pop_1'])
        r.push(info['Pop_2'])
        r.push(info['Pop_3'])
        r.push(info['Pop_4'])
        return r
      })
      return result
    },
    songs () {
      return this.$store.getters.songs
    },
    filteredSongs () {
      let a = this.songs.filter((s) => {
        let r = true
        if (this.isLong(s['no'])) r = false
        if (this.mode === 'star' && parseInt(s['Star_1']) === 0) r = false
        return r
      })
      return a
    }
  },
  methods: {
    isLong (no) {
      no = parseInt(no)
      return no >= 108 && no <= 110
    },
    getSongInfo (no) {
      return this.songs.filter((s) => { return s.no === no })[0]
    },
    getEyecatchUrl (s) {
      return s[0] <= 115 ? './eyecatch/' + s[1] + '_1.jpg' : 'http://localhost:616/customImg?name=' + s[1]
    },
    edit (s, idx) {
      this.dialog.song = {
        FullName: this.getSongInfo(s[0]).FullName,
        name: this.getSongInfo(s[0]).name
      }
      this.dialog.slotNum = idx
      this.dialog.songId = s[0]
      this.dialog.NM.speed = { text: (s[2] / 2).toString(), value: parseInt(s[2]) }
      this.dialog.HD.speed = { text: (s[5] / 2).toString(), value: parseInt(s[5]) }
      this.dialog.MX.speed = { text: (s[8] / 2).toString(), value: parseInt(s[8]) }
      this.dialog.EX.speed = { text: (s[11] / 2).toString(), value: parseInt(s[11]) }
      this.dialog.NM.level = (this.mode === 'star') ? s[15].toString() : s[19].toString()
      this.dialog.HD.level = (this.mode === 'star') ? s[16].toString() : s[20].toString()
      this.dialog.MX.level = (this.mode === 'star') ? s[17].toString() : s[21].toString()
      this.dialog.EX.level = (this.mode === 'star') ? s[18].toString() : s[22].toString()
      this.dialog.show = true
    },
    saveSlot () {
      this.axios.post('http://localhost:616/saveSlot', { slot: this.dialog, mode: this.mode, num: this.num, page: this.page })
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
      this.dialog.EX.speed = { text: '1', value: 2 }
      let info = this.getSongInfo(this.dialog.songId)
      this.dialog.song.name = info.name
      this.dialog.NM.level = (this.mode === 'star') ? info['Star_1'].toString() : info['Pop_1'].toString()
      this.dialog.HD.level = (this.mode === 'star') ? info['Star_2'].toString() : info['Pop_2'].toString()
      this.dialog.MX.level = (this.mode === 'star') ? info['Star_3'].toString() : info['Pop_3'].toString()
      this.dialog.EX.level = (this.mode === 'star') ? info['Star_4'].toString() : info['Pop_4'].toString()
    }
  },
  beforeRouteUpdate (to, from, next) {
    this.page = 1
    next()
  }
}
</script>
