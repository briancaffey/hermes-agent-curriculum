import { _ as _export_sfc, o as __nuxt_component_0$3 } from './server.mjs';
import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'file:///home/brian/git/hermes-agent-curriculum/node_modules/vue/index.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from 'file:///home/brian/git/hermes-agent-curriculum/node_modules/vue/server-renderer/index.mjs';
import { s as ssrRenderSlot } from './ssrSlot-vN8hJK4d.mjs';
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
  __name: "Callout",
  __ssrInlineRender: true,
  props: {
    /**
     * @values info, success, warning, danger
     */
    type: {
      type: String,
      default: "info",
      validator(value) {
        return ["info", "success", "warning", "danger", "primary"].includes(value);
      }
    },
    modelValue: {
      required: false,
      default: () => ref(false)
    }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const isOpen = ref(props.modelValue);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0$3;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["callout", [__props.type]]
      }, _attrs))} data-v-63fa4c2e><span class="preview" data-v-63fa4c2e><span class="summary" data-v-63fa4c2e>`);
      ssrRenderSlot(_ctx.$slots, "summary", {}, null, _push, _parent);
      _push(`</span>`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons-outline:chevron-right",
        class: ["icon", [unref(isOpen) && "rotate"]]
      }, null, _parent));
      _push(`</span><div class="content" style="${ssrRenderStyle(unref(isOpen) ? null : { display: "none" })}" data-v-63fa4c2e>`);
      ssrRenderSlot(_ctx.$slots, "content", {}, null, _push, _parent);
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt-themes/elements/components/globals/Callout.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const Callout = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-63fa4c2e"]]);

export { Callout as default };
//# sourceMappingURL=Callout-8SB1di3Q.mjs.map
