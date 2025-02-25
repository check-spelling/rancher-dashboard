<script>
import { mapGetters } from 'vuex';
import { NORMAN, HCI } from '@/config/types';
import { NAME as VIRTUAL } from '@/config/product/harvester';
import { ucFirst } from '@/utils/string';
import { isMac } from '@/utils/platform';
import Import from '@/components/Import';
import BrandImage from '@/components/BrandImage';
import { getProduct } from '@/config/private-label';
import RancherProviderIcon from '@/components/RancherProviderIcon';
import { LOGGED_OUT } from '@/config/query-params';
import NamespaceFilter from './NamespaceFilter';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import TopLevelMenu from './TopLevelMenu';
import Jump from './Jump';

const PAGE_HEADER_ACTION = 'page-action';

export default {

  components: {
    NamespaceFilter,
    WorkspaceSwitcher,
    Import,
    TopLevelMenu,
    Jump,
    BrandImage,
    RancherProviderIcon
  },

  props: {
    simple: {
      type:    Boolean,
      default: false
    }
  },

  data() {
    const searchShortcut = isMac ? '(\u2318-K)' : '(Ctrl+K)';
    const shellShortcut = '(Ctrl+`)';

    return {
      show:        false,
      showTooltip: false,
      searchShortcut,
      shellShortcut,
      VIRTUAL,
      LOGGED_OUT,
    };
  },

  computed: {
    ...mapGetters(['clusterReady', 'isExplorer', 'isMultiCluster', 'isRancher', 'currentCluster',
      'currentProduct', 'backToRancherLink', 'backToRancherGlobalLink', 'pageActions', 'isSingleVirtualCluster']),
    ...mapGetters('type-map', ['activeProducts']),

    appName() {
      return getProduct();
    },

    authEnabled() {
      return this.$store.getters['auth/enabled'];
    },

    principal() {
      return this.$store.getters['rancher/byId'](NORMAN.PRINCIPAL, this.$store.getters['auth/principalId']) || {};
    },

    kubeConfigEnabled() {
      return true;
    },

    shellEnabled() {
      return !!this.currentCluster?.links?.shell;
    },

    showKubeShell() {
      return !this.currentProduct?.hideKubeShell;
    },

    showKubeConfig() {
      return !this.currentProduct?.hideKubeConfig;
    },

    showCopyConfig() {
      return !this.currentProduct?.hideCopyConfig;
    },

    importEnabled() {
      return !!this.currentCluster?.actions?.apply;
    },

    prod() {
      const name = this.currentProduct.name;

      return this.$store.getters['i18n/withFallback'](`product."${ name }"`, null, ucFirst(name));
    },

    showSearch() {
      return this.currentProduct?.inStore === 'cluster';
    },

    showImportYaml() {
      return this.currentProduct?.inStore !== 'harvester';
    },

    nameTooltip() {
      return !this.showTooltip ? {} : {
        content: this.currentCluster?.nameDisplay,
        delay:   400,
      };
    },

    harvesterDashboard() {
      const cluster = this.$store.getters.defaultClusterId;

      return {
        name:   'c-cluster-product-resource',
        params: {
          cluster,
          product:  VIRTUAL,
          resource: HCI.DASHBOARD,
        }
      };
    },
  },

  watch: {
    currentCluster(nue, old) {
      if (nue && old && nue.id !== old.id) {
        this.checkClusterName();
      }
    }
  },

  mounted() {
    this.checkClusterName();
  },

  methods: {
    showMenu(show) {
      if (this.$refs.popover) {
        if (show) {
          this.$refs.popover.show();
        } else {
          this.$refs.popover.hide();
        }
      }
    },

    openImport() {
      this.$modal.show('importModal');
    },

    closeImport() {
      this.$modal.hide('importModal');
    },

    openSearch() {
      this.$modal.show('searchModal');
    },

    hideSearch() {
      this.$modal.hide('searchModal');
    },

    showPageActionsMenu(show) {
      if (this.$refs.pageActions) {
        if (show) {
          this.$refs.pageActions.show();
        } else {
          this.$refs.pageActions.hide();
        }
      }
    },

    pageAction(action) {
      this.$nuxt.$emit(PAGE_HEADER_ACTION, action);
    },

    checkClusterName() {
      this.$nextTick(() => {
        const el = this.$refs.clusterName;

        this.showTooltip = el && (el.clientWidth < el.scrollWidth);
      });
    }
  }
};
</script>

