import { defineComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderSlot } from "vue/server-renderer";
import { _ as _export_sfc } from "../server.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/home/brian/git/hermes-agent-curriculum/node_modules/hookable/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/unctx/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/home/brian/git/hermes-agent-curriculum/node_modules/defu/dist/defu.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/ufo/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/ohash/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/klona/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/nuxt/node_modules/cookie-es/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/destr/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/nuxt/node_modules/ohash/dist/index.mjs";
import "nanoid";
import "/home/brian/git/hermes-agent-curriculum/node_modules/scule/dist/index.mjs";
import "/home/brian/git/hermes-agent-curriculum/node_modules/nuxt/node_modules/@unhead/vue/dist/index.mjs";
import "@iconify/vue/dist/offline";
import "@iconify/vue";
import "@vueuse/integrations/useFuse";
import "@vueuse/integrations/useFocusTrap";
import "/home/brian/git/hermes-agent-curriculum/node_modules/perfect-debounce/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CodeBlock",
  __ssrInlineRender: true,
  props: {
    /**
     * Label to display for the tab
     */
    label: {
      type: String,
      required: true
    },
    /**
     * Select which tab should be active
     * TODO: seems like it's not used 
     */
    active: {
      type: Boolean,
      default: false
    },
    /**
     * Preview block are bordered and have small padding.
     * TODO: seems like it's not used
     */
    preview: {
      type: Boolean,
      default: false
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["code-block", {
          active: __props.active,
          "rounded-lg p-4": __props.preview
        }]
      }, _attrs))} data-v-22d00392>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt-themes/elements/components/globals/CodeBlock.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const CodeBlock = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-22d00392"]]);
export {
  CodeBlock as default
};
//# sourceMappingURL=CodeBlock-CW8sVuKN.js.map
