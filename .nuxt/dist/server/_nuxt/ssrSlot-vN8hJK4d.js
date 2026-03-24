import { ssrRenderSlot as ssrRenderSlot$1 } from "vue/server-renderer";
import { f as flatUnwrap } from "./node-wbLVSDsX.js";
const ssrRenderSlot = (slots, name, props, fallbackRenderFn, push, parentComponent, slotScopeId) => {
  if (slots[name]) {
    return ssrRenderSlot$1({ ...slots, [name]: () => flatUnwrap(slots[name](), props?.unwrap) }, name, props, fallbackRenderFn, push, parentComponent, slotScopeId);
  }
  return ssrRenderSlot$1(slots, name, props, fallbackRenderFn, push, parentComponent, slotScopeId);
};
export {
  ssrRenderSlot as s
};
//# sourceMappingURL=ssrSlot-vN8hJK4d.js.map
