import { defineComponent, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, inject, computed, shallowRef, h, Suspense, nextTick, provide, shallowReactive, useSSRContext } from 'file:///home/brian/git/hermes-agent-curriculum/node_modules/vue/index.mjs';
import { h as useRuntimeConfig, i as useContent, j as useRequestEvent, k as useContentHead, b as useNuxtApp, P as PageRouteSymbol, c as useRoute, l as layouts, d as appLayoutTransition, e as _mergeTransitionProps, f as _wrapInTransition, g as _routeRulesMatcher, L as LayoutMetaSymbol } from './server.mjs';
import { useRoute as useRoute$1 } from 'file:///home/brian/git/hermes-agent-curriculum/node_modules/vue-router/vue-router.node.mjs';
import _sfc_main$1 from './ContentRenderer-a4lwZxUE.mjs';
import _sfc_main$2 from './DocumentDrivenEmpty-CVfz7tly.mjs';
import __nuxt_component_3 from './DocumentDrivenNotFound--BNel4AZ.mjs';
import { ssrRenderAttrs, ssrRenderComponent } from 'file:///home/brian/git/hermes-agent-curriculum/node_modules/vue/server-renderer/index.mjs';
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
import './ContentRendererMarkdown-CLbZBXp8.mjs';
import 'file:///home/brian/git/hermes-agent-curriculum/node_modules/property-information/index.js';
import './node-wbLVSDsX.mjs';
import './ButtonLink-Bepbxwxt.mjs';
import './ssrSlot-vN8hJK4d.mjs';

