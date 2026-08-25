function y(o) {
  return o.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`);
}
function C(o) {
  return o.replace(/[A-Z]/g, (e) => `_${e.toLowerCase()}`);
}
function S(o) {
  return Object.entries(o).reduce((e, [r, t]) => (e[C(r)] = t, e), {});
}
function $(o) {
  return o.replace(/_[a-z]/g, (e) => e[1].toUpperCase());
}
function h(o) {
  return Object.entries(o).reduce((e, [r, t]) => (e[$(r)] = t, e), {});
}
function f(o) {
  const e = h(o);
  for (const r in e) {
    const t = e[r];
    t && typeof t == "object" && !(t instanceof Date) && (e[r] = Array.isArray(t) ? t.map(f) : f(t));
  }
  return e;
}
function k(o) {
  return o.replace(/_([a-z])/g, (e, r) => `-${r.toLowerCase()}`);
}
function g(o) {
  return `tapps/${o}`;
}
function w(o, e) {
  sessionStorage.setItem(g(o), JSON.stringify(e));
}
function T(o) {
  const e = sessionStorage.getItem(g(o));
  try {
    return e ? JSON.parse(e) : void 0;
  } catch {
  }
}
function L(...o) {
  const e = o.flat(1);
  return [
    e.push.bind(e),
    () => {
      e.forEach((r) => {
        r();
      });
    }
  ];
}
// @__NO_SIDE_EFFECTS__
function O(o, e) {
  e || (e = {});
  const {
    textColor: r,
    bgColor: t,
    shouldLog: s
  } = e, c = s === void 0 ? !0 : s, d = typeof c == "boolean" ? () => c : c, u = (n, a, ...i) => {
    if (a || d()) {
      const l = "font-weight:bold;padding:0 5px;border-radius:100px", [b, m, p] = {
        log: ["#0089c3", "white", "INFO"],
        error: ["#ff0000F0", "white", "ERR"],
        warn: ["#D38E15", "white", "WARN"]
      }[n];
      console[n](
        `%c${p} ${Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
          timeZone: "UTC"
        }).format(/* @__PURE__ */ new Date())}%c %c${o}`,
        `${l};background-color:${b};color:${m}`,
        "",
        `${l};${r ? `color:${r};` : ""}${t ? `background-color:${t}` : ""}`,
        ...i
      );
    }
  };
  return [
    ["log", "forceLog"],
    ["warn", "forceWarn"],
    ["error", "forceError"]
  ].reduce((n, [a, i]) => (n[a] = u.bind(void 0, a, !1), n[i] = u.bind(void 0, a, !0), n), {});
}
export {
  y as camelToKebab,
  C as camelToSnake,
  S as camelToSnakeObjKeys,
  L as createCbCollector,
  O as createLogger,
  f as deepSnakeToCamelObjKeys,
  T as getStorageValue,
  w as setStorageValue,
  $ as snakeToCamel,
  h as snakeToCamelObjKeys,
  k as snakeToKebab
};
//# sourceMappingURL=index.js.map
