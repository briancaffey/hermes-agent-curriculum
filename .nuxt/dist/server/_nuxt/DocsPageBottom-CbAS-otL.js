import { i as useContent, q as useDocus, o as __nuxt_component_0, _ as _export_sfc } from "../server.mjs";
import _sfc_main$1 from "./EditOnLink-CIxzRy8l.js";
import __nuxt_component_2 from "./ProseA-CYmLzAK1.js";
import { defineComponent, unref, mergeProps, withCtx, createVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
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
  __name: "DocsPageBottom",
  __ssrInlineRender: true,
  setup(__props) {
    const { page } = useContent();
    const { config } = useDocus();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Icon = __nuxt_component_0;
      const _component_EditOnLink = _sfc_main$1;
      const _component_ProseA = __nuxt_component_2;
      if (unref(page)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "docs-page-bottom" }, _attrs))} data-v-346454d4>`);
        if (unref(config)?.github?.edit) {
          _push(`<div class="edit-link" data-v-346454d4>`);
          _push(ssrRenderComponent(_component_Icon, { name: "uil:edit" }, null, _parent));
          _push(ssrRenderComponent(_component_EditOnLink, { page: unref(page) }, {
            default: withCtx(({ url }, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_ProseA, { to: url }, {
                  default: withCtx((_, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`<span data-v-346454d4${_scopeId2}> Edit this page on GitHub </span>`);
                    } else {
                      return [
                        createVNode("span", null, " Edit this page on GitHub ")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_component_ProseA, { to: url }, {
                    default: withCtx(() => [
                      createVNode("span", null, " Edit this page on GitHub ")
                    ]),
                    _: 1
                  }, 8, ["to"])
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(page)?.mtime) {
          _push(`<span data-v-346454d4>Updated on <b data-v-346454d4>${ssrInterpolate(new Intl.DateTimeFormat("en-US").format(Date.parse(unref(page).mtime)))}</b></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt-themes/docus/components/docs/DocsPageBottom.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-346454d4"]]);
export {
  __nuxt_component_4 as default
};
//# sourceMappingURL=DocsPageBottom-CbAS-otL.js.map
