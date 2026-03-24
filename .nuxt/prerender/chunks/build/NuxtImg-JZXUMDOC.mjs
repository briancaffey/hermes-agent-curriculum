import { withBase } from 'file:///home/brian/git/hermes-agent-curriculum/node_modules/ufo/dist/index.mjs';
import { defineComponent, h, computed, useSSRContext } from 'file:///home/brian/git/hermes-agent-curriculum/node_modules/vue/index.mjs';
import { h as useRuntimeConfig } from './server.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/ofetch/dist/node.mjs';
import '../nitro/nitro.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/h3/dist/index.mjs';
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

const _sfc_main = defineComponent({
  props: {
    src: {
      type: [String, Object],
      default: null
    }
  },
  setup(props) {
    const srcWithBase = (src) => {
      if (src && src.startsWith("/") && !src.startsWith("//")) {
        return withBase(src, useRuntimeConfig().app.baseURL);
      }
      return src;
    };
    const imgSrc = computed(() => {
      let src = props.src;
      try {
        src = JSON.parse(src);
      } catch (e) {
        src = props.src;
      }
      if (typeof src === "string") {
        return srcWithBase(props.src);
      }
      return {
        light: srcWithBase(src.light),
        dark: srcWithBase(src.dark)
      };
    });
    return {
      imgSrc
    };
  },
  render({ imgSrc }) {
    if (typeof imgSrc === "string") {
      return h("img", { src: imgSrc, ...this.$attrs });
    }
    const nodes = [];
    if (imgSrc.light) {
      nodes.push(h("img", { src: imgSrc.light, class: ["dark-img"], ...this.$attrs }));
    }
    if (imgSrc.dark) {
      nodes.push(h("img", { src: imgSrc.dark, class: ["light-img"], ...this.$attrs }));
    }
    return nodes;
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt-themes/elements/components/globals/NuxtImg.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=NuxtImg-JZXUMDOC.mjs.map
