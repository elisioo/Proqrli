import { U as jsxRuntimeExports } from "./worker-entry.js";
import { L as Link } from "./router.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const SplitNotFoundComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl p-12 text-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "t-label", children: "RFQ not found" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/buyer/rfqs", className: "mt-4 inline-block underline", children: "Back to RFQs" })
] });
export {
  SplitNotFoundComponent as notFoundComponent
};
