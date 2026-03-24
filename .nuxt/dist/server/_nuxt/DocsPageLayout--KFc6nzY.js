import { i as useContent, q as useDocus, c as useRoute, t as useState, v as __nuxt_component_0$1, o as __nuxt_component_0$2, _ as _export_sfc } from "../server.mjs";
import __nuxt_component_1 from "./DocsAside-BpZzOm_L.js";
import __nuxt_component_2 from "./Alert-aNo17HoM.js";
import __nuxt_component_1$1 from "./ProseCodeInline-DsV1x5Na.js";
import __nuxt_component_4 from "./DocsPageBottom-CbAS-otL.js";
import __nuxt_component_5 from "./DocsPrevNext-HMaT3V42.js";
import __nuxt_component_7 from "./DocsToc-Bm0xHI7s.js";
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, openBlock, createBlock, createCommentVNode, renderSlot, Fragment, useSSRContext } from "vue";
import { ssrRenderComponent, ssrRenderSlot, ssrInterpolate, ssrRenderClass } from "vue/server-renderer";
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
import "./MDCSlot-BSS5qrFU.js";
import "./node-wbLVSDsX.js";
import "./ssrSlot-vN8hJK4d.js";
import "./EditOnLink-CIxzRy8l.js";
import "./ProseA-CYmLzAK1.js";
import "./DocsTocLinks-B6GtNhDV.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DocsPageLayout",
  __ssrInlineRender: true,
  setup(__props) {
    const { page } = useContent();
    const { config, tree } = useDocus();
    const route = useRoute();
    const fallbackValue = (value, fallback = true) => {
      if (typeof page.value?.[value] !== "undefined") {
        return page.value[value];
      }
      return fallback;
    };
    const hasBody = computed(() => !page.value || page.value?.body?.children?.length > 0);
    const hasToc = computed(() => page.value?.toc !== false && page.value?.body?.toc?.links?.length >= 2);
    const hasAside = computed(() => page.value?.aside !== false && (tree.value?.length > 1 || tree.value?.[0]?.children?.length));
    const bottom = computed(() => fallbackValue("bottom", true));
    const isOpen = ref(false);
    const asideNav = ref(null);
    const getParentPath = () => route.path.split("/").slice(0, 2).join("/");
    useState("asideScroll", () => {
      return {
        parentPath: getParentPath(),
        scrollTop: asideNav.value?.scrollTop || 0
      };
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_Container = __nuxt_component_0$1;
      const _component_DocsAside = __nuxt_component_1;
      const _component_Alert = __nuxt_component_2;
      const _component_ProseCodeInline = __nuxt_component_1$1;
      const _component_DocsPageBottom = __nuxt_component_4;
      const _component_DocsPrevNext = __nuxt_component_5;
      const _component_Icon = __nuxt_component_0$2;
      const _component_DocsToc = __nuxt_component_7;
      _push(ssrRenderComponent(_component_Container, mergeProps({
        fluid: unref(config)?.main?.fluid,
        padded: unref(config)?.main?.padded,
        class: ["docs-page-content", {
          fluid: unref(config)?.main?.fluid,
          "has-toc": unref(hasToc),
          "has-aside": unref(hasAside)
        }]
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(hasAside)) {
              _push2(`<aside class="aside-nav" data-v-73d798d2${_scopeId}>`);
              _push2(ssrRenderComponent(_component_DocsAside, { class: "app-aside" }, null, _parent2, _scopeId));
              _push2(`</aside>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`<article class="page-body" data-v-73d798d2${_scopeId}>`);
            if (unref(hasBody)) {
              ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
            } else {
              _push2(ssrRenderComponent(_component_Alert, { type: "info" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` Start writing in `);
                    _push3(ssrRenderComponent(_component_ProseCodeInline, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`content/${ssrInterpolate(unref(page)._file)}`);
                        } else {
                          return [
                            createTextVNode("content/" + toDisplayString(unref(page)._file), 1)
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                    _push3(` to see this page taking shape. `);
                  } else {
                    return [
                      createTextVNode(" Start writing in "),
                      createVNode(_component_ProseCodeInline, null, {
                        default: withCtx(() => [
                          createTextVNode("content/" + toDisplayString(unref(page)._file), 1)
                        ]),
                        _: 1
                      }),
                      createTextVNode(" to see this page taking shape. ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            }
            if (unref(hasBody) && unref(page) && unref(bottom)) {
              _push2(`<!--[-->`);
              _push2(ssrRenderComponent(_component_DocsPageBottom, null, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_DocsPrevNext, null, null, _parent2, _scopeId));
              _push2(`<!--]-->`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</article>`);
            if (unref(hasToc)) {
              _push2(`<div class="toc" data-v-73d798d2${_scopeId}><div class="toc-wrapper" data-v-73d798d2${_scopeId}><button data-v-73d798d2${_scopeId}><span class="title" data-v-73d798d2${_scopeId}>Table of Contents</span>`);
              _push2(ssrRenderComponent(_component_Icon, {
                name: "heroicons-outline:chevron-right",
                class: ["icon", [unref(isOpen) && "rotate"]]
              }, null, _parent2, _scopeId));
              _push2(`</button><div class="${ssrRenderClass([[unref(isOpen) && "opened"], "docs-toc-wrapper"])}" data-v-73d798d2${_scopeId}>`);
              _push2(ssrRenderComponent(_component_DocsToc, {
                onMove: ($event) => isOpen.value = false
              }, null, _parent2, _scopeId));
              _push2(`</div></div></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              unref(hasAside) ? (openBlock(), createBlock("aside", {
                key: 0,
                ref_key: "asideNav",
                ref: asideNav,
                class: "aside-nav"
              }, [
                createVNode(_component_DocsAside, { class: "app-aside" })
              ], 512)) : createCommentVNode("", true),
              createVNode("article", { class: "page-body" }, [
                unref(hasBody) ? renderSlot(_ctx.$slots, "default", { key: 0 }, void 0, true) : (openBlock(), createBlock(_component_Alert, {
                  key: 1,
                  type: "info"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Start writing in "),
                    createVNode(_component_ProseCodeInline, null, {
                      default: withCtx(() => [
                        createTextVNode("content/" + toDisplayString(unref(page)._file), 1)
                      ]),
                      _: 1
                    }),
                    createTextVNode(" to see this page taking shape. ")
                  ]),
                  _: 1
                })),
                unref(hasBody) && unref(page) && unref(bottom) ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                  createVNode(_component_DocsPageBottom),
                  createVNode(_component_DocsPrevNext)
                ], 64)) : createCommentVNode("", true)
              ]),
              unref(hasToc) ? (openBlock(), createBlock("div", {
                key: 1,
                class: "toc"
              }, [
                createVNode("div", { class: "toc-wrapper" }, [
                  createVNode("button", {
                    onClick: ($event) => isOpen.value = !unref(isOpen)
                  }, [
                    createVNode("span", { class: "title" }, "Table of Contents"),
                    createVNode(_component_Icon, {
                      name: "heroicons-outline:chevron-right",
                      class: ["icon", [unref(isOpen) && "rotate"]]
                    }, null, 8, ["class"])
                  ], 8, ["onClick"]),
                  createVNode("div", {
                    class: ["docs-toc-wrapper", [unref(isOpen) && "opened"]]
                  }, [
                    createVNode(_component_DocsToc, {
                      onMove: ($event) => isOpen.value = false
                    }, null, 8, ["onMove"])
                  ], 2)
                ])
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 3
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt-themes/docus/components/docs/DocsPageLayout.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-73d798d2"]]);
export {
  __nuxt_component_0 as default
};
//# sourceMappingURL=DocsPageLayout--KFc6nzY.js.map
