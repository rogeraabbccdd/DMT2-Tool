<template lang="pug">
  div.home
    v-container(fill-height v-if="songs.length > 0")
      v-row(:justify="'center'")
        v-col(cols="10")
          h1.white--text Songs
          hr
          v-row
            v-col(cols='4' v-for="(s, idx) in songs" :key="idx" v-if="s['no'] !== '39'")
              v-card
                v-img.white--text.align-end(height='200px' :src="'./eyecatch/'+s['name']+'_1.jpg'" v-if="")
                v-card-title {{ s['FullName'] }}
                v-card-text.text--primary
                  div(v-if="!isLong(s['no'])") STAR MIXING
                  div.yellow--text.lighten-1(v-if="!isLong(s['no'])") NM {{ s['Star_1'] }}
                  br
                  div POP MIXING
                  div
                    span.yellow--text.lighten-1 NM {{ s['Pop_1'] }}
                    span(v-if="s['Pop_2'] > 0") &emsp;/&emsp;
                    span.blue--text(v-if="s['Pop_2'] > 0") HD {{ s['Pop_2'] }}
                    span(v-if="s['Pop_3'] > 0") &emsp;/&emsp;
                    span.red--text(v-if="s['Pop_3'] > 0") MX {{ s['Pop_3'] }}
    v-container(fill-height v-else)
      v-row(:justify="'center'")
        v-col(cols="10")
          h1.white--text Songs
          hr
          br
          p Can't find any songs, please set your game path in settings page.
</template>

<script>
export default {
  name: 'home',
  computed: {
    songs () {
      return this.$store.getters.songs
    }
  },
  methods: {
    isLong (no) {
      no = parseInt(no)
      return no >= 108 && no <= 110
    }
  }
}
</script>
