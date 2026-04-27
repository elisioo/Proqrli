import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { B as BuyerPermissionGate } from "./BuyerPermissionGate.js";
import { u as useBuyer } from "./buyer-context.js";
import { B as BUYER_TEAM, c as BUYER_ROLE_LABELS, d as BUYER_ROLE_DESCRIPTIONS } from "./router.js";
import { T as THEME_PRESETS } from "./color-utils.js";
import { c as cn } from "./utils.js";
import { g as useDirection, k as useControllableState, P as Primitive, l as useId, R as Root, I as Item, c as composeEventHandlers, h as Presence, e as createContextScope, i as createRovingFocusGroupScope } from "./index3.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./lock.js";
import "./createLucideIcon.js";
var TABS_NAME = "Tabs";
var [createTabsContext] = createContextScope(TABS_NAME, [
  createRovingFocusGroupScope
]);
var useRovingFocusGroupScope = createRovingFocusGroupScope();
var [TabsProvider, useTabsContext] = createTabsContext(TABS_NAME);
var Tabs$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeTabs,
      value: valueProp,
      onValueChange,
      defaultValue,
      orientation = "horizontal",
      dir,
      activationMode = "automatic",
      ...tabsProps
    } = props;
    const direction = useDirection(dir);
    const [value, setValue] = useControllableState({
      prop: valueProp,
      onChange: onValueChange,
      defaultProp: defaultValue ?? "",
      caller: TABS_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      TabsProvider,
      {
        scope: __scopeTabs,
        baseId: useId(),
        value,
        onValueChange: setValue,
        orientation,
        dir: direction,
        activationMode,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            dir: direction,
            "data-orientation": orientation,
            ...tabsProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Tabs$1.displayName = TABS_NAME;
var TAB_LIST_NAME = "TabsList";
var TabsList$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, loop = true, ...listProps } = props;
    const context = useTabsContext(TAB_LIST_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Root,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        orientation: context.orientation,
        dir: context.dir,
        loop,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            role: "tablist",
            "aria-orientation": context.orientation,
            ...listProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
TabsList$1.displayName = TAB_LIST_NAME;
var TRIGGER_NAME = "TabsTrigger";
var TabsTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, disabled = false, ...triggerProps } = props;
    const context = useTabsContext(TRIGGER_NAME, __scopeTabs);
    const rovingFocusGroupScope = useRovingFocusGroupScope(__scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Item,
      {
        asChild: true,
        ...rovingFocusGroupScope,
        focusable: !disabled,
        active: isSelected,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": isSelected,
            "aria-controls": contentId,
            "data-state": isSelected ? "active" : "inactive",
            "data-disabled": disabled ? "" : void 0,
            disabled,
            id: triggerId,
            ...triggerProps,
            ref: forwardedRef,
            onMouseDown: composeEventHandlers(props.onMouseDown, (event) => {
              if (!disabled && event.button === 0 && event.ctrlKey === false) {
                context.onValueChange(value);
              } else {
                event.preventDefault();
              }
            }),
            onKeyDown: composeEventHandlers(props.onKeyDown, (event) => {
              if ([" ", "Enter"].includes(event.key)) context.onValueChange(value);
            }),
            onFocus: composeEventHandlers(props.onFocus, () => {
              const isAutomaticActivation = context.activationMode !== "manual";
              if (!isSelected && !disabled && isAutomaticActivation) {
                context.onValueChange(value);
              }
            })
          }
        )
      }
    );
  }
);
TabsTrigger$1.displayName = TRIGGER_NAME;
var CONTENT_NAME = "TabsContent";
var TabsContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeTabs, value, forceMount, children, ...contentProps } = props;
    const context = useTabsContext(CONTENT_NAME, __scopeTabs);
    const triggerId = makeTriggerId(context.baseId, value);
    const contentId = makeContentId(context.baseId, value);
    const isSelected = value === context.value;
    const isMountAnimationPreventedRef = reactExports.useRef(isSelected);
    reactExports.useEffect(() => {
      const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
      return () => cancelAnimationFrame(rAF);
    }, []);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || isSelected, children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "data-state": isSelected ? "active" : "inactive",
        "data-orientation": context.orientation,
        role: "tabpanel",
        "aria-labelledby": triggerId,
        hidden: !present,
        id: contentId,
        tabIndex: 0,
        ...contentProps,
        ref: forwardedRef,
        style: {
          ...props.style,
          animationDuration: isMountAnimationPreventedRef.current ? "0s" : void 0
        },
        children: present && children
      }
    ) });
  }
);
TabsContent$1.displayName = CONTENT_NAME;
function makeTriggerId(baseId, value) {
  return `${baseId}-trigger-${value}`;
}
function makeContentId(baseId, value) {
  return `${baseId}-content-${value}`;
}
var Root2 = Tabs$1;
var List = TabsList$1;
var Trigger = TabsTrigger$1;
var Content = TabsContent$1;
const Tabs = Root2;
const TabsList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = List.displayName;
const TabsTrigger = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = Trigger.displayName;
const TabsContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = Content.displayName;
function SettingsPage() {
  const {
    tenant,
    themeId,
    setThemeId,
    accent,
    setAccent,
    hasPermission
  } = useBuyer();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Workspace", title: "Settings", description: `Configure ${tenant.companyName} — your team, theme, and integrations.` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "profile", className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "profile", children: "Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "team", disabled: !hasPermission("team:view"), children: "Team & RBAC" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "theme", children: "Theme" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "budget", disabled: !hasPermission("budget:view"), children: "Budget" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "profile", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label mb-4", children: "Company profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Company name", defaultValue: tenant.companyName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Industry", defaultValue: tenant.industry }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Procurement email", defaultValue: tenant.contactEmail }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tax ID / TIN", defaultValue: "000-123-456-001" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "mt-6 h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85", children: "Save changes" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "team", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-5 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "t-label", children: "Team & roles" }),
          hasPermission("team:manage") && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "h-9 rounded-sm bg-foreground px-3 text-xs font-semibold text-background hover:opacity-85", children: "+ Invite member" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: BUYER_TEAM.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "grid grid-cols-12 items-center gap-3 px-5 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background", children: m.initials }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: m.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] text-muted-foreground", children: m.email })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 text-xs text-muted-foreground", children: m.department }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RolePill, { role: m.role }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 font-mono text-[10px] text-muted-foreground", children: [
            "Joined ",
            m.joinedAt
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-block h-2 w-2 rounded-full", m.active ? "bg-emerald-500" : "bg-rose-500") }) })
        ] }, m.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border bg-paper-mid p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label mb-3", children: "Role permission matrix" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4", children: Object.keys(BUYER_ROLE_LABELS).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-sm border border-border bg-card p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-sm font-extrabold", children: BUYER_ROLE_LABELS[r] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: BUYER_ROLE_DESCRIPTIONS[r] })
          ] }, r)) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "theme", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label mb-4", children: "Marketplace theme" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-6 text-sm text-muted-foreground", children: "Choose how your procurement workspace feels. Picks a coordinated accent across charts, buttons, and badges." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3", children: THEME_PRESETS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setThemeId(p.id), className: cn("flex flex-col gap-3 rounded-md border-2 p-4 text-left transition-all hover:shadow-sm", themeId === p.id ? "border-foreground" : "border-border"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-12 w-full rounded-sm", style: {
            background: p.accent
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base font-extrabold", children: p.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: p.description })
          ] })
        ] }, p.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 border-t border-border pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label mb-3", children: "Custom accent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "color", value: accent, onChange: (e) => setAccent(e.target.value), className: "h-12 w-20 cursor-pointer rounded-sm border border-border bg-transparent p-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: accent, onChange: (e) => setAccent(e.target.value), className: "h-11 w-44 rounded-sm border border-border bg-paper px-3 font-mono text-sm uppercase outline-none focus:border-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-sm px-3 py-2 text-sm font-semibold", style: {
              background: "var(--accent-solid)",
              color: "var(--accent-foreground-solid)"
            }, children: "Preview button" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "budget", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label mb-4", children: "FY budget controls" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Annual procurement budget", defaultValue: "850,000" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "PO approval threshold", defaultValue: "10,000" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Bill auto-pay limit", defaultValue: "2,500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Required approvers ≥ threshold", defaultValue: "2" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-xs text-muted-foreground", children: [
          "POs over threshold require approval from a member with ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Approver" }),
          " or ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Owner" }),
          " role."
        ] })
      ] }) })
    ] })
  ] });
}
function Field({
  label,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "t-label mb-2 block", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ...props, className: "h-11 w-full rounded-sm border border-border bg-paper px-3 text-sm outline-none focus:border-foreground" })
  ] });
}
function RolePill({
  role
}) {
  const tones = {
    buyer_owner: "bg-foreground text-background",
    buyer_procurement: "bg-sky-100 text-sky-800 border border-sky-200",
    buyer_approver: "bg-amber-100 text-amber-800 border border-amber-200",
    buyer_finance: "bg-emerald-100 text-emerald-800 border border-emerald-200"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-block rounded-sm px-2 py-[2px] font-mono text-[10px] font-bold uppercase tracking-widest", tones[role]), children: BUYER_ROLE_LABELS[role] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerPermissionGate, { permission: "settings:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsPage, {}) });
export {
  SplitComponent as component
};
