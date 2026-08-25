var f = Object.defineProperty;
var u = (r, t, e) => t in r ? f(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var c = (r, t, e) => u(r, typeof t != "symbol" ? t + "" : t, e);
function a(r, t) {
  return (e) => e instanceof r && e.type === t;
}
function p(r, t) {
  t || (t = []);
  const e = Symbol(r);
  class n extends Error {
    constructor(...i) {
      const o = typeof t == "function" ? t(...i) : typeof t == "string" ? [t] : t || [];
      super(...o);
      c(this, "type", e);
      this.name = r;
    }
  }
  return Object.defineProperty(n, "name", { value: r }), [n, a(n, e)];
}
function l(r, t, e) {
  const n = Symbol(r);
  class s extends p(r, e)[0] {
    constructor(...o) {
      super(...o);
      c(this, "data");
      c(this, "type", n);
      this.data = t(...o);
    }
  }
  return Object.defineProperty(s, "name", { value: r }), [s, a(s, n)];
}
export {
  p as errorClass,
  l as errorClassWithData,
  a as isErrorOfKind
};
//# sourceMappingURL=index.js.map
