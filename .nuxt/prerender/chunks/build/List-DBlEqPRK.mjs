import { _ as _export_sfc, o as __nuxt_component_0$3 } from './server.mjs';
import { _ as _sfc_main$1 } from './MDCSlot-BSS5qrFU.mjs';
import { defineComponent, useSlots, computed, h, useSSRContext } from 'file:///home/brian/git/hermes-agent-curriculum/node_modules/vue/index.mjs';
import { f as flatUnwrap, u as unwrap } from './node-wbLVSDsX.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/ofetch/dist/node.mjs';
import '../nitro/nitro.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/h3/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/ufo/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/unified/index.js';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/remark-parse/index.js';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/remark-rehype/index.js';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/remark-mdc/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/defu/dist/defu.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/remark-gfm/index.js';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/rehype-external-links/index.js';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/rehype-sort-attribute-values/index.js';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/rehype-sort-attributes/index.js';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/rehype-raw/index.js';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/detab/index.js';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/scule/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/micromark-util-sanitize-uri/index.js';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/hast-util-to-string/index.js';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/github-slugger/index.js';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/destr/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/hookable/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/node-mock-http/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/unstorage/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/unstorage/drivers/fs.mjs';
import 'node:crypto';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/unstorage/drivers/fs-lite.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/unstorage/drivers/lru-cache.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/nitropack/node_modules/ohash/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/klona/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/unctx/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/radix3/dist/index.mjs';
import 'node:fs';
import 'node:url';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/pathe/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/vue-router/vue-router.node.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/ohash/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/nuxt/node_modules/cookie-es/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/nuxt/node_modules/ohash/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/nanoid/index.js';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/vue/server-renderer/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/@iconify/vue/dist/offline.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/@iconify/vue/dist/iconify.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/@vueuse/integrations/useFuse.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/@vueuse/integrations/useFocusTrap.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/perfect-debounce/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/nuxt/node_modules/unhead/dist/utils.mjs';

const useUnwrap = () => ({
  unwrap,
  flatUnwrap
});
const iconTypeMap = {
  primary: "heroicons-outline:check",
  info: "heroicons-outline:information-circle",
  success: "heroicons-outline:check-circle",
  warning: "heroicons-outline:exclamation",
  danger: "heroicons-outline:exclamation-circle"
};
const _sfc_main = defineComponent({
  props: {
    /**
     * Used to override the default <code>type</code> icon, check out the
     *  <a href="https://github.com/nuxt/content/tree/dev/packages/theme-docs/src/components/global/icons">icons available</a>
     */
    icon: {
      type: String,
      default: null
    },
    /**
     * Type of list
     */
    type: {
      type: String,
      default: "primary",
      validator: (value) => ["primary", "info", "success", "warning", "danger"].includes(value)
    }
  },
  setup(props) {
    const slots = useSlots();
    const { flatUnwrap: flatUnwrap2, unwrap: unwrap2 } = useUnwrap();
    const iconName = computed(() => props.icon || iconTypeMap[props.type]);
    return () => {
      var _a;
      const items = flatUnwrap2((_a = slots.default && slots.default()) != null ? _a : [], ["ul"]).map((li) => unwrap2(li, ["li"]));
      return h(
        "ul",
        items.map(
          (item) => h("li", [
            h("span", { class: `list-icon ${props.type}` }, h(__nuxt_component_0$3, { name: iconName.value, class: "icon" })),
            h("span", h(_sfc_main$1, { use: () => item }))
          ])
        )
      );
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt-themes/elements/components/globals/List.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const List = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e3286cf5"]]);

export { List as default };
//# sourceMappingURL=List-DBlEqPRK.mjs.map
