import { is as y, looseObject as u, function as N, boolean as A, nullish as d, number as C, string as m, optional as q, unknown as te, parse as P, pipe as G, any as re } from "valibot";
import { AbortablePromise as D } from "better-promises";
import { AbortablePromise as et, CancelledError as tt, ManualPromise as rt, TimeoutError as nt, isCancelledError as ot, isTimeoutError as at } from "better-promises";
import { createLogger as ne, createCbCollector as oe, getStorageValue as ae, setStorageValue as J, deepSnakeToCamelObjKeys as se } from "@telegram-apps/toolkit";
import { createLogger as ct } from "@telegram-apps/toolkit";
import { themeParams as ce, jsonParse as B, MiniAppsMessageSchema as Q, isLaunchParamsQuery as O, parseLaunchParamsQuery as k, serializeLaunchParamsQuery as ie } from "@telegram-apps/transformers";
import pe from "mitt";
import { signal as S } from "@telegram-apps/signals";
import { errorClass as b, errorClassWithData as _e } from "error-kid";
function F(e) {
  return btoa(
    encodeURIComponent(e).replace(/%([0-9A-F]{2})/g, (t, r) => String.fromCharCode(parseInt(`0x${r}`)))
  ).replace(/\+/g, "-").replace(/\//g, "_");
}
function ue(e) {
  return decodeURIComponent(
    atob(e).replace(/-/g, "+").replace(/_/g, "/").split("").map((t) => "%" + ("00" + t.charCodeAt(0).toString(16)).slice(-2)).join("")
  );
}
function H(e) {
  return y(
    u({ TelegramWebviewProxy: u({ postEvent: N() }) }),
    e
  );
}
function K() {
  try {
    return window.self !== window.top;
  } catch {
    return !0;
  }
}
function le(e, t) {
  const r = /* @__PURE__ */ new Map(), n = pe(), a = (o, s, c) => {
    c || (c = !1);
    const i = r.get(o) || /* @__PURE__ */ new Map();
    r.set(o, i);
    const _ = i.get(s) || [];
    i.set(s, _);
    const l = _.findIndex((w) => w[1] === c);
    if (l >= 0 && (n.off(o, _[l][0]), _.splice(l, 1), !_.length && (i.delete(s), !i.size))) {
      const w = r.size;
      r.delete(o), w && !r.size && t();
    }
  };
  return [
    function(s, c, i) {
      !r.size && e();
      const _ = () => {
        a(s, c, i);
      }, l = (...M) => {
        i && _(), s === "*" ? c(M) : c(...M);
      };
      n.on(s, l);
      const w = r.get(s) || /* @__PURE__ */ new Map();
      r.set(s, w);
      const T = w.get(c) || [];
      return w.set(c, T), T.push([l, i || !1]), _;
    },
    a,
    // eslint-disable-next-line @typescript-eslint/unbound-method
    n.emit,
    function() {
      const s = r.size;
      n.all.clear(), r.clear(), s && t();
    }
  ];
}
function v(e, t) {
  window.dispatchEvent(new MessageEvent("message", {
    data: JSON.stringify({ eventType: e, eventData: t }),
    // We specify window.parent to imitate the case, the parent iframe sent us this event.
    source: window.parent
  }));
}
let h = !1;
const L = (e) => {
  f().log("Event received:", e);
};
function fe(e) {
  e !== h && (h = e, h ? X("*", L) : me("*", L));
}
const f = S(ne("Bridge", {
  bgColor: "#9147ff",
  textColor: "white",
  shouldLog() {
    return h;
  }
}));
function Y(e, t, r, n) {
  Object.defineProperty(e, t, {
    enumerable: !0,
    configurable: !0,
    get: r,
    set: n
  });
}
function W(e, t) {
  const r = e[t];
  Y(e, t, () => r, (n) => {
    Object.entries(n).forEach(([a, o]) => {
      r[a] = o;
    });
  });
}
function U(e, t, r) {
  Object.defineProperty(e, t, {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: r
  });
}
function E(e, t, r) {
  const n = e[t], a = [r];
  typeof n == "function" && a.push(n);
  const o = (...c) => {
    a.forEach((i) => {
      i(...c);
    });
  }, s = Object.assign((...c) => {
    o(...c);
  }, {
    // Unwraps the composer.
    unwrap() {
      const { length: c } = a;
      if (c === 1) {
        delete e[t];
        return;
      }
      if (c === 2) {
        U(e, t, a[1]);
        return;
      }
      a.unshift(1), U(e, t, o);
    }
  });
  Y(
    e,
    t,
    () => s,
    (c) => {
      a.push(c);
    }
  );
}
const we = {
  clipboard_text_received: u({
    req_id: m(),
    data: d(m())
  }),
  custom_method_invoked: u({
    req_id: m(),
    result: q(te()),
    error: q(m())
  }),
  popup_closed: d(
    u({ button_id: d(m(), () => {
    }) }),
    {}
  ),
  viewport_changed: u({
    height: C(),
    width: d(C(), () => window.innerWidth),
    is_state_stable: A(),
    is_expanded: A()
  }),
  theme_changed: u({
    theme_params: ce()
  })
};
function I(e) {
  if (e.source !== window.parent)
    return;
  let t;
  try {
    t = P(G(m(), B(), Q), e.data);
  } catch {
    return;
  }
  const { eventType: r, eventData: n } = t, a = we[r];
  let o;
  try {
    o = a ? P(a, n) : n;
  } catch (s) {
    return f().forceError(
      [
        `An error occurred processing the "${r}" event from the Telegram application.`,
        "Please, file an issue here:",
        "https://github.com/Telegram-Mini-Apps/telegram-apps/issues/new/choose"
      ].join(`
`),
      t,
      s
    );
  }
  ge(r, o);
}
const [
  X,
  me,
  ge,
  be
] = le(
  () => {
    const e = window;
    !e.TelegramGameProxy && (e.TelegramGameProxy = {}), E(e.TelegramGameProxy, "receiveEvent", v), W(e, "TelegramGameProxy"), !e.Telegram && (e.Telegram = {}), !e.Telegram.WebView && (e.Telegram.WebView = {}), E(e.Telegram.WebView, "receiveEvent", v), W(e.Telegram, "WebView"), E(e, "TelegramGameProxy_receiveEvent", v), window.addEventListener("message", I);
  },
  () => {
    [
      ["TelegramGameProxy_receiveEvent"],
      ["TelegramGameProxy", "receiveEvent"],
      ["Telegram", "WebView", "receiveEvent"]
    ].forEach((e) => {
      const t = window;
      let r = [void 0, t];
      for (const o of e)
        if (r = [r[1], r[1][o]], !r[1])
          return;
      const [n, a] = r;
      "unwrap" in a && (a.unwrap(), n && n !== t && !Object.keys(n).length && delete t[e[0]]);
    }), window.removeEventListener("message", I);
  }
), [
  de,
  Ie
] = b(
  "MethodUnsupportedError",
  (e, t) => [
    `Method "${e}" is unsupported in Mini Apps version ${t}`
  ]
), [
  he,
  Re
] = b(
  "MethodParameterUnsupportedError",
  (e, t, r) => [
    `Parameter "${t}" of "${e}" method is unsupported in Mini Apps version ${r}`
  ]
), [
  ye,
  je
] = _e(
  "LaunchParamsRetrieveError",
  (e) => ({ errors: e }),
  (e) => [
    [
      "Unable to retrieve launch parameters from any known source. Perhaps, you have opened your app outside Telegram?",
      "📖 Refer to docs for more information:",
      "https://docs.telegram-mini-apps.com/packages/telegram-apps-bridge/environment",
      "",
      "Collected errors:",
      ...e.map(([t, r]) => `Source: ${t} / ${r instanceof Error ? r.message : String(r)}`)
    ].join(`
`)
  ]
), [
  ve,
  $e
] = b(
  "InvalidLaunchParamsError",
  (e, t) => [
    `Invalid value for launch params: ${e}`,
    { cause: t }
  ]
), [Ee, ze] = b("UnknownEnvError"), [
  Pe,
  Ne
] = b(
  "InvokeCustomMethodError",
  (e) => [`Server returned error: ${e}`]
), g = S((...e) => {
  try {
    window.parent.postMessage(...e);
  } catch (t) {
    t instanceof SyntaxError ? f().forceError(
      "Unable to call window.parent.postMessage due to incorrectly configured target origin. Use the setTargetOrigin method to allow this origin to receive events",
      t
    ) : f().forceError(t);
  }
}), ke = (...e) => g()(...e), x = S("https://web.telegram.org");
function Ge(e) {
  x.set(e), f().log("New target origin set", e);
}
function Z(e, t) {
  f().log("Posting event:", t ? { eventType: e, eventData: t } : { eventType: e });
  const r = window, n = JSON.stringify({ eventType: e, eventData: t });
  if (K())
    return ke(n, x());
  if (H(r)) {
    r.TelegramWebviewProxy.postEvent(e, JSON.stringify(t));
    return;
  }
  if (y(u({ external: u({ notify: N() }) }), r)) {
    r.external.notify(n);
    return;
  }
  throw new Ee();
}
function V(e, t, r) {
  r || (r = {});
  const { capture: n } = r, [a, o] = oe();
  return new D((s) => {
    (Array.isArray(t) ? t : [t]).forEach((c) => {
      a(
        X(c, (i) => {
          (!n || (Array.isArray(t) ? n({
            event: c,
            payload: i
          }) : n(i))) && s(i);
        })
      );
    }), (r.postEvent || Z)(e, r.params);
  }, r).finally(o);
}
const R = "launchParams";
function j(e) {
  return e.replace(/^[^?#]*[?#]/, "").replace(/[?#]/g, "&");
}
function ee() {
  const e = [];
  for (const [t, r] of [
    // Try to retrieve launch parameters from the current location. This method can return
    // nothing in case, location was changed, and then the page was reloaded.
    [() => j(window.location.href), "window.location.href"],
    // Then, try using the lower level API - window.performance.
    [() => {
      const n = performance.getEntriesByType("navigation")[0];
      return n && j(n.name);
    }, "performance navigation entries"],
    [() => ae(R), "local storage"]
  ]) {
    const n = t();
    if (!n) {
      e.push([r, new Error("Source is empty")]);
      continue;
    }
    if (O(n))
      return J(R, n), n;
    try {
      k(n);
    } catch (a) {
      e.push([r, a]);
    }
  }
  throw new ye(e);
}
function Se(e) {
  const t = k(ee());
  return e ? se(t) : t;
}
function De(e, t) {
  if (!e)
    try {
      return Se(), !0;
    } catch {
      return !1;
    }
  return D.fn(async (r) => {
    if (H(window))
      return !0;
    try {
      return await V("web_app_request_theme", "theme_changed", r), !0;
    } catch {
      return !1;
    }
  }, t || { timeout: 100 });
}
function Je({ launchParams: e, onEvent: t, resetPostMessage: r } = {}) {
  if (e) {
    const o = typeof e == "string" || e instanceof URLSearchParams ? e.toString() : (
      // Here we have to trick serializeLaunchParamsQuery into thinking, it serializes a valid
      // value. We are doing it because we are working with tgWebAppData presented as a
      // string, not an object as serializeLaunchParamsQuery requires.
      ie({ ...e, tgWebAppData: void 0 }) + (e.tgWebAppData ? `&tgWebAppData=${encodeURIComponent(e.tgWebAppData.toString())}` : "")
    );
    if (!O(o))
      try {
        k(o);
      } catch (s) {
        throw new ve(o, s);
      }
    J("launchParams", o);
  }
  if (K()) {
    if (!t)
      return;
    const o = G(
      m(),
      B(),
      Q
    );
    r && g.reset();
    const s = g();
    g.set((...c) => {
      const [i] = c, _ = () => {
        s(...c);
      };
      if (y(o, i)) {
        const l = P(o, i);
        t([l.eventType, l.eventData], _);
      } else
        _();
    });
    return;
  }
  const n = window.TelegramWebviewProxy || {}, a = n.postEvent || (() => {
  });
  window.TelegramWebviewProxy = {
    ...n,
    postEvent(o, s) {
      const c = () => {
        a(o, s);
      };
      t ? t([o, s ? JSON.parse(s) : void 0], c) : c();
    }
  }, f().log("Environment was mocked by the mockTelegramEnv function");
}
function Be() {
  return new URLSearchParams(ee()).get("tgWebAppData") || void 0;
}
function xe(e) {
  return ({ req_id: t }) => t === e;
}
function $(e) {
  return e.split(".").map(Number);
}
function Te(e, t) {
  const r = $(e), n = $(t), a = Math.max(r.length, n.length);
  for (let o = 0; o < a; o += 1) {
    const s = r[o] || 0, c = n[o] || 0;
    if (s !== c)
      return s > c ? 1 : -1;
  }
  return 0;
}
function p(e, t) {
  return Te(e, t) <= 0;
}
function z(e, t, r) {
  if (typeof r == "string") {
    if (e === "web_app_open_link") {
      if (t === "try_instant_view")
        return p("6.4", r);
      if (t === "try_browser")
        return p("7.6", r);
    }
    if (e === "web_app_set_header_color" && t === "color")
      return p("6.9", r);
    if (e === "web_app_close" && t === "return_back")
      return p("7.6", r);
    if (e === "web_app_setup_main_button" && t === "has_shine_effect")
      return p("7.10", r);
  }
  switch (e) {
    case "web_app_open_tg_link":
    case "web_app_open_invoice":
    case "web_app_setup_back_button":
    case "web_app_set_background_color":
    case "web_app_set_header_color":
    case "web_app_trigger_haptic_feedback":
      return p("6.1", t);
    case "web_app_open_popup":
      return p("6.2", t);
    case "web_app_close_scan_qr_popup":
    case "web_app_open_scan_qr_popup":
    case "web_app_read_text_from_clipboard":
      return p("6.4", t);
    case "web_app_switch_inline_query":
      return p("6.7", t);
    case "web_app_invoke_custom_method":
    case "web_app_request_write_access":
    case "web_app_request_phone":
      return p("6.9", t);
    case "web_app_setup_settings_button":
      return p("6.10", t);
    case "web_app_biometry_get_info":
    case "web_app_biometry_open_settings":
    case "web_app_biometry_request_access":
    case "web_app_biometry_request_auth":
    case "web_app_biometry_update_token":
      return p("7.2", t);
    case "web_app_setup_swipe_behavior":
      return p("7.7", t);
    case "web_app_share_to_story":
      return p("7.8", t);
    case "web_app_setup_secondary_button":
    case "web_app_set_bottom_bar_color":
      return p("7.10", t);
    case "web_app_request_safe_area":
    case "web_app_request_content_safe_area":
    case "web_app_request_fullscreen":
    case "web_app_exit_fullscreen":
    case "web_app_set_emoji_status":
    case "web_app_add_to_home_screen":
    case "web_app_check_home_screen":
    case "web_app_request_emoji_status_access":
    case "web_app_check_location":
    case "web_app_open_location_settings":
    case "web_app_request_file_download":
    case "web_app_request_location":
    case "web_app_send_prepared_message":
    case "web_app_start_accelerometer":
    case "web_app_start_device_orientation":
    case "web_app_start_gyroscope":
    case "web_app_stop_accelerometer":
    case "web_app_stop_device_orientation":
    case "web_app_stop_gyroscope":
    case "web_app_toggle_orientation_lock":
      return p("8.0", t);
    case "web_app_device_storage_clear":
    case "web_app_device_storage_get_key":
    case "web_app_device_storage_save_key":
    case "web_app_secure_storage_clear":
    case "web_app_secure_storage_get_key":
    case "web_app_secure_storage_restore_key":
    case "web_app_secure_storage_save_key":
      return p("9.0", t);
    case "web_app_hide_keyboard":
      return p("9.1", t);
    default:
      return [
        "iframe_ready",
        "iframe_will_reload",
        "web_app_close",
        "web_app_data_send",
        "web_app_expand",
        "web_app_open_link",
        "web_app_ready",
        "web_app_request_theme",
        "web_app_request_viewport",
        "web_app_setup_main_button",
        "web_app_setup_closing_behavior"
      ].includes(e);
  }
}
function Qe(e, t) {
  t || (t = "strict");
  const r = typeof t == "function" ? t : (n) => {
    const { method: a, version: o } = n, s = "param" in n ? new he(a, n.param, o) : new de(a, o);
    if (t === "strict")
      throw s;
    return f().forceWarn(s.message);
  };
  return (n, a) => z(n, e) ? n === "web_app_set_header_color" && y(u({ color: re() }), a) && !z(n, "color", e) ? r({ version: e, method: n, param: "color" }) : Z(n, a) : r({ version: e, method: n });
}
function Oe(e) {
  const t = F(typeof e == "string" ? e : JSON.stringify(e));
  if (t.length > 512)
    throw new Error("Value is too long for start parameter");
  return t;
}
function Fe(e, t) {
  const r = ue(e);
  return t === "json" ? JSON.parse(r) : t ? t(r) : r;
}
function He(e) {
  return F(e).length <= 512;
}
function Ke(e, t, r, n) {
  return V("web_app_invoke_custom_method", "custom_method_invoked", {
    ...n || {},
    params: { method: e, params: t, req_id: r },
    capture: xe(r)
  }).then(({ result: a, error: o }) => {
    if (o)
      throw new Pe(o);
    return a;
  });
}
function Ye() {
  Object.hasOwn || (Object.hasOwn = function(e, t) {
    return Object.prototype.hasOwnProperty.call(e, t);
  });
}
function Xe() {
  be(), fe(!1), [g, x].forEach((e) => {
    e.unsubAll(), e.reset();
  });
}
export {
  et as AbortablePromise,
  tt as CancelledError,
  ve as InvalidLaunchParamsError,
  Pe as InvokeCustomMethodError,
  ye as LaunchParamsRetrieveError,
  rt as ManualPromise,
  he as MethodParameterUnsupportedError,
  de as MethodUnsupportedError,
  nt as TimeoutError,
  Ee as UnknownEnvError,
  Ye as applyPolyfills,
  xe as captureSameReq,
  Te as compareVersions,
  ct as createLogger,
  Qe as createPostEvent,
  Oe as createStartParam,
  ue as decodeBase64Url,
  Fe as decodeStartParam,
  v as emitEvent,
  F as encodeBase64Url,
  H as hasWebviewProxy,
  Ke as invokeCustomMethod,
  ot as isCancelledError,
  K as isIframe,
  $e as isInvalidLaunchParamsError,
  Ne as isInvokeCustomMethodError,
  je as isLaunchParamsRetrieveError,
  Re as isMethodMethodParameterUnsupportedError,
  Ie as isMethodUnsupportedError,
  He as isSafeToCreateStartParam,
  De as isTMA,
  at as isTimeoutError,
  ze as isUnknownEnvError,
  f as logger,
  Je as mockTelegramEnv,
  me as off,
  be as offAll,
  X as on,
  Z as postEvent,
  ke as postMessage,
  g as postMessageImplementation,
  V as request,
  Xe as resetPackageState,
  Se as retrieveLaunchParams,
  Be as retrieveRawInitData,
  ee as retrieveRawLaunchParams,
  fe as setDebug,
  Ge as setTargetOrigin,
  z as supports,
  x as targetOrigin
};
//# sourceMappingURL=index.js.map
