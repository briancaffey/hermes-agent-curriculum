import { f as flatUnwrap } from "./node-wbLVSDsX.js";
import { defineComponent, h, getCurrentInstance, useSlots, computed, useSSRContext } from "vue";
const _sfc_main = defineComponent({
  name: "MDCSlot",
  functional: true,
  props: {
    name: {
      type: String,
      default: "default"
    },
    /**
     * Tags to unwrap separated by spaces
     * Example: 'ul li'
     */
    unwrap: {
      type: [Boolean, String],
      default: false
    },
    /**
     * VNode to render
     * This is only useful for render functions
     */
    use: {
      type: Function,
      default: void 0
    }
  },
  setup(props) {
    const { parent } = getCurrentInstance();
    const { default: fallbackSlot } = useSlots();
    const tags = computed(() => {
      if (typeof props.unwrap === "string") {
        return props.unwrap.split(" ");
      }
      return ["*"];
    });
    return {
      fallbackSlot,
      tags,
      parent
    };
  },
  render({ use, unwrap, fallbackSlot, tags, parent }) {
    try {
      let slot = use;
      if (typeof use === "string") {
        slot = parent?.slots[use] || parent?.parent?.slots[use];
        console.warn(`Please set :use="$slots.${use}" in <MDCSlot> component to enable reactivity`);
      }
      if (!slot) {
        return fallbackSlot ? fallbackSlot() : h("div");
      }
      return unwrap ? flatUnwrap(slot(), tags) : [slot()];
    } catch {
      return h("div");
    }
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxtjs/mdc/dist/runtime/components/MDCSlot.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=MDCSlot-BSS5qrFU.js.map
