// Compiles a dart2wasm-generated main module from `source` which can then
// be instantiated via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm module from `bytes` which is then
// instantiable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredModules` is a JS function that takes an array of module names
  //   matching wasm files produced by the dart2wasm compiler. It also takes a
  //   callback that should be invoked for each loaded module with 2 arguments:
  //   (1) the module name, (2) the loaded module in a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`. The callback
  //   returns a Promise that resolves when the module is instantiated.
  //   loadDeferredModules should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  // `loadDeferredId` is a JS function that takes load ID produced by the
  //   compiler when the `use-load-ids` option is passed. Each load ID maps to
  //   one or more wasm files as specified in the emitted JSON file. It also
  //   takes a callback that should be invoked for each loaded module with 2
  //   arguments: (1) the module name, (2) the loaded module in a format
  //   supported by `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  //   The callback returns a Promise that resolves when the module is
  //   instantiated.
  //   loadDeferredId should return a Promise that resolves when all the
  //   modules have been loaded and the callback promises have resolved.
  async instantiate(additionalImports, {loadDeferredModules, loadDeferredId} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + value;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            AB: o => o,
      AC: Function.prototype.call.bind(DataView.prototype.getInt32),
      AD: x0 => x0.length,
      AE: x0 => x0.visualViewport,
      AF: (x0,x1) => { x0.className = x1 },
      AG: x0 => x0.getBoundingClientRect(),
      AH: x0 => x0.touches,
      AI: () => globalThis.Symbol,
      AJ: x0 => x0.image,
      AK: x0 => x0.nextSibling,
      B: s => printToConsole(s),
      BB: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'boolean') return 1;
        return 2;
      },
      BC: Function.prototype.call.bind(DataView.prototype.setInt32),
      BD: (x0,x1) => x0.item(x1),
      BE: x0 => x0.devicePixelRatio,
      BF: (x0,x1) => { x0.tabIndex = x1 },
      BG: x0 => x0.bottom,
      BH: x0 => x0.pressure,
      BI: (x0,x1) => new Intl.Segmenter(x0,x1),
      BJ: () => globalThis.window.ImageDecoder,
      BK: (x0,x1) => x0.debug(x1),
      C: Function.prototype.call.bind(Number.prototype.toString),
      CB: x0 => x0.flags,
      CC: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      CD: x0 => x0.userAgent,
      CE: x0 => x0.maxHeight,
      CF: (x0,x1) => { x0.name = x1 },
      CG: x0 => x0.top,
      CH: x0 => x0.tiltY,
      CI: x0 => x0.Segmenter,
      CJ: x0 => x0.status,
      CK: x0 => x0.hostElement,
      D: Function.prototype.call.bind(BigInt.prototype.toString),
      DB: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      DC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int32Array) return 1;
        return 2;
      },
      DD: x0 => x0.maxTouchPoints,
      DE: x0 => x0.maxWidth,
      DF: (x0,x1) => { x0.placeholder = x1 },
      DG: x0 => x0.right,
      DH: x0 => x0.tiltX,
      DI: x0 => x0.buffer,
      DJ: x0 => x0.response,
      DK: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      E: (exn) => {
        let stackString = exn.toString();
        let frames = stackString.split('\n');
        let drop = 4;
        if (frames[0].startsWith('Error')) {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      EB: o => o instanceof RegExp,
      EC: x0 => new Uint16Array(x0),
      ED: x0 => x0.platform,
      EE: x0 => x0.minHeight,
      EF: (x0,x1) => { x0.autocomplete = x1 },
      EG: x0 => x0.left,
      EH: x0 => x0.pointerType,
      EI: x0 => x0.wasmMemory,
      EJ: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      EK: x0 => x0.location,
      F: () => new Error().stack,
      FB: (a, i, v) => a[i] = v,
      FC: Function.prototype.call.bind(DataView.prototype.getUint16),
      FD: x0 => x0.navigator,
      FE: x0 => x0.minWidth,
      FF: (x0,x1) => { x0.name = x1 },
      FG: x0 => x0.clientY,
      FH: x0 => x0.pointerId,
      FI: () => globalThis.window._flutter_skwasmInstance,
      FJ: (x0,x1) => { x0.responseType = x1 },
      FK: (x0,x1) => x0.getModifierState(x1),
      G: s => JSON.stringify(s),
      GB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      GC: Function.prototype.call.bind(DataView.prototype.setUint16),
      GD: s => new Date(s * 1000).getTimezoneOffset() * 60,
      GE: x0 => x0.height,
      GF: (x0,x1) => { x0.placeholder = x1 },
      GG: x0 => x0.clientX,
      GH: x0 => x0.getCoalescedEvents(),
      GI: () => new TextDecoder(),
      GJ: () => new XMLHttpRequest(),
      GK: x0 => x0.metaKey,
      H: Function.prototype.call.bind(Number.prototype.toString),
      HB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      HC: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      HD: Date.now,
      HE: x0 => x0.width,
      HF: (x0,x1) => { x0.action = x1 },
      HG: x0 => x0.changedTouches,
      HH: (x0,x1) => x0.getModifierState(x1),
      HI: (a, i) => a.splice(i, 1),
      HJ: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      HK: x0 => x0.altKey,
      I: Function.prototype.call.bind(String.prototype.indexOf),
      IB: Function.prototype.call.bind(String.prototype.toLowerCase),
      IC: o => o instanceof Uint16Array,
      ID: (x0,x1,x2) => x0.setAttribute(x1,x2),
      IE: x0 => x0.screen,
      IF: (x0,x1) => { x0.method = x1 },
      IG: x0 => x0.offsetY,
      IH: x0 => x0.blur(),
      II: a => a.pop(),
      IJ: x0 => x0.naturalHeight,
      IK: x0 => x0.ctrlKey,
      J: (exn) => {
        if (exn instanceof Error) {
          return exn.stack;
        } else {
          return null;
        }
      },
      JB: (x0,x1) => x0.warn(x1),
      JC: x0 => new Int16Array(x0),
      JD: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      JE: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      JF: (x0,x1) => { x0.noValidate = x1 },
      JG: x0 => x0.offsetX,
      JH: x0 => x0.button,
      JI: (d, precision) => d.toPrecision(precision),
      JJ: x0 => x0.naturalWidth,
      JK: x0 => x0.isComposing,
      K: o => String(o),
      KB: x0 => x0.console,
      KC: Function.prototype.call.bind(DataView.prototype.getInt16),
      KD: x0 => x0.style,
      KE: (x0,x1) => x0.removeProperty(x1),
      KF: (x0,x1) => x0.removeAttribute(x1),
      KG: x0 => x0.type,
      KH: x0 => x0.innerHeight,
      KI: x0 => x0.deref(),
      KJ: x0 => x0.src,
      KK: x0 => x0.code,
      L: o => o === undefined,
      LB: (s, p, i) => s.lastIndexOf(p, i),
      LC: Function.prototype.call.bind(DataView.prototype.setInt16),
      LD: (x0,x1) => x0.createElement(x1),
      LE: (x0,x1) => x0.appendChild(x1),
      LF: x0 => x0.isConnected,
      LG: x0 => x0.hasFocus(),
      LH: x0 => x0.height,
      LI: x0 => new WeakRef(x0),
      LJ: (x0,x1) => { x0.pointerEvents = x1 },
      LK: x0 => x0.repeat,
      M: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      MB: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      MC: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      MD: x0 => x0.body,
      ME: x0 => x0.tagName,
      MF: x0 => x0.click(),
      MG: x0 => x0.shiftKey,
      MH: x0 => x0.clientHeight,
      MI: () => globalThis.WeakRef,
      MJ: (x0,x1) => { x0.height = x1 },
      MK: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      N: (x0,x1) => x0.didCreateEngineInitializer(x1),
      NB: (a, i) => a.push(i),
      NC: o => o instanceof Int16Array,
      ND: x0 => x0.remove(),
      NE: x0 => x0.debugShowSemanticsNodes,
      NF: (x0,x1) => x0.getElementsByClassName(x1),
      NG: x0 => x0.visibilityState,
      NH: x0 => x0.innerWidth,
      NI: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      NJ: (x0,x1) => { x0.width = x1 },
      NK: x0 => x0.length,
      O: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      OB: () => [],
      OC: x0 => new Uint8ClampedArray(x0),
      OD: (x0,x1) => x0.getPropertyValue(x1),
      OE: (o, c) => o instanceof c,
      OF: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      OG: x0 => x0.disconnect(),
      OH: x0 => x0.width,
      OI: (a, s, e) => a.slice(s, e),
      OJ: x0 => x0.style,
      OK: x0 => x0.getReader(),
      P: (wasmFunction,f) => finalizeWrapper(f, function() { return wasmFunction(f,arguments.length) }),
      PB: (o, p, v) => o[p] = v,
      PC: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      PD: (x0,x1) => { x0.id = x1 },
      PE: x0 => x0.vendor,
      PF: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      PG: x0 => new Intl.Locale(x0),
      PH: x0 => x0.clientWidth,
      PI: x0 => x0.decode(),
      PJ: (x0,x1,x2) => x0.insertBefore(x1,x2),
      PK: x0 => x0.value,
      Q: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      QB: () => ({}),
      QC: o => o instanceof Uint8ClampedArray,
      QD: s => s.trimLeft(),
      QE: (x0,x1) => x0.createTextNode(x1),
      QF: (x0,x1) => x0.contains(x1),
      QG: x0 => x0.region,
      QH: (x0,x1) => x0.push(x1),
      QI: (x0,x1) => { x0.src = x1 },
      QJ: x0 => x0.id,
      QK: x0 => x0.done,
      R: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      RB: (o, p) => o[p],
      RC: x0 => new Uint8Array(x0),
      RD: (o, p, r) => o.replaceAll(p, () => r),
      RE: (x0,x1) => { x0.nonce = x1 },
      RF: (s) => +s,
      RG: x0 => x0.script,
      RH: () => globalThis.window.__flutterState,
      RI: (x0,x1) => x0.createElement(x1),
      RJ: x0 => x0.offsetHeight,
      RK: x0 => x0.read(),
      S: x0 => new Promise(x0),
      SB: x0 => new ArrayBuffer(x0),
      SC: x0 => new Int8Array(x0),
      SD: (x0,x1) => x0[x1],
      SE: x0 => x0.nonce,
      SF: x0 => x0.target,
      SG: x0 => x0.language,
      SH: () => new Array(),
      SI: () => globalThis.document,
      SJ: x0 => x0.offsetWidth,
      SK: x0 => x0.body,
      T: (x0,x1,x2) => x0.call(x1,x2),
      TB: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      TC: Function.prototype.call.bind(DataView.prototype.getInt8),
      TD: x0 => x0.length,
      TE: (x0,x1) => x0.attachShadow(x1),
      TF: (x0,x1) => x0.dispatchEvent(x1),
      TG: x0 => x0.languages,
      TH: x0 => { globalThis.window.__flutterState = x0 },
      TI: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      TJ: x0 => x0.stopPropagation(),
      TK: x0 => x0.assetBase,
      U: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      UB: (x0,x1,x2) => new DataView(x0,x1,x2),
      UC: Function.prototype.call.bind(DataView.prototype.setInt8),
      UD: (x0,x1) => x0.exec(x1),
      UE: x0 => x0.preventDefault(),
      UF: (x0,x1) => x0.createEvent(x1),
      UG: (x0,x1) => x0.observe(x1),
      UH: (x0,x1) => x0.removeChild(x1),
      UI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      UJ: x0 => x0.disabled,
      UK: x0 => x0.renderer,
      V: x0 => new Array(x0),
      VB: (t, s) => t.set(s),
      VC: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      VD: s => s.trim(),
      VE: (x0,x1) => x0.contains(x1),
      VF: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      VG: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      VH: x0 => x0.firstChild,
      VI: (x0,x1,x2) => x0.addEventListener(x1,x2),
      VJ: (x0,x1) => { x0.min = x1 },
      VK: x0 => x0.loader,
      W: o => [o],
      WB: Function.prototype.call.bind(DataView.prototype.setUint8),
      WC: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Int8Array) return 1;
        return 2;
      },
      WD: (x0,x1) => x0.error(x1),
      WE: (x0,x1) => x0.focus(x1),
      WF: () => globalThis.window,
      WG: x0 => new ResizeObserver(x0),
      WH: x0 => x0.viewConstraints,
      WI: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      WJ: (x0,x1) => { x0.max = x1 },
      WK: () => globalThis._flutter,
      X: (o0, o1) => [o0, o1],
      XB: Function.prototype.call.bind(DataView.prototype.getUint8),
      XC: b => !!b,
      XD: () => globalThis.console,
      XE: (x0,x1) => x0.closest(x1),
      XF: x0 => x0.readText(),
      XG: x0 => globalThis.parseFloat(x0),
      XH: x0 => x0.hostElement,
      XI: x0 => x0.send(),
      XJ: (x0,x1) => { x0.disabled = x1 },
      Y: (o0, o1, o2) => [o0, o1, o2],
      YB: o => o.byteOffset,
      YC: x0 => x0.history,
      YD: (x0,x1) => x0.requestAnimationFrame(x1),
      YE: (x0,x1) => x0.getAttribute(x1),
      YF: x0 => x0.clipboard,
      YG: (x0,x1) => x0.getComputedStyle(x1),
      YH: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      YI: (x0,x1) => x0.revokeObjectURL(x1),
      YJ: (x0,x1) => { x0.scrollLeft = x1 },
      Z: (o0, o1, o2, o3) => [o0, o1, o2, o3],
      ZB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof ArrayBuffer) return 1;
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
          return 2;
        }
        return 3;
      },
      ZC: x0 => x0.search,
      ZD: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      ZE: x0 => x0.activeElement,
      ZF: (x0,x1) => x0.writeText(x1),
      ZG: x0 => x0.documentElement,
      ZH: x0 => ({runApp: x0}),
      ZI: x0 => x0.URL,
      ZJ: (x0,x1) => { x0.spellcheck = x1 },
      a: (x0,x1,x2) => { x0[x1] = x2 },
      aB: (b, o) => new DataView(b, o),
      aC: o => {
        if (o === null || o === undefined) return 0;
        if (typeof(o) === 'string') return 1;
        return 2;
      },
      aD: x0 => x0.now(),
      aE: (x0,x1) => x0.add(x1),
      aF: x0 => x0.unlock(),
      aG: x0 => x0.computedStyleMap(),
      aH: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      aI: (x0,x1) => { x0.src = x1 },
      aJ: (x0,x1) => { x0.disabled = x1 },
      b: o => o,
      bB: (b, o, l) => new DataView(b, o, l),
      bC: x0 => x0.location,
      bD: x0 => x0.performance,
      bE: x0 => x0.classList,
      bF: (x0,x1) => x0.lock(x1),
      bG: (x0,x1) => x0.get(x1),
      bH: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      bI: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      bJ: (x0,x1,x2,x3) => x0.putImageData(x1,x2,x3),
      c: (o, p) => o[p],
      cB: o => o.buffer,
      cC: x0 => x0.pathname,
      cD: x0 => x0.clearMarks(),
      cE: x0 => x0.data,
      cF: x0 => x0.orientation,
      cG: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      cH: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      cI: x0 => x0.naturalHeight,
      cJ: x0 => x0.arrayBuffer(),
      d: () => globalThis,
      dB: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      dC: (x0,x1) => x0.go(x1),
      dD: x0 => x0.clearMeasures(),
      dE: x0 => x0.scrollTop,
      dF: (x0,x1) => x0.querySelector(x1),
      dG: x0 => x0.matches,
      dH: () => Date.now(),
      dI: x0 => x0.naturalWidth,
      dJ: (x0,x1) => x0.transferFromImageBitmap(x1),
      e: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      eB: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      eC: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      eD: (x0,x1) => x0.parse(x1),
      eE: (handle) => clearTimeout(handle),
      eF: (x0,x1) => { x0.content = x1 },
      eG: (x0,x1) => x0.matchMedia(x1),
      eH: () => typeof dartUseDateNowForTicks !== "undefined",
      eI: x0 => x0.decode(),
      eJ: x0 => x0.height,
      f: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint8Array) return 1;
        return 2;
      },
      fC: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      fD: (x0,x1,x2) => x0.mark(x1,x2),
      fE: (x0,x1) => { x0.scrollTop = x1 },
      fF: x0 => x0.head,
      fG: x0 => x0.matches,
      fH: () => 1000 * performance.now(),
      fI: (x0,x1) => { x0.decoding = x1 },
      fJ: x0 => x0.width,
      g: (x0,x1) => ({addView: x0,removeView: x1}),
      gB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      gC: o => Object.keys(o),
      gD: (x0,x1,x2,x3) => x0.measure(x1,x2,x3),
      gE: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      gF: (x0,x1) => { x0.name = x1 },
      gG: x0 => x0.multiViewEnabled,
      gH: (map, o, v) => map.set(o, v),
      gI: (x0,x1) => { x0.crossOrigin = x1 },
      gJ: x0 => x0.rasterEndMilliseconds,
      h: (l, r) => l === r,
      hB: x0 => new Float64Array(x0),
      hC: f => f.dartFunction,
      hD: (o) => {
        const typeofValue = typeof o;
        return (typeofValue === 'object') ||
            typeofValue === 'function';
      },
      hE: (x0,x1) => { x0.value = x1 },
      hF: (x0,x1) => { x0.title = x1 },
      hG: () => globalThis.window.flutterWebRenderer,
      hH: (map, o) => map.get(o),
      hI: (x0,x1) => x0.createObjectURL(x1),
      hJ: x0 => x0.rasterStartMilliseconds,
      i: (a, i) => a[i],
      iB: Function.prototype.call.bind(DataView.prototype.setFloat64),
      iC: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      iD: () => globalThis.JSON,
      iE: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      iF: () => globalThis.document,
      iG: () => globalThis.window.flutterConfiguration,
      iH: () => new WeakMap(),
      iI: x0 => new Blob(x0),
      iJ: x0 => x0.imageBitmaps,
      j: a => a.length,
      jB: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      jC: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      jD: x0 => x0.clearMarks,
      jE: (x0,x1) => { x0.value = x1 },
      jF: (x0,x1) => x0.vibrate(x1),
      jG: x0 => x0.timeStamp,
      jH: x0 => new Uint8Array(x0),
      jI: (x0,x1) => new Blob(x0,x1),
      jJ: (x0,x1) => { x0.height = x1 },
      k: o => o instanceof Array,
      kB: Function.prototype.call.bind(DataView.prototype.getFloat64),
      kC: (wasmFunction,f) => finalizeWrapper(f, function(x0,x1) { return wasmFunction(f,arguments.length,x0,x1) }),
      kD: x0 => x0.clearMeasures,
      kE: x0 => x0.relatedTarget,
      kF: (o, p) => p in o,
      kG: (x0,x1) => x0.hasAttribute(x1),
      kH: (x0,x1,x2) => x0.slice(x1,x2),
      kI: (x0,x1,x2) => x0.set(x1,x2),
      kJ: (x0,x1) => { x0.width = x1 },
      l: (string, token) => string.split(token),
      lB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float64Array) return 1;
        return 2;
      },
      lC: (p, s, f) => p.then(s, (e) => f(e, e === undefined)),
      lD: x0 => x0.mark,
      lE: x0 => x0.index,
      lF: x0 => x0.arrayBuffer(),
      lG: x0 => x0.buttons,
      lH: (x0,x1) => x0.decode(x1),
      lI: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      lJ: x0 => x0.convertToBlob(),
      m: (string, times) => string.repeat(times),
      mB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      mC: (o, i) => o[i],
      mD: x0 => x0.measure,
      mE: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      mF: x0 => x0.status,
      mG: x0 => x0.ctrlKey,
      mH: (x0,x1) => x0.adoptText(x1),
      mI: x0 => new window.ImageDecoder(x0),
      mJ: (x0,x1,x2) => new ImageData(x0,x1,x2),
      n: (decoder, codeUnits) => decoder.decode(codeUnits),
      nB: x0 => new Float32Array(x0),
      nC: o => o.length,
      nD: () => globalThis.performance,
      nE: x0 => x0.value,
      nF: (x0,x1) => x0.fetch(x1),
      nG: x0 => x0.y,
      nH: x0 => x0.first(),
      nI: x0 => x0.name,
      nJ: (x0,x1) => x0.getContext(x1),
      o: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      oB: Function.prototype.call.bind(DataView.prototype.getFloat32),
      oC: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      oD: (x0,x1) => x0.unregister(x1),
      oE: x0 => x0.selectionDirection,
      oF: x0 => x0.content,
      oG: x0 => x0.x,
      oH: x0 => x0.next(),
      oI: x0 => x0.repetitionCount,
      oJ: (x0,x1) => new OffscreenCanvas(x0,x1),
      p: () => new TextDecoder("utf-8", {fatal: true}),
      pB: Function.prototype.call.bind(DataView.prototype.setFloat32),
      pC: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        // Feature check for `SharedArrayBuffer` before doing a type-check.
        if (globalThis.SharedArrayBuffer !== undefined &&
            o instanceof SharedArrayBuffer) {
            return 17;
        }
        if (o instanceof Promise) return 18;
        return 19;
      },
      pD: () => globalThis.window.FinalizationRegistry,
      pE: x0 => x0.selectionStart,
      pF: x0 => x0.document,
      pG: x0 => x0.offsetTop,
      pH: x0 => x0.current(),
      pI: x0 => x0.frameCount,
      pJ: x0 => x0.allocationSize(),
      q: () => new TextDecoder("utf-8", {fatal: false}),
      qB: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      qC: x0 => x0.state,
      qD: (wasmFunction,f) => finalizeWrapper(f, function(x0) { return wasmFunction(f,arguments.length,x0) }),
      qE: x0 => x0.selectionEnd,
      qF: x0 => x0.language,
      qG: x0 => x0.scrollLeft,
      qH: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      qI: x0 => x0.selectedTrack,
      qJ: (x0,x1) => x0.copyTo(x1),
      r: s => s.trimRight(),
      rB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Float32Array) return 1;
        return 2;
      },
      rC: (x0,x1,x2) => x0.addEventListener(x1,x2),
      rD: x0 => new window.FinalizationRegistry(x0),
      rE: x0 => x0.value,
      rF: (x0,x1,x2,x3) => x0.register(x1,x2,x3),
      rG: x0 => x0.offsetLeft,
      rH: x0 => x0.v8BreakIterator,
      rI: x0 => x0.completed,
      rJ: (x0,x1) => { x0.height = x1 },
      s: Object.is,
      sB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      sC: x0 => x0.hash,
      sD: (d, digits) => d.toFixed(digits),
      sE: x0 => x0.selectionDirection,
      sF: (x0,x1) => x0.prepend(x1),
      sG: x0 => x0.offsetParent,
      sH: () => globalThis.Intl,
      sI: x0 => x0.ready,
      sJ: (x0,x1) => { x0.width = x1 },
      t: s => s.toUpperCase(),
      tB: x0 => new Uint32Array(x0),
      tC: x0 => x0.state,
      tD: x0 => x0.pop(),
      tE: x0 => x0.selectionStart,
      tF: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      tG: x0 => x0.deltaMode,
      tH: (x0,x1) => x0.segment(x1),
      tI: x0 => x0.tracks,
      tJ: (x0,x1) => x0.toDataURL(x1),
      u: (a, s) => a.join(s),
      uB: Function.prototype.call.bind(DataView.prototype.getUint32),
      uC: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      uD: (x0,x1) => { x0.lastIndex = x1 },
      uE: x0 => x0.selectionEnd,
      uF: (x0,x1) => x0.querySelector(x1),
      uG: x0 => x0.deltaY,
      uH: x0 => x0.index,
      uI: x0 => x0.close(),
      uJ: (x0,x1,x2,x3) => x0.drawImage(x1,x2,x3),
      v: x0 => x0.random(),
      vB: Function.prototype.call.bind(DataView.prototype.setUint32),
      vC: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      vD: x0 => x0.dotAll,
      vE: x0 => x0.keyCode,
      vF: (x0,x1) => x0.querySelectorAll(x1),
      vG: x0 => x0.deltaX,
      vH: x0 => x0.next(),
      vI: (x0,x1) => ({frameIndex: x0,completeFramesOnly: x1}),
      vJ: (x0,x1) => x0.getContext(x1),
      w: o => o,
      wB: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      wC: (x0,x1) => x0.append(x1),
      wD: x0 => x0.unicode,
      wE: (x0,x1) => x0.scrollIntoView(x1),
      wF: x0 => x0.tabIndex,
      wG: x0 => x0.wheelDeltaY,
      wH: x0 => x0.value,
      wI: (x0,x1) => x0.decode(x1),
      wJ: x0 => x0.format,
      x: o => {
        if (o === undefined || o === null) return 0;
        if (typeof o === 'number') return 1;
        return 2;
      },
      xB: o => {
        if (o === null || o === undefined) return 0;
        if (o instanceof Uint32Array) return 1;
        return 2;
      },
      xC: (x0,x1) => { x0.textContent = x1 },
      xD: x0 => x0.ignoreCase,
      xE: x0 => x0.parent,
      xF: x0 => x0.parentNode,
      xG: x0 => x0.wheelDeltaX,
      xH: x0 => x0.done,
      xI: x0 => x0.displayHeight,
      xJ: x0 => x0.debugSkipFontRetryDelay,
      y: () => globalThis.Math,
      yB: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      yC: x0 => x0.parentElement,
      yD: x0 => x0.multiline,
      yE: (x0,x1) => x0.replaceWith(x1),
      yF: x0 => x0.clientY,
      yG: x0 => x0.key,
      yH: (o, m, a) => o[m].apply(o, a),
      yI: x0 => x0.displayWidth,
      yJ: x0 => x0.fontFallbackBaseUrl,
      z: (x0,x1) => x0.test(x1),
      zB: x0 => new Int32Array(x0),
      zC: (x0,x1) => x0.querySelectorAll(x1),
      zD: x0 => x0.scale,
      zE: (x0,x1) => { x0.type = x1 },
      zF: x0 => x0.clientX,
      zG: x0 => x0.identifier,
      zH: x0 => x0.iterator,
      zI: x0 => x0.duration,
      zJ: x0 => x0.canvasKitMaximumSurfaces,

    };

    const baseImports = {
      dart2wasm: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
      WebAssembly: {
        JSTag: WebAssembly.JSTag,
      },
      "": new Proxy({}, { get(_, prop) { return prop; } }),

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s === '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
      "test": (s) => typeof s == "string",
    };


    

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