const routeRulesMatcher = _routeRulesMatcher;
const LayoutLoader = defineComponent({
  name: "LayoutLoader",
  inheritAttrs: false,
  props: {
    name: String,
    layoutProps: Object
  },
  setup(props, context) {
    return () => h(layouts[props.name], props.layoutProps, context.slots);
  }
});
const nuxtLayoutProps = {
  name: {
    type: [String, Boolean, Object],
    default: null
  },
  fallback: {
    type: [String, Object],
    default: null
  }
};
const __nuxt_component_0 = defineComponent({
  name: "NuxtLayout",
  inheritAttrs: false,
  props: nuxtLayoutProps,
  setup(props, context) {
    const nuxtApp = useNuxtApp();
    const injectedRoute = inject(PageRouteSymbol);
    const shouldUseEagerRoute = !injectedRoute || injectedRoute === useRoute();
    const route = shouldUseEagerRoute ? useRoute$1() : injectedRoute;
    const layout = computed(() => {
      var _a, _b, _c;
      let layout2 = (_c = (_b = (_a = unref(props.name)) != null ? _a : route == null ? void 0 : route.meta.layout) != null ? _b : routeRulesMatcher(route == null ? void 0 : route.path).appLayout) != null ? _c : "default";
      if (layout2 && !(layout2 in layouts)) {
        if (props.fallback) {
          layout2 = unref(props.fallback);
        }
      }
      return layout2;
    });
    const layoutRef = shallowRef();
    context.expose({ layoutRef });
    const done = nuxtApp.deferHydration();
    let lastLayout;
    return () => {
      var _a;
      const hasLayout = !!layout.value && layout.value in layouts;
      const hasTransition = hasLayout && !!((_a = route == null ? void 0 : route.meta.layoutTransition) != null ? _a : appLayoutTransition);
      const transitionProps = hasTransition && _mergeTransitionProps([
        route == null ? void 0 : route.meta.layoutTransition,
        appLayoutTransition,
        {
          onBeforeLeave() {
            nuxtApp["~transitionPromise"] = new Promise((resolve) => {
              nuxtApp["~transitionFinish"] = resolve;
            });
          },
          onAfterLeave() {
            var _a2;
            (_a2 = nuxtApp["~transitionFinish"]) == null ? void 0 : _a2.call(nuxtApp);
            delete nuxtApp["~transitionFinish"];
            delete nuxtApp["~transitionPromise"];
          }
        }
      ]);
      const previouslyRenderedLayout = lastLayout;
      lastLayout = layout.value;
      return _wrapInTransition(transitionProps, {
        default: () => h(
          Suspense,
          {
            suspensible: true,
            onResolve: async () => {
              await nextTick(done);
            }
          },
          {
            default: () => {
              var _a2;
              return h(
                LayoutProvider,
                {
                  layoutProps: mergeProps(context.attrs, (_a2 = route.meta.layoutProps) != null ? _a2 : {}, { ref: layoutRef }),
                  key: layout.value || void 0,
                  name: layout.value,
                  shouldProvide: !props.name,
                  isRenderingNewLayout: (name) => {
                    return name !== previouslyRenderedLayout && name === layout.value;
                  },
                  hasTransition
                },
                context.slots
              );
            }
          }
        )
      }).default();
    };
  }
});
const LayoutProvider = defineComponent({
  name: "NuxtLayoutProvider",
  inheritAttrs: false,
  props: {
    name: {
      type: [String, Boolean]
    },
    layoutProps: {
      type: Object
    },
    hasTransition: {
      type: Boolean
    },
    shouldProvide: {
      type: Boolean
    },
    isRenderingNewLayout: {
      type: Function,
      required: true
    }
  },
  setup(props, context) {
    const name = props.name;
    if (props.shouldProvide) {
      provide(LayoutMetaSymbol, {
        // When name=false, always return true so NuxtPage doesn't skip rendering
        isCurrent: (route) => {
          var _a, _b;
          return name === false || name === ((_b = (_a = route.meta.layout) != null ? _a : routeRulesMatcher(route.path).appLayout) != null ? _b : "default");
        }
      });
    }
    const injectedRoute = inject(PageRouteSymbol);
    const isNotWithinNuxtPage = injectedRoute && injectedRoute === useRoute();
    if (isNotWithinNuxtPage) {
      const vueRouterRoute = useRoute$1();
      const reactiveChildRoute = {};
      for (const _key in vueRouterRoute) {
        const key = _key;
        Object.defineProperty(reactiveChildRoute, key, {
          enumerable: true,
          get: () => {
            return props.isRenderingNewLayout(props.name) ? vueRouterRoute[key] : injectedRoute[key];
          }
        });
      }
      provide(PageRouteSymbol, shallowReactive(reactiveChildRoute));
    }
    return () => {
      var _a, _b;
      if (!name || typeof name === "string" && !(name in layouts)) {
        return (_b = (_a = context.slots).default) == null ? void 0 : _b.call(_a);
      }
      return h(
        LayoutLoader,
        { key: name, layoutProps: props.layoutProps, name },
        context.slots
      );
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "document-driven",
  __ssrInlineRender: true,
  setup(__props) {
    const { contentHead } = useRuntimeConfig().public.content;
    const { page, layout } = useContent();
    if (!page.value && true) {
      const event = useRequestEvent();
      if (event) {
        event.node.res.statusCode = 404;
      }
    }
    if (contentHead) {
      useContentHead(page);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLayout = __nuxt_component_0;
      const _component_ContentRenderer = _sfc_main$1;
      const _component_DocumentDrivenEmpty = _sfc_main$2;
      const _component_DocumentDrivenNotFound = __nuxt_component_3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "document-driven-page" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_NuxtLayout, {
        name: unref(layout) || "default"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(page)) {
              _push2(ssrRenderComponent(_component_ContentRenderer, {
                key: unref(page)._id,
                value: unref(page)
              }, {
                empty: withCtx(({ value }, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_DocumentDrivenEmpty, { value }, null, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_DocumentDrivenEmpty, { value }, null, 8, ["value"])
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(ssrRenderComponent(_component_DocumentDrivenNotFound, null, null, _parent2, _scopeId));
            }
          } else {
            return [
              unref(page) ? (openBlock(), createBlock(_component_ContentRenderer, {
                key: unref(page)._id,
                value: unref(page)
              }, {
                empty: withCtx(({ value }) => [
                  createVNode(_component_DocumentDrivenEmpty, { value }, null, 8, ["value"])
                ]),
                _: 1
              }, 8, ["value"])) : (openBlock(), createBlock(_component_DocumentDrivenNotFound, { key: 1 }))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/content/dist/runtime/pages/document-driven.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=document-driven-DKhUzdkh.mjs.map
