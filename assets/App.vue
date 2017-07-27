<template>
  <v-app dark footer toolbar>
    <v-navigation-drawer class="pb-0"
                         style="width: 280px"
                         temporary
                         v-model="$store.state.drawer"
    >
      <v-list>
        <v-list-tile id="title" to="/">
          <v-list-tile-action>
            <img src="static/images/icon2.png" height="50"/>
          </v-list-tile-action>
          <v-list-tile-title class="title">
            かわニメ
          </v-list-tile-title>
        </v-list-tile>
        <template v-for="item in itemGroup">
          <v-list-group v-if="item.items"
                        :key="item.title">
            <v-list-tile slot="item" class="ripple" ripple>
              <v-list-tile-action>
                <v-icon>{{ item.action }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-title>
                {{ item.title }}
              </v-list-tile-title>
              <v-list-tile-action>
                <v-icon>
                  keyboard_arrow_down
                </v-icon>
              </v-list-tile-action>
            </v-list-tile>
            <v-list-tile v-for="subItem in item.items"
                         class="ripple"
                         ripple
                         :to="subItem.href"
                         :key="subItem.title">
              <v-list-tile-action>
                <v-icon>{{ subItem.action }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-divider></v-divider>
          </v-list-group>
          <v-subheader v-else-if="item.header" class="white--text">{{ item.header }}</v-subheader>
          <v-divider v-else-if="item.divider"></v-divider>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-system-bar dark
                  status
                  class="wb dragable"
                  v-if="!browser">
      <v-spacer></v-spacer>
      <div v-if="$store.state.platform !== 'darwin'">
        <v-icon class="window-icon" @click="actOnWindow('minimize')">remove</v-icon>
        <v-icon class="window-icon" @click="actOnWindow('maximize')">check_box_outline_blank</v-icon>
        <v-icon class="window-icon" @click="actOnWindow('close')">close</v-icon>
      </div>
    </v-system-bar>

    <v-toolbar fixed dark class="mablue tb">
      <v-toolbar-side-icon @click.stop="toggleDrawer()"></v-toolbar-side-icon>
      <v-toolbar-title class="white--text title hidden-xs-only">かわニメ</v-toolbar-title>
      <v-spacer></v-spacer>
      <info-modal></info-modal>
      <v-btn icon
             class="open-in-browser"
             v-tooltip:left="{ html: 'Open KawAnime in your browser' }"
             @click="openInBrowser()">
        <v-icon>open_in_new</v-icon>
      </v-btn>
      <settings></settings>
    </v-toolbar>

    <main class="m">
      <transition name="page" mode="out-in">
        <router-view></router-view>
      </transition>
    </main>

    <env v-if="$store.state.NODE_ENV"></env>

    <!-- Displayed if an error occurred -->
    <v-snackbar
      :timeout="5000"
      :top="true"
      :bottom="false"
      :right="false"
      :left="false"
      v-model="$store.state.infoSnackbar.show"
    >
      {{ $store.state.infoSnackbar.text }}
      <v-btn flat class="pink--text" @click="$store.state.infoSnackbar.show = false">Close</v-btn>
    </v-snackbar>

    <v-footer class="grey darken-4">
      <v-spacer></v-spacer>
      <div class="white--text">&copy; 2016 - 2017 Kylart</div>
    </v-footer>
  </v-app>
</template>

<script>
  import axios from 'axios'
  import Meta from 'mixins/meta'

  export default {
    mixins: [Meta],
    data () {
      return {
        searchModal: false,
        drawer: false,
        browser: false,
        links: [
          {link: 'Github', to: 'https://github.com/Kylart/KawAnime', icon: 'github-circle'},
          {link: 'Updates', to: '', icon: ''}
        ],
        itemGroup: [
          {divider: true},
          {header: 'Core'},
          {
            title: 'Downloading',
            action: 'file_download',
            items: [
              {
                title: 'Downloader',
                action: 'file_download',
                href: '/downloader'
              }, {
                title: 'Latest releases',
                action: 'access_time',
                href: '/'
              }
            ]
          }, {
            title: 'News',
            action: 'info_outline',
            items: [
              {
                title: 'Seasons',
                action: 'hourglass_empty',
                href: '/seasons'
              },
              {
                title: 'News',
                action: 'more',
                href: '/news'
              }
            ]
          },
          {divider: true},
          {header: 'Local'},
          {
            title: 'Anime related',
            action: 'folder_open',
            items: [
              {
                title: 'Animes',
                action: 'tv',
                href: '/localPage'
              }, {
                title: 'Watch list',
                action: 'sort_by_alpha',
                href: '/watchList'
              }
            ]
          }
//            Too soon...
//          {
//            title: 'Torrenting',
//            items: [
//              {title: 'Current downloads'},
//              {title: 'Sourcing'},
//              {title: 'Create torrents'}
//            ]
//          }
        ]
      }
    },
    methods: {
      toggleDrawer () {
        this.$store.commit('toggleDrawer')
      },
      actOnWindow (action) {
        axios.get('/_win', {
          params: {
            action
          }
        })
      },
      openInBrowser () {
        this.browser = true
        this.$store.dispatch('openInBrowser')
      }
    }
  }
</script>

<style scoped>
  .m
  {
    min-width: 100%;
  }

  .wb
  {
    position: fixed;
    width: 100%;
    z-index: 20;
    background-color: #303030 !important;
  }

  .tb
  {
    margin-top: 24px;
    max-height: 48px;
    padding-left: 1%;
  }

  .navigation-drawer
  {
    padding-top: 24px;
    background-image: url('/static/images/sidebar-background.png');
    background-position: left bottom;
    background-size: 75%;
  }

  .ripple
  {
    position: relative;
  }

  .window-icon
  {
    cursor: pointer;
  }

  .title
  {
    overflow: hidden;
    padding-left: 20px;
    font-family: 'Hiragino Mincho Pro', 'MS PMincho', serif;
    font-size: 30px !important;
  }
</style>

<style lang="stylus">
  @import './stylus/main'
</style>