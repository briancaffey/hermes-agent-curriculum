import { _ as _export_sfc, o as __nuxt_component_0$3 } from './server.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'file:///home/brian/git/hermes-agent-curriculum/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot } from 'file:///home/brian/git/hermes-agent-curriculum/node_modules/vue/server-renderer/index.mjs';
import { s as ssrRenderSlot$1 } from './ssrSlot-vN8hJK4d.mjs';
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
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/@iconify/vue/dist/offline.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/@iconify/vue/dist/iconify.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/@vueuse/integrations/useFuse.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/@vueuse/integrations/useFocusTrap.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/perfect-debounce/dist/index.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/nuxt/node_modules/unhead/dist/utils.mjs';
import './node-wbLVSDsX.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "Card",
  __ssrInlineRender: true,
  props: {
    icon: {
      type: String,
      default: ""
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "card" }, _attrs))} data-v-4750d1e5>`);
      if (__props.icon) {
        _push(ssrRenderComponent(_component_Icon, { name: __props.icon }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`<div data-v-4750d1e5><h3 class="title" data-v-4750d1e5>`);
      ssrRenderSlot$1(_ctx.$slots, "title", { unwrap: "p" }, () => {
        _push(` Card title `);
      }, _push, _parent);
      _push(`</h3><p class="description" data-v-4750d1e5>`);
      ssrRenderSlot$1(_ctx.$slots, "description", { unwrap: "p" }, () => {
        _push(` Card description `);
      }, _push, _parent);
      _push(`</p></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt-themes/elements/components/landing/Card.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Card = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4750d1e5"]]);

export { Card as default };
//# sourceMappingURL=Card-olJJjmOQ.mjs.map
