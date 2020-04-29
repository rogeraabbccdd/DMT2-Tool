<template lang="pug">
  div.home
    v-container(fill-height v-if="songs.length > 0")
      v-row(:justify="'center'")
        v-col(cols="10")
          h1.white--text Songs
          hr
          v-row
            v-col(cols="12")
              v-text-field(placeholder="Type to search..." prepend-icon="search" v-model="search")
          v-row.cards
            v-col(cols='4' v-for="(s, idx) in filteredSongs" :key="idx" v-if="s['no'] !== '39'")
              v-card
                v-img.white--text.align-end(height='200px' :src="'./eyecatch/'+s['name']+'_1.jpg'" v-if="")
                v-card-title {{ s['FullName'] }}
                v-card-text.text--primary
                  div(v-if="s['Star_1'] > 0 || s['Star_2'] > 0 || s['Star_3'] > 0 || s['Star_4'] > 0") STAR MIXING
                  div
                    span.yellow--text.lighten-1(v-if="s['Star_1'] > 0") NM {{ s['Star_1'] }}
                    span(v-if="s['Star_2'] > 0") &emsp;/&emsp;
                    span.blue--text(v-if="s['Star_2'] > 0") HD {{ s['Star_2'] }}
                    span(v-if="s['Star_3'] > 0") &emsp;/&emsp;
                    span.red--text(v-if="s['Star_3'] > 0") MX {{ s['Star_3'] }}
                    span(v-if="s['Star_4'] > 0") &emsp;/&emsp;
                    span.purple--text.text--lighten-3(v-if="s['Star_4'] > 0") EX {{ s['Star_4'] }}
                  br
                  div POP MIXING
                  div
                    span.yellow--text.lighten-1 NM {{ s['Pop_1'] }}
                    span(v-if="s['Pop_2'] > 0") &emsp;/&emsp;
                    span.blue--text(v-if="s['Pop_2'] > 0") HD {{ s['Pop_2'] }}
                    span(v-if="s['Pop_3'] > 0") &emsp;/&emsp;
                    span.red--text(v-if="s['Pop_3'] > 0") MX {{ s['Pop_3'] }}
                    span(v-if="s['Pop_4'] > 0") &emsp;/&emsp;
                    span.purple--text.text--lighten-3(v-if="s['Pop_4'] > 0") EX {{ s['Pop_4'] }}
                  v-btn.btn-edit(absolute icon dark fab bottom right color='green' @click="edit(s)")
                    v-icon edit
    v-container(fill-height v-else)
      v-row(:justify="'center'")
        v-col(cols="10")
          h1.white--text Songs
          hr
          br
          p Can't find any songs, please set your game path in settings page.
    v-dialog(v-model='dialog.show' width='500')
      v-form(ref='form' v-model='dialog.valid')
        v-card
          v-card-title.headline.blue.darken-2(primary-title) {{ dialog.mode ==='add' ? 'Add new' : 'Edit'}} song
          v-card-text
            v-container
              v-row
                v-col(cols="12")
                  v-alert(type='error') Make sure you have installed all needed files.
                  v-alert(type='error') You can only add new difficulties which is not exists in original game.
                  v-text-field(disabled v-model='dialog.name' label='Song ID' :messages="['A short text without space of song name, e.g. rayof, cypher']" :rules="[v => !!v || 'Required']")
                  br
                  v-text-field(disabled v-model='dialog.FullName' label='Song fullname' :messages="['Fullname of song']" :rules="[v => !!v || 'Required']")
                  br
                  v-text-field(disabled v-model='dialog.Genre' label='Genre' :messages="['Genre of song, e.g. trance, dubstep']" :rules="[v => !!v || 'Required']")
                  br
                  v-text-field(disabled v-model='dialog.Composer' label='Composer' :messages="['Composer of song, e.g. M2U, XeoN']" :rules="[v => !!v || 'Required']")
                  br
                  v-switch(disabled v-model='dialog.loopBga' label='Loop BGA')
                  br
                  v-text-field(:disabled="isDefault('Star_1')" v-model='dialog.Star_1' label='STAR NM difficulty' :messages="[`0 if doesn't exist`]" type='number' min="0" :rules="rules")
                  br
                  v-text-field(:disabled="isDefault('Star_2')" v-model='dialog.Star_2' label='STAR HD difficulty' :messages="[`0 if doesn't exist`]" type='number' min="0" :rules="rules")
                  br
                  v-text-field(:disabled="isDefault('Star_3')" v-model='dialog.Star_3' label='STAR MX difficulty' :messages="[`0 if doesn't exist`]" type='number' min="0" :rules="rules")
                  br
                  v-text-field(:disabled="isDefault('Star_4')" v-model='dialog.Star_4' label='STAR EX difficulty' :messages="[`0 if doesn't exist`]" type='number' min="0" :rules="rules")
                  br
                  v-text-field(:disabled="isDefault('Pop_1')" v-model='dialog.Pop_1' label='POP NM difficulty' :messages="[`0 if doesn't exist`]" type='number' min="0" :rules="rules")
                  br
                  v-text-field(:disabled="isDefault('Pop_2')" v-model='dialog.Pop_2' label='POP HD difficulty' :messages="[`0 if doesn't exist`]" type='number' min="0" :rules="rules")
                  br
                  v-text-field(:disabled="isDefault('Pop_3')" v-model='dialog.Pop_3' label='POP MX difficulty' :messages="[`0 if doesn't exist`]" type='number' min="0" :rules="rules")
                  br
                  v-text-field(:disabled="isDefault('Pop_4')" v-model='dialog.Pop_4' label='POP EX difficulty' :messages="[`0 if doesn't exist`]" type='number' min="0" :rules="rules")
          v-divider
          v-card-actions
            v-spacer
            v-btn(color='red' text @click="dialog.show = false") Cancel
            v-btn(color='green darken-1' text @click='addSong()') Save
</template>

<script>
import { eventBus } from '../main.js'

export default {
  name: 'home',
  data () {
    return {
      search: '',
      rules: [
        v => !!v || 'Required',
        v => parseInt(v) >= 0 || 'Minimum is 0'
      ],
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
        Star_2: 0,
        Star_3: 0,
        Star_4: 0,
        Pop_1: 0,
        Pop_2: 0,
        Pop_3: 0,
        Pop_4: 0
      }
    }
  },
  computed: {
    songs () {
      return this.$store.getters.songs.filter((s) => {
        return parseInt(s['no']) < 116
      })
    },
    defaultSongs () {
      return this.$store.getters.defaultSongs
    },
    filteredSongs () {
      return this.songs.filter((song) => {
        return song.FullName.toUpperCase().includes(this.search.toUpperCase())
      })
    }
  },
  methods: {
    isLong (no) {
      no = parseInt(no)
      return no >= 108 && no <= 110
    },
    addSong () {
      if (this.$refs.form.validate()) {
        if (this.dialog.mode === 'add') {
          this.dialog.songNo = this.$store.getters.lastno + 1
        }
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
    isDefault (difficulty) {
      return this.defaultSongs.filter((song) => {
        return song[difficulty] > 0 && song.no === this.dialog.songNo
      }).length > 0
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
        Star_2: song.Star_2,
        Star_3: song.Star_3,
        Star_4: song.Star_4,
        Pop_1: song.Pop_1,
        Pop_2: song.Pop_2,
        Pop_3: song.Pop_3,
        Pop_4: song.Pop_4
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
        Star_2: 0,
        Star_3: 0,
        Star_4: 0,
        Pop_1: 0,
        Pop_2: 0,
        Pop_3: 0,
        Pop_4: 0
      }
    }
  }
}
</script>
