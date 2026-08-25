var b;
// @__NO_SIDE_EFFECTS__
function N(e) {
  return {
    lang: (e == null ? void 0 : e.lang) ?? (b == null ? void 0 : b.lang),
    message: e == null ? void 0 : e.message,
    abortEarly: (e == null ? void 0 : e.abortEarly) ?? (b == null ? void 0 : b.abortEarly),
    abortPipeEarly: (e == null ? void 0 : e.abortPipeEarly) ?? (b == null ? void 0 : b.abortPipeEarly)
  };
}
var D;
// @__NO_SIDE_EFFECTS__
function Z(e) {
  return D == null ? void 0 : D.get(e);
}
var P;
// @__NO_SIDE_EFFECTS__
function ee(e) {
  return P == null ? void 0 : P.get(e);
}
var j;
// @__NO_SIDE_EFFECTS__
function ne(e, n) {
  var r;
  return (r = j == null ? void 0 : j.get(e)) == null ? void 0 : r.get(n);
}
// @__NO_SIDE_EFFECTS__
function re(e) {
  var r, t;
  const n = typeof e;
  return n === "string" ? `"${e}"` : n === "number" || n === "bigint" || n === "boolean" ? `${e}` : n === "object" || n === "function" ? (e && ((t = (r = Object.getPrototypeOf(e)) == null ? void 0 : r.constructor) == null ? void 0 : t.name)) ?? "null" : n;
}
function f(e, n, r, t, s) {
  const u = s && "input" in s ? s.input : r.value, i = (s == null ? void 0 : s.expected) ?? e.expects ?? null, l = (s == null ? void 0 : s.received) ?? /* @__PURE__ */ re(u), o = {
    kind: e.kind,
    type: e.type,
    input: u,
    expected: i,
    received: l,
    message: `Invalid ${n}: ${i ? `Expected ${i} but r` : "R"}eceived ${l}`,
    requirement: e.requirement,
    path: s == null ? void 0 : s.path,
    issues: s == null ? void 0 : s.issues,
    lang: t.lang,
    abortEarly: t.abortEarly,
    abortPipeEarly: t.abortPipeEarly
  }, y = e.kind === "schema", p = (s == null ? void 0 : s.message) ?? e.message ?? /* @__PURE__ */ ne(e.reference, o.lang) ?? (y ? /* @__PURE__ */ ee(o.lang) : null) ?? t.message ?? /* @__PURE__ */ Z(o.lang);
  p && (o.message = typeof p == "function" ? (
    // @ts-expect-error
    p(o)
  ) : p), y && (r.typed = !1), r.issues ? r.issues.push(o) : r.issues = [o];
}
// @__NO_SIDE_EFFECTS__
function h(e) {
  return {
    version: 1,
    vendor: "valibot",
    validate(n) {
      return e["~run"]({ value: n }, /* @__PURE__ */ N());
    }
  };
}
// @__NO_SIDE_EFFECTS__
function W(e, n) {
  return Object.hasOwn(e, n) && n !== "__proto__" && n !== "prototype" && n !== "constructor";
}
// @__NO_SIDE_EFFECTS__
function te(e, n) {
  const r = [...new Set(e)];
  return r.length > 1 ? `(${r.join(` ${n} `)})` : r[0] ?? "never";
}
var se = class extends Error {
  /**
   * Creates a Valibot error with useful information.
   *
   * @param issues The error issues.
   */
  constructor(e) {
    super(e[0].message), this.name = "ValiError", this.issues = e;
  }
};
// @__NO_SIDE_EFFECTS__
function L(e, n) {
  return {
    kind: "validation",
    type: "check",
    reference: L,
    async: !1,
    expects: null,
    requirement: e,
    message: n,
    "~run"(r, t) {
      return r.typed && !this.requirement(r.value) && f(this, "input", r, t), r;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function R(e) {
  return {
    kind: "validation",
    type: "integer",
    reference: R,
    async: !1,
    expects: null,
    requirement: Number.isInteger,
    message: e,
    "~run"(n, r) {
      return n.typed && !this.requirement(n.value) && f(this, "integer", n, r), n;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function d(e) {
  return {
    kind: "transformation",
    type: "transform",
    reference: d,
    async: !1,
    operation: e,
    "~run"(n) {
      return n.value = this.operation(n.value), n;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function U(e, n, r) {
  return typeof e.default == "function" ? (
    // @ts-expect-error
    e.default(n, r)
  ) : (
    // @ts-expect-error
    e.default
  );
}
// @__NO_SIDE_EFFECTS__
function ie(e, n) {
  return !e["~run"]({ value: n }, { abortEarly: !0 }).issues;
}
// @__NO_SIDE_EFFECTS__
function _(e) {
  return {
    kind: "schema",
    type: "boolean",
    reference: _,
    expects: "boolean",
    async: !1,
    message: e,
    get "~standard"() {
      return /* @__PURE__ */ h(this);
    },
    "~run"(n, r) {
      return typeof n.value == "boolean" ? n.typed = !0 : f(this, "type", n, r), n;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function z(e) {
  return {
    kind: "schema",
    type: "date",
    reference: z,
    expects: "Date",
    async: !1,
    message: e,
    get "~standard"() {
      return /* @__PURE__ */ h(this);
    },
    "~run"(n, r) {
      return n.value instanceof Date ? isNaN(n.value) ? f(this, "type", n, r, {
        received: '"Invalid Date"'
      }) : n.typed = !0 : f(this, "type", n, r), n;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function J(e, n) {
  return {
    kind: "schema",
    type: "instance",
    reference: J,
    expects: e.name,
    async: !1,
    class: e,
    message: n,
    get "~standard"() {
      return /* @__PURE__ */ h(this);
    },
    "~run"(r, t) {
      return r.value instanceof this.class ? r.typed = !0 : f(this, "type", r, t), r;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function A(e) {
  return {
    kind: "schema",
    type: "lazy",
    reference: A,
    expects: "unknown",
    async: !1,
    getter: e,
    get "~standard"() {
      return /* @__PURE__ */ h(this);
    },
    "~run"(n, r) {
      return this.getter(n.value)["~run"](n, r);
    }
  };
}
// @__NO_SIDE_EFFECTS__
function k(e, n) {
  return {
    kind: "schema",
    type: "loose_object",
    reference: k,
    expects: "Object",
    async: !1,
    entries: e,
    message: n,
    get "~standard"() {
      return /* @__PURE__ */ h(this);
    },
    "~run"(r, t) {
      var u;
      const s = r.value;
      if (s && typeof s == "object") {
        r.typed = !0, r.value = {};
        for (const i in this.entries) {
          const l = this.entries[i];
          if (i in s || (l.type === "exact_optional" || l.type === "optional" || l.type === "nullish") && // @ts-expect-error
          l.default !== void 0) {
            const o = i in s ? (
              // @ts-expect-error
              s[i]
            ) : /* @__PURE__ */ U(l), y = l["~run"]({ value: o }, t);
            if (y.issues) {
              const p = {
                type: "object",
                origin: "value",
                input: s,
                key: i,
                value: o
              };
              for (const m of y.issues)
                m.path ? m.path.unshift(p) : m.path = [p], (u = r.issues) == null || u.push(m);
              if (r.issues || (r.issues = y.issues), t.abortEarly) {
                r.typed = !1;
                break;
              }
            }
            y.typed || (r.typed = !1), r.value[i] = y.value;
          } else if (l.type !== "exact_optional" && l.type !== "optional" && l.type !== "nullish" && (f(this, "key", r, t, {
            input: void 0,
            expected: `"${i}"`,
            path: [
              {
                type: "object",
                origin: "key",
                input: s,
                key: i,
                // @ts-expect-error
                value: s[i]
              }
            ]
          }), t.abortEarly))
            break;
        }
        if (!r.issues || !t.abortEarly)
          for (const i in s)
            /* @__PURE__ */ W(s, i) && !(i in this.entries) && (r.value[i] = s[i]);
      } else
        f(this, "type", r, t);
      return r;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function E(e) {
  return {
    kind: "schema",
    type: "number",
    reference: E,
    expects: "number",
    async: !1,
    message: e,
    get "~standard"() {
      return /* @__PURE__ */ h(this);
    },
    "~run"(n, r) {
      return typeof n.value == "number" && !isNaN(n.value) ? n.typed = !0 : f(this, "type", n, r), n;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function c(e, n) {
  return {
    kind: "schema",
    type: "optional",
    reference: c,
    expects: `(${e.expects} | undefined)`,
    async: !1,
    wrapped: e,
    default: n,
    get "~standard"() {
      return /* @__PURE__ */ h(this);
    },
    "~run"(r, t) {
      return r.value === void 0 && (this.default !== void 0 && (r.value = /* @__PURE__ */ U(this, r, t)), r.value === void 0) ? (r.typed = !0, r) : this.wrapped["~run"](r, t);
    }
  };
}
// @__NO_SIDE_EFFECTS__
function V(e, n, r) {
  return {
    kind: "schema",
    type: "record",
    reference: V,
    expects: "Object",
    async: !1,
    key: e,
    value: n,
    message: r,
    get "~standard"() {
      return /* @__PURE__ */ h(this);
    },
    "~run"(t, s) {
      var i, l;
      const u = t.value;
      if (u && typeof u == "object") {
        t.typed = !0, t.value = {};
        for (const o in u)
          if (/* @__PURE__ */ W(u, o)) {
            const y = u[o], p = this.key["~run"]({ value: o }, s);
            if (p.issues) {
              const S = {
                type: "object",
                origin: "key",
                input: u,
                key: o,
                value: y
              };
              for (const g of p.issues)
                g.path = [S], (i = t.issues) == null || i.push(g);
              if (t.issues || (t.issues = p.issues), s.abortEarly) {
                t.typed = !1;
                break;
              }
            }
            const m = this.value["~run"](
              { value: y },
              s
            );
            if (m.issues) {
              const S = {
                type: "object",
                origin: "value",
                input: u,
                key: o,
                value: y
              };
              for (const g of m.issues)
                g.path ? g.path.unshift(S) : g.path = [S], (l = t.issues) == null || l.push(g);
              if (t.issues || (t.issues = m.issues), s.abortEarly) {
                t.typed = !1;
                break;
              }
            }
            (!p.typed || !m.typed) && (t.typed = !1), p.typed && (t.value[p.value] = m.value);
          }
      } else
        f(this, "type", t, s);
      return t;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function a(e) {
  return {
    kind: "schema",
    type: "string",
    reference: a,
    expects: "string",
    async: !1,
    message: e,
    get "~standard"() {
      return /* @__PURE__ */ h(this);
    },
    "~run"(n, r) {
      return typeof n.value == "string" ? n.typed = !0 : f(this, "type", n, r), n;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function O(e) {
  let n;
  if (e)
    for (const r of e)
      n ? n.push(...r.issues) : n = r.issues;
  return n;
}
// @__NO_SIDE_EFFECTS__
function $(e, n) {
  return {
    kind: "schema",
    type: "union",
    reference: $,
    expects: /* @__PURE__ */ te(
      e.map((r) => r.expects),
      "|"
    ),
    async: !1,
    options: e,
    message: n,
    get "~standard"() {
      return /* @__PURE__ */ h(this);
    },
    "~run"(r, t) {
      let s, u, i;
      for (const l of this.options) {
        const o = l["~run"]({ value: r.value }, t);
        if (o.typed)
          if (o.issues)
            u ? u.push(o) : u = [o];
          else {
            s = o;
            break;
          }
        else
          i ? i.push(o) : i = [o];
      }
      if (s)
        return s;
      if (u) {
        if (u.length === 1)
          return u[0];
        f(this, "type", r, t, {
          issues: /* @__PURE__ */ O(u)
        }), r.typed = !0;
      } else {
        if ((i == null ? void 0 : i.length) === 1)
          return i[0];
        f(this, "type", r, t, {
          issues: /* @__PURE__ */ O(i)
        });
      }
      return r;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function q() {
  return {
    kind: "schema",
    type: "unknown",
    reference: q,
    expects: "unknown",
    async: !1,
    get "~standard"() {
      return /* @__PURE__ */ h(this);
    },
    "~run"(e) {
      return e.typed = !0, e;
    }
  };
}
function B(e, n, r) {
  const t = e["~run"]({ value: n }, /* @__PURE__ */ N(r));
  if (t.issues)
    throw new se(t.issues);
  return t.value;
}
// @__NO_SIDE_EFFECTS__
function v(...e) {
  return {
    ...e[0],
    pipe: e,
    get "~standard"() {
      return /* @__PURE__ */ h(this);
    },
    "~run"(n, r) {
      for (const t of e)
        if (t.kind !== "metadata") {
          if (n.issues && (t.kind === "schema" || t.kind === "transformation")) {
            n.typed = !1;
            break;
          }
          (!n.issues || !r.abortEarly && !r.abortPipeEarly) && (n = t["~run"](n, r));
        }
      return n;
    }
  };
}
function ue(e) {
  return e.replace(/_[a-z]/g, (n) => n[1].toUpperCase());
}
function ae(e) {
  return Object.entries(e).reduce((n, [r, t]) => (n[ue(r)] = t, n), {});
}
function w(e) {
  const n = ae(e);
  for (const r in n) {
    const t = n[r];
    t && typeof t == "object" && !(t instanceof Date) && (n[r] = Array.isArray(t) ? t.map(w) : w(t));
  }
  return n;
}
function I(e) {
  return /* @__PURE__ */ d((n) => e ? w(n) : n);
}
function M(e) {
  return (n) => /* @__PURE__ */ v(
    e,
    I(n)
  );
}
function T(e) {
  return (n, r) => B(
    /* @__PURE__ */ v(e, I(r)),
    n
  );
}
function oe() {
  return /* @__PURE__ */ d(JSON.parse);
}
function C(e) {
  const n = M(e);
  return (r) => /* @__PURE__ */ v(
    /* @__PURE__ */ a(),
    oe(),
    n(r)
  );
}
function ce(e) {
  return /* @__PURE__ */ d((n) => {
    const r = {};
    return new URLSearchParams(n).forEach((t, s) => {
      const u = r[s];
      Array.isArray(u) ? u.push(t) : u === void 0 ? r[s] = t : r[s] = [u, t];
    }), B(e, r);
  });
}
function K(e) {
  return (n) => /* @__PURE__ */ v(
    /* @__PURE__ */ $([/* @__PURE__ */ a(), /* @__PURE__ */ J(URLSearchParams)]),
    ce(e),
    I(n)
  );
}
const Q = /* @__PURE__ */ c(/* @__PURE__ */ A(() => he())), le = /* @__PURE__ */ k({
  id: /* @__PURE__ */ E(),
  photo_url: /* @__PURE__ */ c(/* @__PURE__ */ a()),
  type: /* @__PURE__ */ a(),
  title: /* @__PURE__ */ a(),
  username: /* @__PURE__ */ c(/* @__PURE__ */ a())
}), pe = /* @__PURE__ */ k({
  added_to_attachment_menu: /* @__PURE__ */ c(/* @__PURE__ */ _()),
  allows_write_to_pm: /* @__PURE__ */ c(/* @__PURE__ */ _()),
  first_name: /* @__PURE__ */ a(),
  id: /* @__PURE__ */ E(),
  is_bot: /* @__PURE__ */ c(/* @__PURE__ */ _()),
  is_premium: /* @__PURE__ */ c(/* @__PURE__ */ _()),
  last_name: /* @__PURE__ */ c(/* @__PURE__ */ a()),
  language_code: /* @__PURE__ */ c(/* @__PURE__ */ a()),
  photo_url: /* @__PURE__ */ c(/* @__PURE__ */ a()),
  username: /* @__PURE__ */ c(/* @__PURE__ */ a())
}), fe = /* @__PURE__ */ k({
  auth_date: /* @__PURE__ */ v(
    /* @__PURE__ */ a(),
    /* @__PURE__ */ d((e) => new Date(Number(e) * 1e3)),
    /* @__PURE__ */ z()
  ),
  can_send_after: /* @__PURE__ */ c(/* @__PURE__ */ v(/* @__PURE__ */ a(), /* @__PURE__ */ d(Number), /* @__PURE__ */ R())),
  chat: /* @__PURE__ */ c(/* @__PURE__ */ A(() => ye())),
  chat_type: /* @__PURE__ */ c(/* @__PURE__ */ a()),
  chat_instance: /* @__PURE__ */ c(/* @__PURE__ */ a()),
  hash: /* @__PURE__ */ a(),
  query_id: /* @__PURE__ */ c(/* @__PURE__ */ a()),
  receiver: Q,
  start_param: /* @__PURE__ */ c(/* @__PURE__ */ a()),
  signature: /* @__PURE__ */ a(),
  user: Q
}), ye = C(le), he = C(pe), F = K(fe);
function H(e) {
  return /^#[\da-f]{6}$/i.test(e);
}
function me(e) {
  return /^#[\da-f]{3}$/i.test(e);
}
function ge(e) {
  const n = e.replace(/\s/g, "").toLowerCase();
  if (H(n))
    return n;
  if (me(n)) {
    let t = "#";
    for (let s = 0; s < 3; s += 1)
      t += n[1 + s].repeat(2);
    return t;
  }
  const r = n.match(/^rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)$/) || n.match(/^rgba\((\d{1,3}),(\d{1,3}),(\d{1,3}),\d{1,3}\)$/);
  if (!r)
    throw new Error(`Value "${e}" does not satisfy any of known RGB formats.`);
  return r.slice(1).reduce((t, s) => t + parseInt(s, 10).toString(16).padStart(2, "0"), "#");
}
const be = M(
  /* @__PURE__ */ V(
    /* @__PURE__ */ a(),
    /* @__PURE__ */ v(
      /* @__PURE__ */ $([/* @__PURE__ */ a(), /* @__PURE__ */ E()]),
      /* @__PURE__ */ d((e) => typeof e == "number" ? `#${(e & 16777215).toString(16).padStart(6, "0")}` : e),
      /* @__PURE__ */ L(H)
    )
  )
), x = /* @__PURE__ */ c(
  /* @__PURE__ */ v(/* @__PURE__ */ a(), /* @__PURE__ */ d((e) => e === "1"))
), G = C(be()), de = /* @__PURE__ */ k({
  tgWebAppBotInline: x,
  tgWebAppData: /* @__PURE__ */ c(F()),
  tgWebAppDefaultColors: /* @__PURE__ */ c(G()),
  tgWebAppFullscreen: x,
  tgWebAppPlatform: /* @__PURE__ */ a(),
  tgWebAppShowSettings: x,
  tgWebAppStartParam: /* @__PURE__ */ c(/* @__PURE__ */ a()),
  tgWebAppThemeParams: G(),
  tgWebAppVersion: /* @__PURE__ */ a()
}), X = K(de), ke = T(F()), _e = T(X()), Se = /* @__PURE__ */ k({
  eventType: /* @__PURE__ */ a(),
  eventData: /* @__PURE__ */ c(/* @__PURE__ */ q())
});
function Y(e, n) {
  return n || (n = (r, t) => JSON.stringify(t)), new URLSearchParams(
    Object.entries(e).reduce((r, [t, s]) => (Array.isArray(s) ? r.push(...s.map((u) => [t, String(u)])) : s != null && r.push([
      t,
      s instanceof Date ? (s.getTime() / 1e3 | 0).toString() : typeof s == "string" || typeof s == "number" ? String(s) : typeof s == "boolean" ? s ? "1" : "0" : n(t, s)
    ]), r), [])
  ).toString();
}
function ve(e) {
  return Y(e);
}
function Ee(e) {
  return Y(e, (n, r) => n === "tgWebAppData" ? ve(r) : JSON.stringify(r));
}
function De(e) {
  try {
    return /* @__PURE__ */ ie(X(), e);
  } catch {
    return !1;
  }
}
export {
  le as InitDataChatSchema,
  fe as InitDataQuerySchema,
  pe as InitDataUserSchema,
  de as LaunchParamsSchema,
  Se as MiniAppsMessageSchema,
  I as conditionalSnakeKeys,
  M as createCamelCaseGen,
  T as createCamelCaseSchemaParserGen,
  C as createJsonCamelCaseGen,
  K as createQueryCamelCaseGen,
  ye as initDataChatJson,
  F as initDataQuery,
  he as initDataUserJson,
  De as isLaunchParamsQuery,
  H as isRGB,
  me as isRGBShort,
  oe as jsonParse,
  X as launchParamsQuery,
  ke as parseInitDataQuery,
  _e as parseLaunchParamsQuery,
  ve as serializeInitDataQuery,
  Ee as serializeLaunchParamsQuery,
  Y as serializeToQuery,
  be as themeParams,
  ge as toRGB,
  ce as transformQueryUsing
};
//# sourceMappingURL=index.js.map