<template>
  <header :class="{'simple': simple}">
    <div class="menu-spacer">
      <n-link v-if="isSingleVirtualCluster" :to="harvesterDashboard">
        <img
          class="side-menu-logo"
          src="~/assets/images/providers/harvester.svg"
        />
      </n-link>
    </div>
    <div v-if="!simple" class="product">
      <div v-if="currentProduct && currentProduct.showClusterSwitcher" v-tooltip="nameTooltip" class="cluster cluster-clipped">
        <div v-if="isSingleVirtualCluster" class="product-name">
          {{ t('product.harvester') }}
        </div>
        <template v-else>
          <RancherProviderIcon v-if="currentCluster && currentCluster.isLocal" class="mr-10 cluster-local-logo" width="25" />
          <img v-else-if="currentCluster && currentCluster.providerNavLogo" class="cluster-os-logo" :src="currentCluster.providerNavLogo" />
          <div v-if="currentCluster" ref="clusterName" class="cluster-name">
            {{ currentCluster.spec.displayName }}
          </div>
          <div v-else class="simple-title">
            <BrandImage class="side-menu-logo-img" file-name="rancher-logo.svg" />
          </div>
        </template>
      </div>
      <div v-if="currentProduct && !currentProduct.showClusterSwitcher" class="cluster">
        <div class="product-name">
          {{ prod }}
        </div>
      </div>
    </div>
    <div v-else class="simple-title">
      <div v-if="isSingleVirtualCluster" class="product-name">
        {{ t('product.harvester') }}
      </div>

      <div v-else class="side-menu-logo">
        <BrandImage class="side-menu-logo-img" file-name="rancher-logo.svg" />
      </div>
    </div>

    <div>
      <TopLevelMenu v-if="isMultiCluster || !isSingleVirtualCluster"></TopLevelMenu>
    </div>
    <div
      v-if="currentCluster && !simple && (currentProduct.showNamespaceFilter || currentProduct.showWorkspaceSwitcher)"
      class="top"
    >
      <NamespaceFilter v-if="clusterReady && currentProduct && (currentProduct.showNamespaceFilter || isExplorer)" />
      <WorkspaceSwitcher v-else-if="clusterReady && currentProduct && currentProduct.showWorkspaceSwitcher" />
    </div>

    <div v-if="currentCluster && !simple" class="header-buttons">
      <template v-if="currentProduct && currentProduct.showClusterSwitcher">
        <button
          v-if="showImportYaml"
          v-tooltip="t('nav.import')"
          :disabled="!importEnabled"
          type="button"
          class="btn header-btn role-tertiary"
          @click="openImport()"
        >
          <i class="icon icon-upload icon-lg" />
        </button>
        <modal
          class="import-modal"
          name="importModal"
          width="75%"
          height="auto"
          styles="max-height: 90vh;"
        >
          <Import :cluster="currentCluster" @close="closeImport" />
        </modal>

        <button
          v-if="showKubeShell"
          v-tooltip="t('nav.shellShortcut', {key: shellShortcut})"
          v-shortkey="{windows: ['ctrl', '`'], mac: ['meta', '`']}"
          :disabled="!shellEnabled"
          type="button"
          class="btn header-btn role-tertiary"
          @shortkey="currentCluster.openShell()"
          @click="currentCluster.openShell()"
        >
          <i class="icon icon-terminal icon-lg" />
        </button>

        <button
          v-if="showKubeConfig"
          v-tooltip="t('nav.kubeconfig.download')"
          :disabled="!kubeConfigEnabled"
          type="button"
          class="btn header-btn role-tertiary"
          @click="currentCluster.downloadKubeConfig()"
        >
          <i class="icon icon-file icon-lg" />
        </button>

        <button
          v-if="showCopyConfig"
          v-tooltip="t('nav.kubeconfig.copy')"
          :disabled="!kubeConfigEnabled"
          type="button"
          class="btn header-btn role-tertiary"
          @click="currentCluster.copyKubeConfig()"
        >
          <i class="icon icon-copy icon-lg" />
        </button>
      </template>

      <button
        v-if="showSearch"
        v-tooltip="t('nav.resourceSearch.toolTip', {key: searchShortcut})"
        v-shortkey="{windows: ['ctrl', 'k'], mac: ['meta', 'k']}"
        type="button"
        class="btn header-btn role-tertiary"
        @shortkey="openSearch()"
        @click="openSearch()"
      >
        <i class="icon icon-search icon-lg" />
      </button>
      <modal
        v-if="showSearch"
        class="search-modal"
        name="searchModal"
        width="50%"
        height="auto"
      >
        <Jump @closeSearch="hideSearch()" />
      </modal>
    </div>

    <div v-if="pageActions && pageActions.length" class="actions">
      <i class="icon icon-actions" @blur="showPageActionsMenu(false)" @click="showPageActionsMenu(true)" @focus.capture="showPageActionsMenu(true)" />
      <v-popover
        ref="pageActions"
        placement="bottom-end"
        offset="0"
        trigger="manual"
        :delay="{show: 0, hide: 0}"
        :popper-options="{modifiers: { flip: { enabled: false } } }"
        :container="false"
      >
        <template slot="popover" class="user-menu">
          <ul class="list-unstyled dropdown" @click.stop="showPageActionsMenu(false)">
            <li v-for="a in pageActions" :key="a.label" class="user-menu-item">
              <a v-if="!a.seperator" @click="pageAction(a)">{{ a.labelKey ? t(a.labelKey) : a.label }}</a>
              <div v-else class="menu-seperator">
                <div class="menu-seperator-line" />
              </div>
            </li>
          </ul>
        </template>
      </v-popover>
    </div>

    <div class="header-spacer"></div>

    <div class="user user-menu" tabindex="0" @blur="showMenu(false)" @click="showMenu(true)" @focus.capture="showMenu(true)">
      <v-popover
        ref="popover"
        placement="bottom-end"
        offset="-10"
        trigger="manual"
        :delay="{show: 0, hide: 0}"
        :popper-options="{modifiers: { flip: { enabled: false } } }"
        :container="false"
      >
        <div class="user-image text-right hand">
          <img v-if="principal && principal.avatarSrc" :src="principal.avatarSrc" :class="{'avatar-round': principal.roundAvatar}" width="36" height="36" />
          <i v-else class="icon icon-user icon-3x avatar" />
        </div>
        <template slot="popover" class="user-menu">
          <ul class="list-unstyled dropdown" @click.stop="showMenu(false)">
            <li v-if="authEnabled" class="user-info">
              <div class="user-name">
                <i class="icon icon-lg icon-user" /> {{ principal.loginName }}
              </div>
              <div class="text-small pt-5 pb-5">
                {{ principal.name }}
              </div>
            </li>
            <nuxt-link tag="li" :to="{name: 'prefs'}" class="user-menu-item">
              <a>{{ t('nav.userMenu.preferences') }} <i class="icon icon-fw icon-gear" /></a>
            </nuxt-link>
            <nuxt-link v-if="isRancher || isSingleVirtualCluster" tag="li" :to="{name: 'account'}" class="user-menu-item">
              <a>{{ t('nav.userMenu.accountAndKeys', {}, true) }} <i class="icon icon-fw icon-user" /></a>
            </nuxt-link>
            <nuxt-link v-if="authEnabled" tag="li" :to="{name: 'auth-logout', query: { [LOGGED_OUT]: true }}" class="user-menu-item">
              <a @blur="showMenu(false)">{{ t('nav.userMenu.logOut') }} <i class="icon icon-fw icon-close" /></a>
            </nuxt-link>
          </ul>
        </template>
      </v-popover>
    </div>
  </header>
