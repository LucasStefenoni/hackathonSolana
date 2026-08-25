var V = Object.defineProperty;
var Y = (r, t, e) => t in r ? V(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var y = (r, t, e) => Y(r, typeof t != "symbol" ? t + "" : t, e);
var $ = Object.defineProperty, k = (r, t, e) => t in r ? $(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e, q = (r, t, e) => k(r, t + "", e);
function z(r, t) {
  return (e) => e instanceof r && e.type === t;
}
function P(r, t) {
  t || (t = []);
  const e = Symbol(r);
  class c extends Error {
    constructor(...s) {
      const a = typeof t == "function" ? t(...s) : typeof t == "string" ? [t] : t || [];
      super(...a), q(this, "type", e), this.name = r;
    }
  }
  return Object.defineProperty(c, "name", { value: r }), [c, z(c, e)];
}
const [G, M] = P("CancelledError", "Promise was canceled"), [H, N] = P(
  "TimeoutError",
  (r, t) => [`Timeout reached: ${r}ms`, { cause: t }]
), B = Symbol("Resolved");
function C(r) {
  return Array.isArray(r) && r[0] === B;
}
function J(r) {
  return [B, r];
}
function x(r, t) {
  return r.reject = t.reject, r.abort = t.abort, r;
}
class m extends Promise {
  constructor(e, c) {
    let o, s;
    super((a, i) => {
      let v, u;
      typeof e == "function" ? (v = e, u = c) : u = e;
      const d = [], j = (n) => (...h) => {
        const p = n(...h);
        return d.forEach((F) => F()), p;
      }, g = new AbortController(), { signal: l } = g;
      s = (n) => {
        !l.aborted && g.abort(n);
      };
      const b = () => l.reason, w = (n) => {
        const h = () => {
          n(b());
        };
        l.addEventListener("abort", h, !0);
        const p = () => {
          l.removeEventListener("abort", h, !0);
        };
        return d.push(p), p;
      }, D = j((n) => {
        a(n), s(J(n));
      });
      o = j((n) => {
        i(n), s(n);
      }), u || (u = {});
      const { abortSignal: f, rejectOnAbort: A = !0 } = u;
      if (f)
        if (f.aborted) {
          const { reason: n } = f;
          if (A)
            return o(n);
          s(n);
        } else {
          const n = () => {
            s(f.reason);
          };
          f.addEventListener("abort", n), d.push(() => {
            f.removeEventListener("abort", n);
          });
        }
      A && w(i);
      const { timeout: E } = u;
      if (E) {
        const n = setTimeout(() => {
          s(new H(E));
        }, E);
        d.push(() => {
          clearTimeout(n);
        });
      }
      const L = () => l.aborted, S = () => C(b()), T = () => {
        const n = b();
        return C(n) ? n[1] : void 0;
      };
      try {
        const n = v && v(D, o, {
          abortReason: b,
          abortSignal: l,
          isAborted: L,
          isResolved: S,
          onAborted: w,
          onResolved: (h) => w(() => {
            S() && h(T());
          }),
          resolved: T,
          throwIfAborted() {
            if (L())
              throw b();
          }
        });
        n instanceof Promise && n.catch(o);
      } catch (n) {
        o(n);
      }
    });
    /**
     * Aborts the promise execution using the specified reason.
     *
     * Not that this method doesn't reject the promise but notifies the executor using its context.
     * To perform the same operation but also reject the promise, use the `reject()` method.
     * @param reason - abort reason.
     * @see reject
     */
    y(this, "abort");
    /**
     * Rejects the initially created promise.
     *
     * This method not only aborts the signal passed to the executor, but also rejects the
     * promise itself calling all chained listeners.
     *
     * The reason passed to the method is being passed as-is to the executor's context.
     */
    y(this, "reject");
    this.abort = s, this.reject = o;
  }
  /**
   * Creates a new AbortablePromise instance using an executor, resolving the promise when a result
   * was returned.
   * @param fn - function returning promise result.
   * @param options - additional options.
   */
  static fn(e, c) {
    return new m(async (o, s, a) => {
      try {
        o(await e(a));
      } catch (i) {
        s(i);
      }
    }, c);
  }
  static resolve(e) {
    return this.fn(() => e);
  }
  /**
   * @see Promise.reject
   */
  static reject(e) {
    return new m((c, o) => {
      o(e);
    });
  }
  /**
   * Aborts the promise with the cancel error.
   */
  cancel() {
    this.abort(new G());
  }
  /**
   * @see Promise.catch
   */
  catch(e) {
    return this.then(void 0, e);
  }
  /**
   * @see Promise.finally
   */
  finally(e) {
    return x(super.finally(e), this);
  }
  /**
   * @see Promise.then
   */
  then(e, c) {
    return x(super.then(e, c), this);
  }
}
function I(r, t) {
  return r.resolve = t.resolve, r;
}
class R extends m {
  constructor(e, c) {
    let o, s;
    typeof e == "function" ? (o = e, s = c) : s = e;
    let a;
    super((i, v, u) => {
      a = i, o && o(i, v, u);
    }, s);
    /**
     * Resolves the promise.
     */
    y(this, "resolve");
    this.resolve = a;
  }
  /**
   * Creates a new ManualPromise instance using an executor, resolving the promise when a result
   * was returned.
   * @param fn - function returning promise result.
   * @param options - additional options.
   */
  static fn(e, c) {
    return new R((o, s, a) => {
      try {
        Promise.resolve(e(a)).then(o, s);
      } catch (i) {
        s(i);
      }
    }, c);
  }
  static resolve(e) {
    return this.fn(() => e);
  }
  /**
   * @see Promise.reject
   */
  static reject(e) {
    return new R((c, o) => {
      o(e);
    });
  }
  /**
   * @see Promise.catch
   */
  catch(e) {
    return this.then(void 0, e);
  }
  /**
   * @see Promise.finally
   */
  finally(e) {
    return I(super.finally(e), this);
  }
  /**
   * @see Promise.then
   */
  then(e, c) {
    return I(super.then(e, c), this);
  }
}
export {
  m as AbortablePromise,
  G as CancelledError,
  R as ManualPromise,
  H as TimeoutError,
  M as isCancelledError,
  C as isPromiseResolveResult,
  N as isTimeoutError
};
//# sourceMappingURL=index.js.map
