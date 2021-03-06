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

  var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
  var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // Nashorn ~ JDK8 bug

  var NASHORN_BUG =
    getOwnPropertyDescriptor &&
    !nativePropertyIsEnumerable.call(
      {
        1: 2
      },
      1
    ); // `Object.prototype.propertyIsEnumerable` method implementation
  // https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable

  var f = NASHORN_BUG
    ? function propertyIsEnumerable(V) {
        var descriptor = getOwnPropertyDescriptor(this, V);
        return !!descriptor && descriptor.enumerable;
      }
    : nativePropertyIsEnumerable;

  var objectPropertyIsEnumerable = {
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

  var toString = {}.toString;

  var classofRaw = function(it) {
    return toString.call(it).slice(8, -1);
  };

  var split = "".split; // fallback for non-array-like ES3 and non-enumerable old V8 strings

  var indexedObject = fails(function() {
    // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
    // eslint-disable-next-line no-prototype-builtins
    return !Object("z").propertyIsEnumerable(0);
  })
    ? function(it) {
        return classofRaw(it) == "String" ? split.call(it, "") : Object(it);
      }
    : Object;

  // `RequireObjectCoercible` abstract operation
  // https://tc39.github.io/ecma262/#sec-requireobjectcoercible
  var requireObjectCoercible = function(it) {
    if (it == undefined) throw TypeError("Can't call method on " + it);
    return it;
  };

  // toObject with fallback for non-array-like ES3 strings

  var toIndexedObject = function(it) {
    return indexedObject(requireObjectCoercible(it));
  };

  var isObject = function(it) {
    return typeof it === "object" ? it !== null : typeof it === "function";
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

  var hasOwnProperty = {}.hasOwnProperty;

  var has = function(it, key) {
    return hasOwnProperty.call(it, key);
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

  var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor; // `Object.getOwnPropertyDescriptor` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor

  var f$1 = descriptors
    ? nativeGetOwnPropertyDescriptor
    : function getOwnPropertyDescriptor(O, P) {
        O = toIndexedObject(O);
        P = toPrimitive(P, true);
        if (ie8DomDefine)
          try {
            return nativeGetOwnPropertyDescriptor(O, P);
          } catch (error) {
            /* empty */
          }
        if (has(O, P))
          return createPropertyDescriptor(
            !objectPropertyIsEnumerable.f.call(O, P),
            O[P]
          );
      };

  var objectGetOwnPropertyDescriptor = {
    f: f$1
  };

  var anObject = function(it) {
    if (!isObject(it)) {
      throw TypeError(String(it) + " is not an object");
    }

    return it;
  };

  var nativeDefineProperty = Object.defineProperty; // `Object.defineProperty` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperty

  var f$2 = descriptors
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
    f: f$2
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

  var keys = shared("keys");

  var sharedKey = function(key) {
    return keys[key] || (keys[key] = uid(key));
  };

  var hiddenKeys = {};

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
    hiddenKeys[STATE] = true;

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

  var path = global_1;

  var aFunction = function(variable) {
    return typeof variable == "function" ? variable : undefined;
  };

  var getBuiltIn = function(namespace, method) {
    return arguments.length < 2
      ? aFunction(path[namespace]) || aFunction(global_1[namespace])
      : (path[namespace] && path[namespace][method]) ||
          (global_1[namespace] && global_1[namespace][method]);
  };

  var ceil = Math.ceil;
  var floor = Math.floor; // `ToInteger` abstract operation
  // https://tc39.github.io/ecma262/#sec-tointeger

  var toInteger = function(argument) {
    return isNaN((argument = +argument))
      ? 0
      : (argument > 0 ? floor : ceil)(argument);
  };

  var min = Math.min; // `ToLength` abstract operation
  // https://tc39.github.io/ecma262/#sec-tolength

  var toLength = function(argument) {
    return argument > 0 ? min(toInteger(argument), 0x1fffffffffffff) : 0; // 2 ** 53 - 1 == 9007199254740991
  };

  var max = Math.max;
  var min$1 = Math.min; // Helper for a popular repeating case of the spec:
  // Let integer be ? ToInteger(index).
  // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).

  var toAbsoluteIndex = function(index, length) {
    var integer = toInteger(index);
    return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
  };

  // `Array.prototype.{ indexOf, includes }` methods implementation

  var createMethod = function(IS_INCLUDES) {
    return function($this, el, fromIndex) {
      var O = toIndexedObject($this);
      var length = toLength(O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value; // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare

      if (IS_INCLUDES && el != el)
        while (length > index) {
          value = O[index++]; // eslint-disable-next-line no-self-compare

          if (value != value) return true; // Array#indexOf ignores holes, Array#includes - not
        }
      else
        for (; length > index; index++) {
          if ((IS_INCLUDES || index in O) && O[index] === el)
            return IS_INCLUDES || index || 0;
        }
      return !IS_INCLUDES && -1;
    };
  };

  var arrayIncludes = {
    // `Array.prototype.includes` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.includes
    includes: createMethod(true),
    // `Array.prototype.indexOf` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
    indexOf: createMethod(false)
  };

  var indexOf = arrayIncludes.indexOf;

  var objectKeysInternal = function(object, names) {
    var O = toIndexedObject(object);
    var i = 0;
    var result = [];
    var key;

    for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key); // Don't enum bug & hidden keys

    while (names.length > i)
      if (has(O, (key = names[i++]))) {
        ~indexOf(result, key) || result.push(key);
      }

    return result;
  };

  // IE8- don't enum bug keys
  var enumBugKeys = [
    "constructor",
    "hasOwnProperty",
    "isPrototypeOf",
    "propertyIsEnumerable",
    "toLocaleString",
    "toString",
    "valueOf"
  ];

  var hiddenKeys$1 = enumBugKeys.concat("length", "prototype"); // `Object.getOwnPropertyNames` method
  // https://tc39.github.io/ecma262/#sec-object.getownpropertynames

  var f$3 =
    Object.getOwnPropertyNames ||
    function getOwnPropertyNames(O) {
      return objectKeysInternal(O, hiddenKeys$1);
    };

  var objectGetOwnPropertyNames = {
    f: f$3
  };

  var f$4 = Object.getOwnPropertySymbols;

  var objectGetOwnPropertySymbols = {
    f: f$4
  };

  // all object keys, includes non-enumerable and symbols

  var ownKeys =
    getBuiltIn("Reflect", "ownKeys") ||
    function ownKeys(it) {
      var keys = objectGetOwnPropertyNames.f(anObject(it));
      var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
      return getOwnPropertySymbols
        ? keys.concat(getOwnPropertySymbols(it))
        : keys;
    };

  var copyConstructorProperties = function(target, source) {
    var keys = ownKeys(source);
    var defineProperty = objectDefineProperty.f;
    var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (!has(target, key))
        defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  };

  var replacement = /#|\.prototype\./;

  var isForced = function(feature, detection) {
    var value = data[normalize(feature)];
    return value == POLYFILL
      ? true
      : value == NATIVE
      ? false
      : typeof detection == "function"
      ? fails(detection)
      : !!detection;
  };

  var normalize = (isForced.normalize = function(string) {
    return String(string)
      .replace(replacement, ".")
      .toLowerCase();
  });

  var data = (isForced.data = {});
  var NATIVE = (isForced.NATIVE = "N");
  var POLYFILL = (isForced.POLYFILL = "P");
  var isForced_1 = isForced;

  var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;

  /*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/

  var _export = function(options, source) {
    var TARGET = options.target;
    var GLOBAL = options.global;
    var STATIC = options.stat;
    var FORCED, target, key, targetProperty, sourceProperty, descriptor;

    if (GLOBAL) {
      target = global_1;
    } else if (STATIC) {
      target = global_1[TARGET] || setGlobal(TARGET, {});
    } else {
      target = (global_1[TARGET] || {}).prototype;
    }

    if (target)
      for (key in source) {
        sourceProperty = source[key];

        if (options.noTargetGet) {
          descriptor = getOwnPropertyDescriptor$1(target, key);
          targetProperty = descriptor && descriptor.value;
        } else targetProperty = target[key];

        FORCED = isForced_1(
          GLOBAL ? key : TARGET + (STATIC ? "." : "#") + key,
          options.forced
        ); // contained in target

        if (!FORCED && targetProperty !== undefined) {
          if (typeof sourceProperty === typeof targetProperty) continue;
          copyConstructorProperties(sourceProperty, targetProperty);
        } // add a flag to not completely full polyfills

        if (options.sham || (targetProperty && targetProperty.sham)) {
          createNonEnumerableProperty(sourceProperty, "sham", true);
        } // extend global

        redefine(target, key, sourceProperty, options);
      }
  };

  var aFunction$1 = function(it) {
    if (typeof it != "function") {
      throw TypeError(String(it) + " is not a function");
    }

    return it;
  };

  // optional / simple context binding

  var functionBindContext = function(fn, that, length) {
    aFunction$1(fn);
    if (that === undefined) return fn;

    switch (length) {
      case 0:
        return function() {
          return fn.call(that);
        };

      case 1:
        return function(a) {
          return fn.call(that, a);
        };

      case 2:
        return function(a, b) {
          return fn.call(that, a, b);
        };

      case 3:
        return function(a, b, c) {
          return fn.call(that, a, b, c);
        };
    }

    return function() /* ...args */
    {
      return fn.apply(that, arguments);
    };
  };

  // `ToObject` abstract operation
  // https://tc39.github.io/ecma262/#sec-toobject

  var toObject = function(argument) {
    return Object(requireObjectCoercible(argument));
  };

  // `IsArray` abstract operation
  // https://tc39.github.io/ecma262/#sec-isarray

  var isArray =
    Array.isArray ||
    function isArray(arg) {
      return classofRaw(arg) == "Array";
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

  var SPECIES = wellKnownSymbol("species"); // `ArraySpeciesCreate` abstract operation
  // https://tc39.github.io/ecma262/#sec-arrayspeciescreate

  var arraySpeciesCreate = function(originalArray, length) {
    var C;

    if (isArray(originalArray)) {
      C = originalArray.constructor; // cross-realm fallback

      if (typeof C == "function" && (C === Array || isArray(C.prototype)))
        C = undefined;
      else if (isObject(C)) {
        C = C[SPECIES];
        if (C === null) C = undefined;
      }
    }

    return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
  };

  var push = [].push; // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation

  var createMethod$1 = function(TYPE) {
    var IS_MAP = TYPE == 1;
    var IS_FILTER = TYPE == 2;
    var IS_SOME = TYPE == 3;
    var IS_EVERY = TYPE == 4;
    var IS_FIND_INDEX = TYPE == 6;
    var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
    return function($this, callbackfn, that, specificCreate) {
      var O = toObject($this);
      var self = indexedObject(O);
      var boundFunction = functionBindContext(callbackfn, that, 3);
      var length = toLength(self.length);
      var index = 0;
      var create = specificCreate || arraySpeciesCreate;
      var target = IS_MAP
        ? create($this, length)
        : IS_FILTER
        ? create($this, 0)
        : undefined;
      var value, result;

      for (; length > index; index++)
        if (NO_HOLES || index in self) {
          value = self[index];
          result = boundFunction(value, index, O);

          if (TYPE) {
            if (IS_MAP) target[index] = result;
            // map
            else if (result)
              switch (TYPE) {
                case 3:
                  return true;
                // some

                case 5:
                  return value;
                // find

                case 6:
                  return index;
                // findIndex

                case 2:
                  push.call(target, value);
                // filter
              }
            else if (IS_EVERY) return false; // every
          }
        }

      return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
    };
  };

  var arrayIteration = {
    // `Array.prototype.forEach` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
    forEach: createMethod$1(0),
    // `Array.prototype.map` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.map
    map: createMethod$1(1),
    // `Array.prototype.filter` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.filter
    filter: createMethod$1(2),
    // `Array.prototype.some` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.some
    some: createMethod$1(3),
    // `Array.prototype.every` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.every
    every: createMethod$1(4),
    // `Array.prototype.find` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.find
    find: createMethod$1(5),
    // `Array.prototype.findIndex` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
    findIndex: createMethod$1(6)
  };

  var arrayMethodIsStrict = function(METHOD_NAME, argument) {
    var method = [][METHOD_NAME];
    return (
      !!method &&
      fails(function() {
        // eslint-disable-next-line no-useless-call,no-throw-literal
        method.call(
          null,
          argument ||
            function() {
              throw 1;
            },
          1
        );
      })
    );
  };

  var defineProperty = Object.defineProperty;
  var cache = {};

  var thrower = function(it) {
    throw it;
  };

  var arrayMethodUsesToLength = function(METHOD_NAME, options) {
    if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
    if (!options) options = {};
    var method = [][METHOD_NAME];
    var ACCESSORS = has(options, "ACCESSORS") ? options.ACCESSORS : false;
    var argument0 = has(options, 0) ? options[0] : thrower;
    var argument1 = has(options, 1) ? options[1] : undefined;
    return (cache[METHOD_NAME] =
      !!method &&
      !fails(function() {
        if (ACCESSORS && !descriptors) return true;
        var O = {
          length: -1
        };
        if (ACCESSORS)
          defineProperty(O, 1, {
            enumerable: true,
            get: thrower
          });
        else O[1] = 1;
        method.call(O, argument0, argument1);
      }));
  };

  var $forEach = arrayIteration.forEach;

  var STRICT_METHOD = arrayMethodIsStrict("forEach");
  var USES_TO_LENGTH = arrayMethodUsesToLength("forEach"); // `Array.prototype.forEach` method implementation
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach

  var arrayForEach =
    !STRICT_METHOD || !USES_TO_LENGTH
      ? function forEach(
          callbackfn
          /* , thisArg */
        ) {
          return $forEach(
            this,
            callbackfn,
            arguments.length > 1 ? arguments[1] : undefined
          );
        }
      : [].forEach;

  // `Array.prototype.forEach` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach

  _export(
    {
      target: "Array",
      proto: true,
      forced: [].forEach != arrayForEach
    },
    {
      forEach: arrayForEach
    }
  );

  var engineUserAgent = getBuiltIn("navigator", "userAgent") || "";

  var process = global_1.process;
  var versions = process && process.versions;
  var v8 = versions && versions.v8;
  var match, version;

  if (v8) {
    match = v8.split(".");
    version = match[0] + match[1];
  } else if (engineUserAgent) {
    match = engineUserAgent.match(/Edge\/(\d+)/);

    if (!match || match[1] >= 74) {
      match = engineUserAgent.match(/Chrome\/(\d+)/);
      if (match) version = match[1];
    }
  }

  var engineV8Version = version && +version;

  var SPECIES$1 = wellKnownSymbol("species");

  var arrayMethodHasSpeciesSupport = function(METHOD_NAME) {
    // We can't use this feature detection in V8 since it causes
    // deoptimization and serious performance degradation
    // https://github.com/zloirock/core-js/issues/677
    return (
      engineV8Version >= 51 ||
      !fails(function() {
        var array = [];
        var constructor = (array.constructor = {});

        constructor[SPECIES$1] = function() {
          return {
            foo: 1
          };
        };

        return array[METHOD_NAME](Boolean).foo !== 1;
      })
    );
  };

  var $map = arrayIteration.map;

  var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport("map"); // FF49- issue

  var USES_TO_LENGTH$1 = arrayMethodUsesToLength("map"); // `Array.prototype.map` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.map
  // with adding support of @@species

  _export(
    {
      target: "Array",
      proto: true,
      forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH$1
    },
    {
      map: function map(
        callbackfn
        /* , thisArg */
      ) {
        return $map(
          this,
          callbackfn,
          arguments.length > 1 ? arguments[1] : undefined
        );
      }
    }
  );

  var createProperty = function(object, key, value) {
    var propertyKey = toPrimitive(key);
    if (propertyKey in object)
      objectDefineProperty.f(
        object,
        propertyKey,
        createPropertyDescriptor(0, value)
      );
    else object[propertyKey] = value;
  };

  var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport("slice");
  var USES_TO_LENGTH$2 = arrayMethodUsesToLength("slice", {
    ACCESSORS: true,
    0: 0,
    1: 2
  });
  var SPECIES$2 = wellKnownSymbol("species");
  var nativeSlice = [].slice;
  var max$1 = Math.max; // `Array.prototype.slice` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.slice
  // fallback for not array-like ES3 strings and DOM objects

  _export(
    {
      target: "Array",
      proto: true,
      forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$2
    },
    {
      slice: function slice(start, end) {
        var O = toIndexedObject(this);
        var length = toLength(O.length);
        var k = toAbsoluteIndex(start, length);
        var fin = toAbsoluteIndex(end === undefined ? length : end, length); // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible

        var Constructor, result, n;

        if (isArray(O)) {
          Constructor = O.constructor; // cross-realm fallback

          if (
            typeof Constructor == "function" &&
            (Constructor === Array || isArray(Constructor.prototype))
          ) {
            Constructor = undefined;
          } else if (isObject(Constructor)) {
            Constructor = Constructor[SPECIES$2];
            if (Constructor === null) Constructor = undefined;
          }

          if (Constructor === Array || Constructor === undefined) {
            return nativeSlice.call(O, k, fin);
          }
        }

        result = new (Constructor === undefined ? Array : Constructor)(
          max$1(fin - k, 0)
        );

        for (n = 0; k < fin; k++, n++)
          if (k in O) createProperty(result, n, O[k]);

        result.length = n;
        return result;
      }
    }
  );

  // `thisNumberValue` abstract operation
  // https://tc39.github.io/ecma262/#sec-thisnumbervalue

  var thisNumberValue = function(value) {
    if (typeof value != "number" && classofRaw(value) != "Number") {
      throw TypeError("Incorrect invocation");
    }

    return +value;
  };

  // `String.prototype.repeat` method implementation
  // https://tc39.github.io/ecma262/#sec-string.prototype.repeat

  var stringRepeat =
    "".repeat ||
    function repeat(count) {
      var str = String(requireObjectCoercible(this));
      var result = "";
      var n = toInteger(count);
      if (n < 0 || n == Infinity)
        throw RangeError("Wrong number of repetitions");

      for (; n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;

      return result;
    };

  var nativeToFixed = (1.0).toFixed;
  var floor$1 = Math.floor;

  var pow = function(x, n, acc) {
    return n === 0
      ? acc
      : n % 2 === 1
      ? pow(x, n - 1, acc * x)
      : pow(x * x, n / 2, acc);
  };

  var log = function(x) {
    var n = 0;
    var x2 = x;

    while (x2 >= 4096) {
      n += 12;
      x2 /= 4096;
    }

    while (x2 >= 2) {
      n += 1;
      x2 /= 2;
    }

    return n;
  };

  var FORCED =
    (nativeToFixed &&
      ((0.00008).toFixed(3) !== "0.000" ||
        (0.9).toFixed(0) !== "1" ||
        (1.255).toFixed(2) !== "1.25" ||
        (1000000000000000128.0).toFixed(0) !== "1000000000000000128")) ||
    !fails(function() {
      // V8 ~ Android 4.3-
      nativeToFixed.call({});
    }); // `Number.prototype.toFixed` method
  // https://tc39.github.io/ecma262/#sec-number.prototype.tofixed

  _export(
    {
      target: "Number",
      proto: true,
      forced: FORCED
    },
    {
      // eslint-disable-next-line max-statements
      toFixed: function toFixed(fractionDigits) {
        var number = thisNumberValue(this);
        var fractDigits = toInteger(fractionDigits);
        var data = [0, 0, 0, 0, 0, 0];
        var sign = "";
        var result = "0";
        var e, z, j, k;

        var multiply = function(n, c) {
          var index = -1;
          var c2 = c;

          while (++index < 6) {
            c2 += n * data[index];
            data[index] = c2 % 1e7;
            c2 = floor$1(c2 / 1e7);
          }
        };

        var divide = function(n) {
          var index = 6;
          var c = 0;

          while (--index >= 0) {
            c += data[index];
            data[index] = floor$1(c / n);
            c = (c % n) * 1e7;
          }
        };

        var dataToString = function() {
          var index = 6;
          var s = "";

          while (--index >= 0) {
            if (s !== "" || index === 0 || data[index] !== 0) {
              var t = String(data[index]);
              s = s === "" ? t : s + stringRepeat.call("0", 7 - t.length) + t;
            }
          }

          return s;
        };

        if (fractDigits < 0 || fractDigits > 20)
          throw RangeError("Incorrect fraction digits"); // eslint-disable-next-line no-self-compare

        if (number != number) return "NaN";
        if (number <= -1e21 || number >= 1e21) return String(number);

        if (number < 0) {
          sign = "-";
          number = -number;
        }

        if (number > 1e-21) {
          e = log(number * pow(2, 69, 1)) - 69;
          z = e < 0 ? number * pow(2, -e, 1) : number / pow(2, e, 1);
          z *= 0x10000000000000;
          e = 52 - e;

          if (e > 0) {
            multiply(0, z);
            j = fractDigits;

            while (j >= 7) {
              multiply(1e7, 0);
              j -= 7;
            }

            multiply(pow(10, j, 1), 0);
            j = e - 1;

            while (j >= 23) {
              divide(1 << 23);
              j -= 23;
            }

            divide(1 << j);
            multiply(1, 1);
            divide(2);
            result = dataToString();
          } else {
            multiply(0, z);
            multiply(1 << -e, 0);
            result = dataToString() + stringRepeat.call("0", fractDigits);
          }
        }

        if (fractDigits > 0) {
          k = result.length;
          result =
            sign +
            (k <= fractDigits
              ? "0." + stringRepeat.call("0", fractDigits - k) + result
              : result.slice(0, k - fractDigits) +
                "." +
                result.slice(k - fractDigits));
        } else {
          result = sign + result;
        }

        return result;
      }
    }
  );

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
  // [START maps_map_puzzle]

  /**
   * @constructor @struct @final
   */
  function PuzzleDemo() {
    /** @private {!Array<google.maps.Polygon>} */
    this.polys_ = [];
    /** @private {string} */

    this.difficulty_ = "easy";
    /** @private {number} */

    this.count_ = 0;
    /** @private {?Element} */

    this.pieceDiv_ = null;
    /** @private {?Element} */

    this.timeDiv_ = null;
  }
  /**
   * @private {number}
   */

  PuzzleDemo.NUM_PIECES_ = 10;
  /**
   * @private {string}
   */

  PuzzleDemo.START_COLOR_ = "#3c79de";
  /**
   * @private {string}
   */

  PuzzleDemo.END_COLOR_ = "#037e29";
  /**
   * @param {!google.maps.Map} map
   */

  PuzzleDemo.prototype.init = function(map) {
    this.map_ = map;
    this.createMenu_(map);
    this.setDifficultyStyle_();
    this.loadData_();
  };
  /**
   * @param {!google.maps.Map} map
   */

  PuzzleDemo.prototype.createMenu_ = function(map) {
    var menuDiv = document.createElement("div");
    menuDiv.style.cssText =
      "margin: 40px 10px; border-radius: 8px; height: 320px; width: 180px;" +
      "background-color: white; font-size: 14px; font-family: Roboto;" +
      "text-align: center; color: grey;line-height: 32px; overflow: hidden";
    var titleDiv = document.createElement("div");
    titleDiv.style.cssText =
      "width: 100%; background-color: #4285f4; color: white; font-size: 20px;" +
      "line-height: 40px;margin-bottom: 24px";
    titleDiv.innerText = "Game Options";
    var pieceTitleDiv = document.createElement("div");
    pieceTitleDiv.innerText = "PIECE:";
    pieceTitleDiv.style.fontWeight = "800";
    var pieceDiv = (this.pieceDiv_ = document.createElement("div"));
    pieceDiv.innerText = "0 / " + PuzzleDemo.NUM_PIECES_;
    var timeTitleDiv = document.createElement("div");
    timeTitleDiv.innerText = "TIME:";
    timeTitleDiv.style.fontWeight = "800";
    var timeDiv = (this.timeDiv_ = document.createElement("div"));
    timeDiv.innerText = "0.0 seconds";
    var difficultyTitleDiv = document.createElement("div");
    difficultyTitleDiv.innerText = "DIFFICULTY:";
    difficultyTitleDiv.style.fontWeight = "800";
    var difficultySelect = document.createElement("select");
    ["Easy", "Moderate", "Hard", "Extreme"].forEach(function(level) {
      var option = document.createElement("option");
      option.value = level.toLowerCase();
      option.innerText = level;
      difficultySelect.appendChild(option);
    });
    difficultySelect.style.cssText =
      "border: 2px solid lightgrey; background-color: white; color: #4275f4;" +
      "padding: 6px;";

    difficultySelect.onchange = function() {
      this.setDifficulty_(difficultySelect.value);
      this.resetGame_();
    }.bind(this);

    var resetDiv = document.createElement("div");
    resetDiv.innerText = "Reset";
    resetDiv.style.cssText =
      "cursor: pointer; border-top: 1px solid lightgrey; margin-top: 18px;" +
      "color: #4275f4; line-height: 40px; font-weight: 800";
    resetDiv.onclick = this.resetGame_.bind(this);
    menuDiv.appendChild(titleDiv);
    menuDiv.appendChild(pieceTitleDiv);
    menuDiv.appendChild(pieceDiv);
    menuDiv.appendChild(timeTitleDiv);
    menuDiv.appendChild(timeDiv);
    menuDiv.appendChild(difficultyTitleDiv);
    menuDiv.appendChild(difficultySelect);
    menuDiv.appendChild(resetDiv);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(menuDiv);
  };
  /**
   * @param {!google.maps.Map} map
   */

  PuzzleDemo.prototype.render = function(map) {
    if (!this.dataLoaded_) {
      return;
    }

    this.start_();
  };
  /**
   * @private
   */

  PuzzleDemo.prototype.loadData_ = function() {
    var xmlhttpRequest = new XMLHttpRequest();

    xmlhttpRequest.onreadystatechange = function() {
      if (
        xmlhttpRequest.status != 200 ||
        xmlhttpRequest.readyState != XMLHttpRequest.DONE
      )
        return;
      this.loadDataComplete_(JSON.parse(xmlhttpRequest.responseText));
    }.bind(this);

    xmlhttpRequest.open(
      "GET",
      "https://storage.googleapis.com/mapsdevsite/json/puzzle.json",
      true
    );
    xmlhttpRequest.send(null);
  };
  /**
   * @param {!Array<{
   *     bounds: !Array<!Array<number>>,
   *     name: string,
   *     start: !Array<string>,
   *     end: !Array<string>
   * }>} data
   * @private
   */

  PuzzleDemo.prototype.loadDataComplete_ = function(data) {
    this.dataLoaded_ = true;
    this.countries_ = data;
    this.start_();
  };
  /**
   * @param {string} difficulty
   * @private
   */

  PuzzleDemo.prototype.setDifficulty_ = function(difficulty) {
    this.difficulty_ = difficulty;

    if (this.map_) {
      this.setDifficultyStyle_();
    }
  };
  /**
   * @private
   */

  PuzzleDemo.prototype.setDifficultyStyle_ = function() {
    var styles = {
      easy: [
        {
          stylers: [
            {
              visibility: "off"
            }
          ]
        },
        {
          featureType: "water",
          stylers: [
            {
              visibility: "on"
            },
            {
              color: "#d4d4d4"
            }
          ]
        },
        {
          featureType: "landscape",
          stylers: [
            {
              visibility: "on"
            },
            {
              color: "#e5e3df"
            }
          ]
        },
        {
          featureType: "administrative.country",
          elementType: "labels",
          stylers: [
            {
              visibility: "on"
            }
          ]
        },
        {
          featureType: "administrative.country",
          elementType: "geometry",
          stylers: [
            {
              visibility: "on"
            },
            {
              weight: 1.3
            }
          ]
        }
      ],
      moderate: [
        {
          stylers: [
            {
              visibility: "off"
            }
          ]
        },
        {
          featureType: "water",
          stylers: [
            {
              visibility: "on"
            },
            {
              color: "#d4d4d4"
            }
          ]
        },
        {
          featureType: "landscape",
          stylers: [
            {
              visibility: "on"
            },
            {
              color: "#e5e3df"
            }
          ]
        },
        {
          featureType: "administrative.country",
          elementType: "labels",
          stylers: [
            {
              visibility: "on"
            }
          ]
        }
      ],
      hard: [
        {
          stylers: [
            {
              visibility: "off"
            }
          ]
        },
        {
          featureType: "water",
          stylers: [
            {
              visibility: "on"
            },
            {
              color: "#d4d4d4"
            }
          ]
        },
        {
          featureType: "landscape",
          stylers: [
            {
              visibility: "on"
            },
            {
              color: "#e5e3df"
            }
          ]
        }
      ],
      extreme: [
        {
          elementType: "geometry",
          stylers: [
            {
              visibility: "off"
            }
          ]
        }
      ]
    };
    this.map_.set("styles", styles[this.difficulty_]);
  };
  /**
   * @private
   */

  PuzzleDemo.prototype.resetGame_ = function() {
    this.removeCountries_();
    this.count_ = 0;
    this.setCount_();
    this.startClock_();
    this.addRandomCountries_();
  };
  /**
   * @private
   */

  PuzzleDemo.prototype.setCount_ = function() {
    this.pieceDiv_.innerText = this.count_ + " / " + PuzzleDemo.NUM_PIECES_;

    if (this.count_ == PuzzleDemo.NUM_PIECES_) {
      this.stopClock_();
    }
  };
  /**
   * @private
   */

  PuzzleDemo.prototype.stopClock_ = function() {
    window.clearInterval(this.timer_);
  };
  /**
   * @private
   */

  PuzzleDemo.prototype.startClock_ = function() {
    this.stopClock_();
    var timeDiv = this.timeDiv_;
    if (timeDiv) timeDiv.textContent = "0.0 seconds";
    var t = new Date();
    this.timer_ = window.setInterval(function() {
      var diff = new Date() - t;
      if (timeDiv) timeDiv.textContent = (diff / 1000).toFixed(2) + " seconds";
    }, 100);
  };
  /**
   * @private
   */

  PuzzleDemo.prototype.addRandomCountries_ = function() {
    // Shuffle countries
    this.countries_.sort(function() {
      return Math.round(Math.random()) - 0.5;
    });
    var countries = this.countries_.slice(0, PuzzleDemo.NUM_PIECES_);

    for (var i = 0, country; (country = countries[i]); i++) {
      this.addCountry_(country);
    }
  };
  /**
   * @param {{
   *   bounds: !Array<!Array<number>>,
   *   name: string,
   *   start: !Array<string>,
   *   end: !Array<string>
   * }} country
   * @private
   */

  PuzzleDemo.prototype.addCountry_ = function(country) {
    var options = {
      strokeColor: PuzzleDemo.START_COLOR_,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: PuzzleDemo.START_COLOR_,
      fillOpacity: 0.35,
      geodesic: true,
      map: this.map_,
      draggable: true,
      zIndex: 2,
      paths: country.start.map(google.maps.geometry.encoding.decodePath)
    };
    var poly = new google.maps.Polygon(options);
    google.maps.event.addListener(
      poly,
      "dragend",
      function() {
        this.checkPosition_(poly, country);
      }.bind(this)
    );
    this.polys_.push(poly);
  };
  /**
   * Checks that every point in the polygon is inside the bounds.
   * @param {!Array<number>} bounds
   * @param {!google.maps.Polygon} poly
   * @returns {boolean}
   */

  PuzzleDemo.prototype.boundsContainsPoly_ = function(bounds, poly) {
    var b = new google.maps.LatLngBounds(
      new google.maps.LatLng(bounds[0][0], bounds[0][1]),
      new google.maps.LatLng(bounds[1][0], bounds[1][1])
    );
    var paths = poly.getPaths().getArray();

    for (var i = 0; i < paths.length; i++) {
      var p = paths[i].getArray();

      for (var j = 0; j < p.length; j++) {
        if (!b.contains(p[j])) {
          return false;
        }
      }
    }

    return true;
  };
  /**
   * Replace a poly with the correct 'end' position of the country.
   * @param {google.maps.Polygon} poly
   * @param {Object} country
   * @private
   */

  PuzzleDemo.prototype.replacePiece_ = function(poly, country) {
    var options = {
      strokeColor: PuzzleDemo.END_COLOR_,
      fillColor: PuzzleDemo.END_COLOR_,
      draggable: false,
      zIndex: 1,
      paths: country.end.map(google.maps.geometry.encoding.decodePath)
    };
    poly.setOptions(options);
    this.count_++;
    this.setCount_();
  };
  /**
   * @param {google.maps.Polygon} poly
   * @param {Object} country
   * @private
   */

  PuzzleDemo.prototype.checkPosition_ = function(poly, country) {
    if (this.boundsContainsPoly_(country.bounds, poly)) {
      this.replacePiece_(poly, country);
    }
  };
  /**
   * @private
   */

  PuzzleDemo.prototype.start_ = function() {
    this.setDifficultyStyle_();
    this.resetGame_();
  };
  /**
   * @private
   */

  PuzzleDemo.prototype.removeCountries_ = function() {
    for (var i = 0, poly; (poly = this.polys_[i]); i++) {
      poly.setMap(null);
    }

    this.polys_ = [];
  };

  function initMap() {
    var map = new google.maps.Map(document.getElementById("map"), {
      disableDefaultUI: true,
      center: {
        lat: 10,
        lng: 60
      },
      zoom: 2
    });
    new PuzzleDemo().init(map);
  } // [END maps_map_puzzle]

  exports.PuzzleDemo = PuzzleDemo;
  exports.initMap = initMap;
})((this.window = this.window || {}));