</template>
<style lang="scss" scoped>
  HEADER {
    display: grid;

    .title {
      border-left: 1px solid var(--header-border);
      padding-left: 10px;
      opacity: 0.7;
      text-transform: uppercase;
    }

    .filter {
      ::v-deep .labeled-select,
      ::v-deep .unlabeled-select {
        .vs__search::placeholder {
          color: var(--body-text) !important;
        }

        .vs__dropdown-toggle .vs__actions:after {
          color: var(--body-text) !important;
          font-size: 1.5rem;
          padding-right: 4px;
        }

        .vs__dropdown-toggle {
          background: transparent;
          border: 1px solid var(--header-border);
        }
      }
    }

    > * {
      padding: 0 5px;
    }

    .actions {
      align-items: center;
      cursor: pointer;
      display: flex;
      grid-area: header-actions;

      > I {
        font-size: 18px;
        padding: 6px;
        &:hover {
          color: var(--link);
        }
      }
    }

    .back {
      padding-top: 6px;

      > *:first-child {
        height: 40px;
      }
    }

    .simple-title {
      align-items: center;
      display: flex;

      .title {
        height: 24px;
        line-height: 24px;
      }
    }

    .user-menu {
      padding-top: 9.5px;
    }

    ::v-deep > div > .btn.role-tertiary {
      border: 1px solid var(--header-btn-bg);
      border: none;
      background: var(--header-btn-bg);
      color: var(--header-btn-text);
      padding: 0 10px;
      line-height: 32px;
      min-height: 32px;

      i {
        // Ideally same height as the parent button, but this means tooltip needs adjusting (which is it's own can of worms)
        line-height: 20px;
      }

      &:hover {
        background: var(--primary);
        color: #fff;
      }

      &[disabled=disabled] {
        background-color: rgba(0,0,0,0.25) !important;
        color: var(--header-btn-text) !important;
        opacity: 0.7;
      }
    }

    grid-template-areas:  "menu product top buttons header-actions cluster user";
    grid-template-columns: var(--header-height) calc(var(--nav-width) - var(--header-height)) auto min-content min-content min-content var(--header-height);
    grid-template-rows:    var(--header-height);

    &.simple {
      grid-template-columns: var(--header-height) min-content auto min-content min-content min-content var(--header-height);
    }

    > .menu-spacer {
      width: 65px;
      grid-area: menu;
    }

    .cluster {
      align-items: center;
      display: flex;
      height: 32px;
      white-space: nowrap;
      .cluster-os-logo {
        width: 32px;
        height: 32px;
        margin-right: 10px;
      }
      .cluster-local-logo {
        flex: 0 0 25px;
      }
      .cluster-name {
        font-size: 16px;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      &.cluster-clipped {
        overflow: hidden;
      }
    }

    > .product {
      grid-area: product;
      align-items: center;
      position: relative;
      display: flex;

      .logo {
        height: 30px;
        position: absolute;
        top: 9px;
        left: 0;
        z-index: 2;

        img {
          height: 30px;
        }
      }
    }

    .header-buttons {
      align-items: center;
      display: flex;
      grid-area: buttons;
      margin-top: 1px;

      // Spacing between header buttons
      .btn:not(:last-of-type) {
        margin-right: 10px;
      }

      .btn:focus {
        box-shadow: none;
      }
    }

    .product-name {
      font-size: 16px;
    }

    .side-menu-logo {
      align-items: center;
      display: flex;
      margin-right: 8px;
      height: 55px;
      margin-left: 5px;
      max-width: 200px;
      padding: 12px 0;
    }

    .side-menu-logo-img {
      object-fit: contain;
      height: 21px;
      max-width: 200px;
    }

    > * {
      background-color: var(--header-bg);
      border-bottom: var(--header-border-size) solid var(--header-border);
    }

    .header-btn {
      width: 40px;
    }

    .menu-spacer {
      grid-area: menu;
    }

    > .header-spacer {
      grid-area: cluster;
      background-color: var(--header-bg);
      position: relative;
    }

    > .top {
      grid-area: top;
      padding-top: 6px;

      INPUT[type='search']::placeholder,
      .vs__open-indicator,
      .vs__selected {
        color: var(--header-btn-bg) !important;
        background: var(--header-btn-bg);
        border-radius: var(--border-radius);
        border: none;
        margin: 0 35px 0 25px!important;
      }

      .vs__selected {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.25);
      }

      .vs__deselect {
        fill: var(--header-btn-bg);
      }

      .filter .vs__dropdown-toggle {
        background: var(--header-btn-bg);
        border-radius: var(--border-radius);
        border: none;
        margin: 0 35px 0 25px!important;
      }
    }

    > .user {
      outline: none;

      .v-popover {
        display: flex;
        ::v-deep .trigger{
        .user-image {
            display: flex;
          }
        }
      }

      .user-image {
        display: flex;
        align-items: center;
      }

      &:focus {
        .v-popover {
          ::v-deep .trigger {
            line-height: 0;
            .user-image {
              max-height: 40px;
            }
            .user-image > * {
              @include form-focus
            }
          }
        }
      }

      grid-area: user;
      background-color: var(--header-bg);

      .avatar-round {
        border: 0;
        border-radius: 50%;
      }
    }
  }

  .list-unstyled {
    li {
      a {
        display: flex;
        justify-content: space-between;
        padding: 10px;
      }

      &.user-info {
        display: block;
        margin-bottom: 10px;
        padding: 10px 20px;
        border-bottom: solid 1px var(--border);
        min-width: 200px;
      }
    }
  }

  .config-actions {
    li {
      a {
        justify-content: start;
        align-items: center;

        & .icon {
          margin: 0 4px;
        }

        &:hover {
          cursor: pointer;
        }
      }
    }
  }

  .popover .popover-inner {
    padding: 0;
    border-radius: 0;
  }

  .user-name {
    color: var(--secondary);
  }

  .user-menu {
    // Remove the default padding on the popup so that the hover on menu items goes full width of the menu
    ::v-deep .popover-inner {
      padding: 10px 0;
    }

    ::v-deep .v-popover {
      display: flex;
    }
  }

  .actions {
    ::v-deep .popover:focus {
      outline: 0;
    }

    .dropdown {
      margin: 0 -10px;
    }
  }

  .user-menu-item {
    a {
      cursor: hand;
      padding: 0px 10px;

      &:hover {
        background-color: var(--dropdown-hover-bg);
        color: var(--dropdown-hover-text);
        text-decoration: none;
      }

      // When the menu item is focused, pop the margin and compensate the padding, so that
      // the focus border appears within the menu
      &:focus {
        margin: 0 2px;
        padding: 10px 8px;
      }
    }

    div.menu-seperator {
      cursor: default;
      padding: 4px 0;

      .menu-seperator-line {
        background-color: var(--border);
        height: 1px;
      }
    }
  }
</style>
