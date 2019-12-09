<template lang="pug">
  div.home
    v-container(fill-height v-if="customSongs.length > 0")
      v-row(:justify="'center'")
        v-col(cols="10")
          h1.white--text Custom Songs
          hr
          v-row
            v-col(cols='4' v-for="(s, idx) in customSongs" :key="idx")
              v-card
                v-img.white--text.align-end(height='200px' :src="'http://localhost:616/customImg?name=' + s['name']")
                v-card-title {{ s['FullName'] }}
                v-card-text.text--primary
                  div(v-if="parseInt(s['Star_1']) > 0") STAR MIXING
                  div.yellow--text.lighten-1(v-if="parseInt(s['Star_1']) > 0") NM {{ s['Star_1'] }}
                  br
                  div POP MIXING
                  div
                    span.yellow--text.lighten-1 NM {{ s['Pop_1'] }}
                    span(v-if="s['Pop_2'] > 0") &emsp;/&emsp;
                    span.blue--text(v-if="s['Pop_2'] > 0") HD {{ s['Pop_2'] }}
                    span(v-if="s['Pop_3'] > 0") &emsp;/&emsp;
                    span.red--text(v-if="s['Pop_3'] > 0") MX {{ s['Pop_3'] }}
                v-btn.btn-edit(absolute icon dark fab bottom right color='green' @click="edit(s)")
                  v-icon edit
    v-container(fill-height v-else)
      v-row(:justify="'center'")
        v-col(cols="10")
          h1.white--text Custom Songs
          hr
          br
          p Can't find any custom songs. You can download some from
            | &nbsp;
            a(href="#" @click="openExternal('https://github.com/rogeraabbccdd/DMT2-Songs')") here
            | .
    v-btn(absolute dark fab bottom right color='pink' @click="initDialog()")
      v-icon mdi-plus
    v-dialog(v-model='dialog.show' width='500')
      v-form(ref='form' v-model='dialog.valid')
        v-card
          v-card-title.headline.blue.darken-2(primary-title) {{ dialog.mode ==='add' ? 'Add new' : 'Edit'}} song
          v-card-text
            v-container
              v-row
                v-col(cols="12")
                  v-alert(type='error') Make sure you have installed all needed files.
                  v-text-field(v-model='dialog.name' label='Song ID' :messages="['A short text without space of song name, e.g. rayof, cypher']" :rules="[v => !!v || 'Required']")
                  br
                  v-text-field(v-model='dialog.FullName' label='Song fullname' :messages="['Fullname of song']" :rules="[v => !!v || 'Required']")
                  br
                  v-text-field(v-model='dialog.Genre' label='Genre' :messages="['Genre of song, e.g. trance, dubstep']" :rules="[v => !!v || 'Required']")
                  br
                  v-text-field(v-model='dialog.Composer' label='Composer' :messages="['Composer of song, e.g. M2U, XeoN']" :rules="[v => !!v || 'Required']")
                  br
                  v-switch(v-model='dialog.loopBga' label='Loop BGA')
                  br
                  v-text-field(v-model='dialog.Star_1' label='STAR difficulty' :messages="[`0 if doesn't exists`]" type='number' :rules="[v => !!v || 'Required']")
                  br
                  v-text-field(v-model='dialog.Pop_1' label='NM difficulty' :messages="[`0 if doesn't exists`]" type='number' :rules="[v => !!v || 'Required']")
                  br
                  v-text-field(v-model='dialog.Pop_2' label='HD difficulty' :messages="[`0 if doesn't exists`]" type='number' :rules="[v => !!v || 'Required']")
                  br
                  v-text-field(v-model='dialog.Pop_3' label='MX difficulty' :messages="[`0 if doesn't exists`]" type='number' :rules="[v => !!v || 'Required']")
          v-divider
          v-card-actions
            v-spacer
            v-btn(color='red' text @click="dialog.show = false") Cancel
            v-btn(color='green darken-1' text @click='addSong()') Save
</template>

<script>
import { eventBus } from '../main.js'
import { shell } from 'electron'

export default {
  name: 'home',
  data () {
    return {
      dialog: {
        mode: 'add',
        songNo: 0,
        valid: true,
        show: false,
        name: '',
        FullName: '',
        Genre: '',
        Composer: '',
        loopBga: 0,
        Star_1: 0,
        Pop_1: 0,
        Pop_2: 0,
        Pop_3: 0
      }
    }
  },
  computed: {
    songs () {
      return this.$store.getters.songs
    },
    customSongs () {
      return this.$store.getters.songs.filter((s) => {
        return parseInt(s['no']) >= 116
      })
    }
  },
  methods: {
    isLong (no) {
      no = parseInt(no)
      return no >= 108 && no <= 110
    },
    openExternal (url) {
      shell.openExternal(url)
    },
    addSong () {
      if (this.$refs.form.validate()) {
        if (this.dialog.mode === 'add') this.dialog.songNo = parseInt(this.songs[this.songs.length - 1].no) + 1
        this.axios.post('http://localhost:616/custom', this.dialog).then((res) => {
          if (res.data.success === true) {
            this.$swal({ type: 'success', title: 'Success' })
            eventBus.$emit('init')
          } else {
            this.$swal({ type: 'error', title: 'Error', text: res.data.msg })
          }
        }).catch((err) => {
          this.$swal({ type: 'error', title: 'Error', text: err })
        })
      }
    },
    edit (song) {
      const loop = song.loopBga === 'FALSE' ? 0 : 1
      this.dialog = {
        mode: 'edit',
        songNo: song.no,
        valid: true,
        show: true,
        name: song.name,
        FullName: song.FullName,
        Genre: song.Genre,
        Composer: song.Composer,
        loopBga: loop,
        Star_1: song.Star_1,
        Pop_1: song.Pop_1,
        Pop_2: song.Pop_2,
        Pop_3: song.Pop_3
      }
    },
    initDialog () {
      this.dialog = {
        mode: 'add',
        songNo: 0,
        show: true,
        name: '',
        FullName: '',
        Genre: '',
        Composer: '',
        loopBga: 0,
        Star_1: 0,
        Pop_1: 0,
        Pop_2: 0,
        Pop_3: 0
      }
    }
  }
}
</script>
