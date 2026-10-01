<template>
  <div :class="classObj" class="app-wrapper">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar class="sidebar-container" />
    <div :class="{hasTagsView:needTagsView}" class="main-container">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <right-panel v-if="showSettings">
        <settings />
      </right-panel>
    </div>
    <!-- 引导页 -->
    <div class="help-container" @click="openGuide">
      <img src="@/assets/image/guide-float.png"/>
      <span>帮助引导</span>
    </div>
    <help :open="open" @close="closeGuide"></help>
  </div>
</template>

<script>
import RightPanel from '@/components/RightPanel'
import { AppMain, Navbar, Settings, Sidebar, TagsView } from './components'

import ResizeMixin from './mixin/ResizeHandler'
import { mapState } from 'vuex'
import Help from './components/help/index.vue'

export default {
  name: 'Layout',
  components: {
      AppMain,
      Navbar,
      RightPanel,
      Settings,
      Sidebar,
      TagsView,
      Help
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapState({
      sidebar: state => state.app.sidebar,
      device: state => state.app.device,
      showSettings: state => state.settings.showSettings,
      needTagsView: state => state.settings.tagsView,
      fixedHeader: state => state.settings.fixedHeader
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    }
  },
  data() {
    return {
      open:false
    }
  },
  methods: {
    openGuide() {
      this.open = true;
    },
    closeGuide() {
      this.open = false;
    },
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    },
    handleSelect() {

    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/assets/styles/mixin.scss";
  @import "~@/assets/styles/variables.scss";

  .app-wrapper {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;

    &.mobile.openSidebar {
      position: fixed;
      top: 0;
    }
  }

  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
  }

  .hideSidebar .fixed-header {
    width: calc(100% - 54px)
  }

  .mobile .fixed-header {
    width: 100%;
  }

  .help-container {
    position: fixed;
    right: 0;
    bottom: 90px;
    background: #FFFFFF;
    border: 1px solid rgba(240,240,240,1);
    box-shadow: 0px 1px 6px 0px rgba(205,205,205,0.18);
    border-radius: 2px;
    width: 64px;
    height: 74px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    cursor: pointer;
    img {
      width: 28px;
      height: 28px;
    }
    span {
      font-family: PingFangSC-Regular;
      font-size: 12px;
      color: #333333;
      font-weight: 400;
      margin-top: 6px;
      transition: all .3s;
      &:hover {
        color: #409EFF;
      }
    }
  }
</style>
