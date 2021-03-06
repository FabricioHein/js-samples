(function(exports) {
  "use strict";

  var commonjsGlobal =
    typeof globalThis !== "undefined"
      ? globalThis
      : typeof window !== "undefined"
      ? window
      : typeof global !== "undefined"
      ? global
      : typeof self !== "undefined"
      ? self
      : {};

  function createCommonjsModule(fn, module) {
    return (
      (module = { exports: {} }), fn(module, module.exports), module.exports
    );
  }

  var check = function(it) {
    return it && it.Math == Math && it;
  }; // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028

  var global_1 = // eslint-disable-next-line no-undef
    check(typeof globalThis == "object" && globalThis) ||
    check(typeof window == "object" && window) ||
    check(typeof self == "object" && self) ||
    check(typeof commonjsGlobal == "object" && commonjsGlobal) || // eslint-disable-next-line no-new-func
    Function("return this")();

  var fails = function(exec) {
    try {
      return !!exec();
    } catch (error) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty

  var descriptors = !fails(function() {
    return (
      Object.defineProperty({}, 1, {
        get: function() {
          return 7;
        }
      })[1] != 7
    );
  });

  var isObject = function(it) {
    return typeof it === "object" ? it !== null : typeof it === "function";
  };

  var document$1 = global_1.document; // typeof document.createElement is 'object' in old IE

  var EXISTS = isObject(document$1) && isObject(document$1.createElement);

  var documentCreateElement = function(it) {
    return EXISTS ? document$1.createElement(it) : {};
  };

  // Thank's IE8 for his funny defineProperty

  var ie8DomDefine =
    !descriptors &&
    !fails(function() {
      return (
        Object.defineProperty(documentCreateElement("div"), "a", {
          get: function() {
            return 7;
          }
        }).a != 7
      );
    });

  var anObject = function(it) {
    if (!isObject(it)) {
      throw TypeError(String(it) + " is not an object");
    }

    return it;
  };

  // `ToPrimitive` abstract operation
  // https://tc39.github.io/ecma262/#sec-toprimitive
  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string

  var toPrimitive = function(input, PREFERRED_STRING) {
    if (!isObject(input)) return input;
    var fn, val;
    if (
      PREFERRED_STRING &&
      typeof (fn = input.toString) == "function" &&
      !isObject((val = fn.call(input)))
    )
      return val;
    if (
      typeof (fn = input.valueOf) == "function" &&
      !isObject((val = fn.call(input)))
    )
      return val;
    if (
      !PREFERRED_STRING &&
      typeof (fn = input.toString) == "function" &&
      !isObject((val = fn.call(input)))
    )
      return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperty

  var f = descriptors
    ? nativeDefineProperty
    : function defineProperty(O, P, Attributes) {
        anObject(O);
        P = toPrimitive(P, true);
        anObject(Attributes);
        if (ie8DomDefine)
          try {
            return nativeDefineProperty(O, P, Attributes);
          } catch (error) {
            /* empty */
          }
        if ("get" in Attributes || "set" in Attributes)
          throw TypeError("Accessors not supported");
        if ("value" in Attributes) O[P] = Attributes.value;
        return O;
      };

  var objectDefineProperty = {
    f: f
  };

  var createPropertyDescriptor = function(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var createNonEnumerableProperty = descriptors
    ? function(object, key, value) {
        return objectDefineProperty.f(
          object,
          key,
          createPropertyDescriptor(1, value)
        );
      }
    : function(object, key, value) {
        object[key] = value;
        return object;
      };

  var setGlobal = function(key, value) {
    try {
      createNonEnumerableProperty(global_1, key, value);
    } catch (error) {
      global_1[key] = value;
    }

    return value;
  };

  var SHARED = "__core-js_shared__";
  var store = global_1[SHARED] || setGlobal(SHARED, {});
  var sharedStore = store;

  var shared = createCommonjsModule(function(module) {
    (module.exports = function(key, value) {
      return (
        sharedStore[key] ||
        (sharedStore[key] = value !== undefined ? value : {})
      );
    })("versions", []).push({
      version: "3.6.5",
      mode: "global",
      copyright: "© 2020 Denis Pushkarev (zloirock.ru)"
    });
  });

  var hasOwnProperty = {}.hasOwnProperty;

  var has = function(it, key) {
    return hasOwnProperty.call(it, key);
  };

  var id = 0;
  var postfix = Math.random();

  var uid = function(key) {
    return (
      "Symbol(" +
      String(key === undefined ? "" : key) +
      ")_" +
      (++id + postfix).toString(36)
    );
  };

  var nativeSymbol =
    !!Object.getOwnPropertySymbols &&
    !fails(function() {
      // Chrome 38 Symbol has incorrect toString conversion
      // eslint-disable-next-line no-undef
      return !String(Symbol());
    });

  var useSymbolAsUid =
    nativeSymbol && // eslint-disable-next-line no-undef
    !Symbol.sham && // eslint-disable-next-line no-undef
    typeof Symbol.iterator == "symbol";

  var WellKnownSymbolsStore = shared("wks");
  var Symbol$1 = global_1.Symbol;
  var createWellKnownSymbol = useSymbolAsUid
    ? Symbol$1
    : (Symbol$1 && Symbol$1.withoutSetter) || uid;

  var wellKnownSymbol = function(name) {
    if (!has(WellKnownSymbolsStore, name)) {
      if (nativeSymbol && has(Symbol$1, name))
        WellKnownSymbolsStore[name] = Symbol$1[name];
      else
        WellKnownSymbolsStore[name] = createWellKnownSymbol("Symbol." + name);
    }

    return WellKnownSymbolsStore[name];
  };

  var TO_STRING_TAG = wellKnownSymbol("toStringTag");
  var test = {};
  test[TO_STRING_TAG] = "z";
  var toStringTagSupport = String(test) === "[object z]";

  var functionToString = Function.toString; // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper

  if (typeof sharedStore.inspectSource != "function") {
    sharedStore.inspectSource = function(it) {
      return functionToString.call(it);
    };
  }

  var inspectSource = sharedStore.inspectSource;

  var WeakMap = global_1.WeakMap;
  var nativeWeakMap =
    typeof WeakMap === "function" && /native code/.test(inspectSource(WeakMap));

  var keys = shared("keys");

  var sharedKey = function(key) {
    return keys[key] || (keys[key] = uid(key));
  };

  var WeakMap$1 = global_1.WeakMap;
  var set, get, has$1;

  var enforce = function(it) {
    return has$1(it) ? get(it) : set(it, {});
  };

  var getterFor = function(TYPE) {
    return function(it) {
      var state;

      if (!isObject(it) || (state = get(it)).type !== TYPE) {
        throw TypeError("Incompatible receiver, " + TYPE + " required");
      }

      return state;
    };
  };

  if (nativeWeakMap) {
    var store$1 = new WeakMap$1();
    var wmget = store$1.get;
    var wmhas = store$1.has;
    var wmset = store$1.set;

    set = function(it, metadata) {
      wmset.call(store$1, it, metadata);
      return metadata;
    };

    get = function(it) {
      return wmget.call(store$1, it) || {};
    };

    has$1 = function(it) {
      return wmhas.call(store$1, it);
    };
  } else {
    var STATE = sharedKey("state");

    set = function(it, metadata) {
      createNonEnumerableProperty(it, STATE, metadata);
      return metadata;
    };

    get = function(it) {
      return has(it, STATE) ? it[STATE] : {};
    };

    has$1 = function(it) {
      return has(it, STATE);
    };
  }

  var internalState = {
    set: set,
    get: get,
    has: has$1,
    enforce: enforce,
    getterFor: getterFor
  };

  var redefine = createCommonjsModule(function(module) {
    var getInternalState = internalState.get;
    var enforceInternalState = internalState.enforce;
    var TEMPLATE = String(String).split("String");
    (module.exports = function(O, key, value, options) {
      var unsafe = options ? !!options.unsafe : false;
      var simple = options ? !!options.enumerable : false;
      var noTargetGet = options ? !!options.noTargetGet : false;

      if (typeof value == "function") {
        if (typeof key == "string" && !has(value, "name"))
          createNonEnumerableProperty(value, "name", key);
        enforceInternalState(value).source = TEMPLATE.join(
          typeof key == "string" ? key : ""
        );
      }

      if (O === global_1) {
        if (simple) O[key] = value;
        else setGlobal(key, value);
        return;
      } else if (!unsafe) {
        delete O[key];
      } else if (!noTargetGet && O[key]) {
        simple = true;
      }

      if (simple) O[key] = value;
      else createNonEnumerableProperty(O, key, value); // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
    })(Function.prototype, "toString", function toString() {
      return (
        (typeof this == "function" && getInternalState(this).source) ||
        inspectSource(this)
      );
    });
  });

  var toString = {}.toString;

  var classofRaw = function(it) {
    return toString.call(it).slice(8, -1);
  };

  var TO_STRING_TAG$1 = wellKnownSymbol("toStringTag"); // ES3 wrong here

  var CORRECT_ARGUMENTS =
    classofRaw(
      (function() {
        return arguments;
      })()
    ) == "Arguments"; // fallback for IE11 Script Access Denied error

  var tryGet = function(it, key) {
    try {
      return it[key];
    } catch (error) {
      /* empty */
    }
  }; // getting tag from ES6+ `Object.prototype.toString`

  var classof = toStringTagSupport
    ? classofRaw
    : function(it) {
        var O, tag, result;
        return it === undefined
          ? "Undefined"
          : it === null
          ? "Null" // @@toStringTag case
          : typeof (tag = tryGet((O = Object(it)), TO_STRING_TAG$1)) == "string"
          ? tag // builtinTag case
          : CORRECT_ARGUMENTS
          ? classofRaw(O) // ES3 arguments fallback
          : (result = classofRaw(O)) == "Object" &&
            typeof O.callee == "function"
          ? "Arguments"
          : result;
      };

  // `Object.prototype.toString` method implementation
  // https://tc39.github.io/ecma262/#sec-object.prototype.tostring

  var objectToString = toStringTagSupport
    ? {}.toString
    : function toString() {
        return "[object " + classof(this) + "]";
      };

  // `Object.prototype.toString` method
  // https://tc39.github.io/ecma262/#sec-object.prototype.tostring

  if (!toStringTagSupport) {
    redefine(Object.prototype, "toString", objectToString, {
      unsafe: true
    });
  }

  // `RegExp.prototype.flags` getter implementation
  // https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags

  var regexpFlags = function() {
    var that = anObject(this);
    var result = "";
    if (that.global) result += "g";
    if (that.ignoreCase) result += "i";
    if (that.multiline) result += "m";
    if (that.dotAll) result += "s";
    if (that.unicode) result += "u";
    if (that.sticky) result += "y";
    return result;
  };

  var TO_STRING = "toString";
  var RegExpPrototype = RegExp.prototype;
  var nativeToString = RegExpPrototype[TO_STRING];
  var NOT_GENERIC = fails(function() {
    return (
      nativeToString.call({
        source: "a",
        flags: "b"
      }) != "/a/b"
    );
  }); // FF44- RegExp#toString has a wrong name

  var INCORRECT_NAME = nativeToString.name != TO_STRING; // `RegExp.prototype.toString` method
  // https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring

  if (NOT_GENERIC || INCORRECT_NAME) {
    redefine(
      RegExp.prototype,
      TO_STRING,
      function toString() {
        var R = anObject(this);
        var p = String(R.source);
        var rf = R.flags;
        var f = String(
          rf === undefined &&
            R instanceof RegExp &&
            !("flags" in RegExpPrototype)
            ? regexpFlags.call(R)
            : rf
        );
        return "/" + p + "/" + f;
      },
      {
        unsafe: true
      }
    );
  }

  /*
   * Copyright 2019 Google LLC. All Rights Reserved.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
  // [START maps_geometry_headings]
  // This example requires the Geometry library. Include the libraries=geometry
  // parameter when you first load the API. For example:
  // <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry">
  var marker2;
  var geodesicPoly;

  function initMap() {
    var map = new google.maps.Map(document.getElementById("map"), {
      zoom: 4,
      center: {
        lat: 34,
        lng: -40.605
      }
    });
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(
      document.getElementById("info")
    );
    exports.marker1 = new google.maps.Marker({
      map: map,
      draggable: true,
      position: {
        lat: 40.714,
        lng: -74.006
      }
    });
    marker2 = new google.maps.Marker({
      map: map,
      draggable: true,
      position: {
        lat: 48.857,
        lng: 2.352
      }
    });
    var bounds = new google.maps.LatLngBounds(
      exports.marker1.getPosition(),
      marker2.getPosition()
    );
    map.fitBounds(bounds);
    google.maps.event.addListener(exports.marker1, "position_changed", update);
    google.maps.event.addListener(marker2, "position_changed", update);
    exports.poly = new google.maps.Polyline({
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: map
    });
    geodesicPoly = new google.maps.Polyline({
      strokeColor: "#CC0099",
      strokeOpacity: 1.0,
      strokeWeight: 3,
      geodesic: true,
      map: map
    });
    update();
  }

  function update() {
    var path = [exports.marker1.getPosition(), marker2.getPosition()];
    exports.poly.setPath(path);
    geodesicPoly.setPath(path);
    var heading = google.maps.geometry.spherical.computeHeading(
      path[0],
      path[1]
    );
    document.getElementById("heading").value = heading;
    document.getElementById("origin").value = path[0].toString();
    document.getElementById("destination").value = path[1].toString();
  } // [END maps_geometry_headings]

  exports.initMap = initMap;
  exports.update = update;
})((this.window = this.window || {}));
