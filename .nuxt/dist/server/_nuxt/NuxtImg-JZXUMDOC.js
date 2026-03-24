import { withBase } from "/home/brian/git/hermes-agent-curriculum/node_modules/ufo/dist/index.mjs";
import { defineComponent, h, computed, useSSRContext } from "vue";
import { h as useRuntimeConfig } from "../server.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/home/brian/git/hermes-agent-curriculum/node_modules/hookable/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/unctx/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/home/brian/git/hermes-agent-curriculum/node_modules/defu/dist/defu.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/ohash/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/klona/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/nuxt/node_modules/cookie-es/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/destr/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/nuxt/node_modules/ohash/dist/index.mjs";
import "nanoid";
import "/home/brian/git/hermes-agent-curriculum/node_modules/scule/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/nuxt/node_modules/@unhead/vue/dist/index.mjs";
import "vue/server-renderer";
import "@iconify/vue/dist/offline";
import "@iconify/vue";
import "@vueuse/integrations/useFuse";
import "@vueuse/integrations/useFocusTrap";
import "/home/brian/git/hermes-agent-curriculum/node_modules/perfect-debounce/dist/index.mjs";
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
export {
  _sfc_main as default
};
//# sourceMappingURL=NuxtImg-JZXUMDOC.js.map
