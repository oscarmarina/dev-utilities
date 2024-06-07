const a = (t, e, n = {}) => {
  e.bubbles && (!t.shadowRoot || e.composed) && e.stopPropagation();
  const s = Reflect.construct(e.constructor, [e.type, { ...e, ...n }]), o = t.dispatchEvent(s);
  return o || e.preventDefault(), o;
}, u = (t, e, n = {}) => {
  if (typeof e == "string") {
    const s = e, o = new CustomEvent(s);
    return a(t, o, n);
  }
  return a(t, e, n);
}, f = (t, e = ["dialog", "[popover]"]) => {
  if (!t || !(t instanceof HTMLElement) || t.matches(e.join(",")))
    return !1;
  const n = window.getComputedStyle(t), s = n.display === "none" || n.visibility === "hidden", o = t.matches('[disabled], [hidden], [inert], [aria-hidden="true"]');
  return s || o;
}, b = (t) => {
  var s;
  return t instanceof HTMLElement ? t.matches('a[href],area[href],button:not([disabled]),details,iframe,object,input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[contentEditable="true"],[tabindex]:not([tabindex^="-"]),audio[controls],video[controls]') ? !0 : t.localName.includes("-") && t.matches('[disabled], [aria-disabled="true"]') ? !1 : (
    /** @type {ShadowRoot | *} */
    ((s = t.shadowRoot) == null ? void 0 : s.delegatesFocus) ?? !1
  ) : !1;
}, h = (t) => {
  let e = null, n = null;
  for (const s of t)
    e || (e = s), n = s;
  return [e, n];
};
function* l(t, e = 0, n = () => !0, s = () => !1) {
  if (e && t.nodeType !== e || s(t))
    return;
  n(t) && (yield t);
  const o = t instanceof HTMLElement && t.shadowRoot ? t.shadowRoot.children : t instanceof HTMLSlotElement ? t.assignedNodes({ flatten: !0 }) : t.childNodes;
  for (const i of o)
    yield* l(i, e, n, s);
}
const d = (t = document) => {
  const e = t == null ? void 0 : t.activeElement;
  return e ? e.shadowRoot ? d(e.shadowRoot) ?? e : e : document.body;
}, p = (t, e) => {
  let n = e;
  for (; n; ) {
    const s = n.assignedSlot || n.parentNode || n.host;
    if (s === t)
      return !0;
    n = s;
  }
  return !1;
};
function* m(t) {
  for (let e = t; e; ) {
    const n = e instanceof HTMLElement && e.assignedSlot ? e.assignedSlot : e instanceof ShadowRoot ? e.host : e.parentNode;
    n && (yield n), e = n;
  }
}
const E = (t, e) => {
  const { top: n, left: s, height: o, width: i } = t, { clientX: c, clientY: r } = e;
  return r >= n && r <= n + o && c >= s && c <= s + i;
}, y = (t = 10) => Math.random().toString(36).substring(2, t), g = (t) => {
  const e = typeof t == "string" ? new URL(t) : t, n = {};
  for (const s in e)
    typeof e[s] == "string" && (n[s] = e[s]);
  return n;
};
export {
  m as composedAncestors,
  p as deepContains,
  d as getDeepActiveElement,
  h as getFirstAndLastFocusableChildren,
  E as isClickInsideRect,
  f as isElementInvisible,
  b as isFocusable,
  y as randomID,
  u as redispatchEvent,
  a as redispatchEventFromEvent,
  g as urlToPlainObject,
  l as walkComposedTree
};
