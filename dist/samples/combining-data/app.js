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

  var aPossiblePrototype = function(it) {
    if (!isObject(it) && it !== null) {
      throw TypeError("Can't set " + String(it) + " as a prototype");
    }

    return it;
  };

  // `Object.setPrototypeOf` method
  // https://tc39.github.io/ecma262/#sec-object.setprototypeof
  // Works with __proto__ only. Old v8 can't work with null proto objects.

  /* eslint-disable no-proto */

  var objectSetPrototypeOf =
    Object.setPrototypeOf ||
    ("__proto__" in {}
      ? (function() {
          var CORRECT_SETTER = false;
          var test = {};
          var setter;

          try {
            setter = Object.getOwnPropertyDescriptor(
              Object.prototype,
              "__proto__"
            ).set;
            setter.call(test, []);
            CORRECT_SETTER = test instanceof Array;
          } catch (error) {
            /* empty */
          }

          return function setPrototypeOf(O, proto) {
            anObject(O);
            aPossiblePrototype(proto);
            if (CORRECT_SETTER) setter.call(O, proto);
            else O.__proto__ = proto;
            return O;
          };
        })()
      : undefined);

  // makes subclassing work correct for wrapped built-ins

  var inheritIfRequired = function($this, dummy, Wrapper) {
    var NewTarget, NewTargetPrototype;
    if (
      // it can work only with native `setPrototypeOf`
      objectSetPrototypeOf && // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
      typeof (NewTarget = dummy.constructor) == "function" &&
      NewTarget !== Wrapper &&
      isObject((NewTargetPrototype = NewTarget.prototype)) &&
      NewTargetPrototype !== Wrapper.prototype
    )
      objectSetPrototypeOf($this, NewTargetPrototype);
    return $this;
  };

  // `Object.keys` method
  // https://tc39.github.io/ecma262/#sec-object.keys

  var objectKeys =
    Object.keys ||
    function keys(O) {
      return objectKeysInternal(O, enumBugKeys);
    };

  // `Object.defineProperties` method
  // https://tc39.github.io/ecma262/#sec-object.defineproperties

  var objectDefineProperties = descriptors
    ? Object.defineProperties
    : function defineProperties(O, Properties) {
        anObject(O);
        var keys = objectKeys(Properties);
        var length = keys.length;
        var index = 0;
        var key;

        while (length > index)
          objectDefineProperty.f(O, (key = keys[index++]), Properties[key]);

        return O;
      };

  var html = getBuiltIn("document", "documentElement");

  var GT = ">";
  var LT = "<";
  var PROTOTYPE = "prototype";
  var SCRIPT = "script";
  var IE_PROTO = sharedKey("IE_PROTO");

  var EmptyConstructor = function() {
    /* empty */
  };

  var scriptTag = function(content) {
    return LT + SCRIPT + GT + content + LT + "/" + SCRIPT + GT;
  }; // Create object with fake `null` prototype: use ActiveX Object with cleared prototype

  var NullProtoObjectViaActiveX = function(activeXDocument) {
    activeXDocument.write(scriptTag(""));
    activeXDocument.close();
    var temp = activeXDocument.parentWindow.Object;
    activeXDocument = null; // avoid memory leak

    return temp;
  }; // Create object with fake `null` prototype: use iframe Object with cleared prototype

  var NullProtoObjectViaIFrame = function() {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = documentCreateElement("iframe");
    var JS = "java" + SCRIPT + ":";
    var iframeDocument;
    iframe.style.display = "none";
    html.appendChild(iframe); // https://github.com/zloirock/core-js/issues/475

    iframe.src = String(JS);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(scriptTag("document.F=Object"));
    iframeDocument.close();
    return iframeDocument.F;
  }; // Check for document.domain and active x support
  // No need to use active x approach when document.domain is not set
  // see https://github.com/es-shims/es5-shim/issues/150
  // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
  // avoid IE GC bug

  var activeXDocument;

  var NullProtoObject = function() {
    try {
      /* global ActiveXObject */
      activeXDocument = document.domain && new ActiveXObject("htmlfile");
    } catch (error) {
      /* ignore */
    }

    NullProtoObject = activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument)
      : NullProtoObjectViaIFrame();
    var length = enumBugKeys.length;

    while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];

    return NullProtoObject();
  };

  hiddenKeys[IE_PROTO] = true; // `Object.create` method
  // https://tc39.github.io/ecma262/#sec-object.create

  var objectCreate =
    Object.create ||
    function create(O, Properties) {
      var result;

      if (O !== null) {
        EmptyConstructor[PROTOTYPE] = anObject(O);
        result = new EmptyConstructor();
        EmptyConstructor[PROTOTYPE] = null; // add "__proto__" for Object.getPrototypeOf polyfill

        result[IE_PROTO] = O;
      } else result = NullProtoObject();

      return Properties === undefined
        ? result
        : objectDefineProperties(result, Properties);
    };

  // a string of all valid unicode whitespaces
  // eslint-disable-next-line max-len
  var whitespaces =
    "\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF";

  var whitespace = "[" + whitespaces + "]";
  var ltrim = RegExp("^" + whitespace + whitespace + "*");
  var rtrim = RegExp(whitespace + whitespace + "*$"); // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation

  var createMethod$2 = function(TYPE) {
    return function($this) {
      var string = String(requireObjectCoercible($this));
      if (TYPE & 1) string = string.replace(ltrim, "");
      if (TYPE & 2) string = string.replace(rtrim, "");
      return string;
    };
  };

  var stringTrim = {
    // `String.prototype.{ trimLeft, trimStart }` methods
    // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
    start: createMethod$2(1),
    // `String.prototype.{ trimRight, trimEnd }` methods
    // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
    end: createMethod$2(2),
    // `String.prototype.trim` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.trim
    trim: createMethod$2(3)
  };

  var getOwnPropertyNames = objectGetOwnPropertyNames.f;

  var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;

  var defineProperty$1 = objectDefineProperty.f;

  var trim = stringTrim.trim;

  var NUMBER = "Number";
  var NativeNumber = global_1[NUMBER];
  var NumberPrototype = NativeNumber.prototype; // Opera ~12 has broken Object#toString

  var BROKEN_CLASSOF = classofRaw(objectCreate(NumberPrototype)) == NUMBER; // `ToNumber` abstract operation
  // https://tc39.github.io/ecma262/#sec-tonumber

  var toNumber = function(argument) {
    var it = toPrimitive(argument, false);
    var first, third, radix, maxCode, digits, length, index, code;

    if (typeof it == "string" && it.length > 2) {
      it = trim(it);
      first = it.charCodeAt(0);

      if (first === 43 || first === 45) {
        third = it.charCodeAt(2);
        if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
      } else if (first === 48) {
        switch (it.charCodeAt(1)) {
          case 66:
          case 98:
            radix = 2;
            maxCode = 49;
            break;
          // fast equal of /^0b[01]+$/i

          case 79:
          case 111:
            radix = 8;
            maxCode = 55;
            break;
          // fast equal of /^0o[0-7]+$/i

          default:
            return +it;
        }

        digits = it.slice(2);
        length = digits.length;

        for (index = 0; index < length; index++) {
          code = digits.charCodeAt(index); // parseInt parses a string to a first unavailable symbol
          // but ToNumber should return NaN if a string contains unavailable symbols

          if (code < 48 || code > maxCode) return NaN;
        }

        return parseInt(digits, radix);
      }
    }

    return +it;
  }; // `Number` constructor
  // https://tc39.github.io/ecma262/#sec-number-constructor

  if (
    isForced_1(
      NUMBER,
      !NativeNumber(" 0o1") || !NativeNumber("0b1") || NativeNumber("+0x1")
    )
  ) {
    var NumberWrapper = function Number(value) {
      var it = arguments.length < 1 ? 0 : value;
      var dummy = this;
      return dummy instanceof NumberWrapper && // check on 1..constructor(foo) case
        (BROKEN_CLASSOF
          ? fails(function() {
              NumberPrototype.valueOf.call(dummy);
            })
          : classofRaw(dummy) != NUMBER)
        ? inheritIfRequired(
            new NativeNumber(toNumber(it)),
            dummy,
            NumberWrapper
          )
        : toNumber(it);
    };

    for (
      var keys$1 = descriptors
          ? getOwnPropertyNames(NativeNumber)
          : // ES3:
            (
              "MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY," + // ES2015 (in case, if modules with ES2015 Number statics required before):
              "EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER," +
              "MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger"
            ).split(","),
        j = 0,
        key;
      keys$1.length > j;
      j++
    ) {
      if (has(NativeNumber, (key = keys$1[j])) && !has(NumberWrapper, key)) {
        defineProperty$1(
          NumberWrapper,
          key,
          getOwnPropertyDescriptor$2(NativeNumber, key)
        );
      }
    }

    NumberWrapper.prototype = NumberPrototype;
    NumberPrototype.constructor = NumberWrapper;
    redefine(global_1, NUMBER, NumberWrapper);
  }

  // iterable DOM collections
  // flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
  var domIterables = {
    CSSRuleList: 0,
    CSSStyleDeclaration: 0,
    CSSValueList: 0,
    ClientRectList: 0,
    DOMRectList: 0,
    DOMStringList: 0,
    DOMTokenList: 1,
    DataTransferItemList: 0,
    FileList: 0,
    HTMLAllCollection: 0,
    HTMLCollection: 0,
    HTMLFormElement: 0,
    HTMLSelectElement: 0,
    MediaList: 0,
    MimeTypeArray: 0,
    NamedNodeMap: 0,
    NodeList: 1,
    PaintRequestList: 0,
    Plugin: 0,
    PluginArray: 0,
    SVGLengthList: 0,
    SVGNumberList: 0,
    SVGPathSegList: 0,
    SVGPointList: 0,
    SVGStringList: 0,
    SVGTransformList: 0,
    SourceBufferList: 0,
    StyleSheetList: 0,
    TextTrackCueList: 0,
    TextTrackList: 0,
    TouchList: 0
  };

  for (var COLLECTION_NAME in domIterables) {
    var Collection = global_1[COLLECTION_NAME];
    var CollectionPrototype = Collection && Collection.prototype; // some Chrome versions have non-configurable methods on DOMTokenList

    if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach)
      try {
        createNonEnumerableProperty(
          CollectionPrototype,
          "forEach",
          arrayForEach
        );
      } catch (error) {
        CollectionPrototype.forEach = arrayForEach;
      }
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
  // [START maps_combining_data]
  var mapStyle = [
    {
      stylers: [
        {
          visibility: "off"
        }
      ]
    },
    {
      featureType: "landscape",
      elementType: "geometry",
      stylers: [
        {
          visibility: "on"
        },
        {
          color: "#fcfcfc"
        }
      ]
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [
        {
          visibility: "on"
        },
        {
          color: "#bfd4ff"
        }
      ]
    }
  ];

  exports.censusMin = Number.MAX_VALUE;
  var censusMax = -Number.MAX_VALUE;

  function initMap() {
    // load the map
    exports.map = new google.maps.Map(document.getElementById("map"), {
      center: {
        lat: 40,
        lng: -100
      },
      zoom: 4,
      styles: mapStyle
    }); // set up the style rules and events for google.maps.Data

    exports.map.data.setStyle(styleFeature);
    exports.map.data.addListener("mouseover", mouseInToRegion);
    exports.map.data.addListener("mouseout", mouseOutOfRegion); // wire up the button

    var selectBox = document.getElementById("census-variable");
    google.maps.event.addDomListener(selectBox, "change", function() {
      clearCensusData();
      loadCensusData(selectBox.options[selectBox.selectedIndex].value);
    }); // state polygons only need to be loaded once, do them now

    loadMapShapes();
  }
  /** Loads the state boundary polygons from a GeoJSON source. */

  function loadMapShapes() {
    // load US state outline polygons from a GeoJson file
    exports.map.data.loadGeoJson(
      "https://storage.googleapis.com/mapsdevsite/json/states.js",
      {
        idPropertyName: "STATE"
      }
    ); // wait for the request to complete by listening for the first feature to be
    // added

    google.maps.event.addListenerOnce(
      exports.map.data,
      "addfeature",
      function() {
        google.maps.event.trigger(
          document.getElementById("census-variable"),
          "change"
        );
      }
    );
  }
  /**
   * Loads the census data from a simulated API call to the US Census API.
   *
   * @param {string} variable
   */

  function loadCensusData(variable) {
    // load the requested variable from the census API (using local copies)
    var xhr = new XMLHttpRequest();
    xhr.open("GET", variable + ".json"); // [START maps_combining_data_snippet_loadcensus]

    xhr.onload = function() {
      var censusData = JSON.parse(xhr.responseText);
      censusData.shift(); // the first row contains column names

      censusData.forEach(function(row) {
        var censusVariable = parseFloat(row[0]);
        var stateId = row[1]; // keep track of min and max values

        if (censusVariable < exports.censusMin) {
          exports.censusMin = censusVariable;
        }

        if (censusVariable > censusMax) {
          censusMax = censusVariable;
        } // update the existing row with the new data

        exports.map.data
          .getFeatureById(stateId)
          .setProperty("census_variable", censusVariable);
      }); // update and display the legend

      document.getElementById(
        "census-min"
      ).textContent = exports.censusMin.toLocaleString();
      document.getElementById(
        "census-max"
      ).textContent = censusMax.toLocaleString();
    };

    xhr.send(); // [END maps_combining_data_snippet_loadcensus]
  }
  /** Removes census data from each shape on the map and resets the UI. */

  function clearCensusData() {
    exports.censusMin = Number.MAX_VALUE;
    censusMax = -Number.MAX_VALUE;
    exports.map.data.forEach(function(row) {
      row.setProperty("census_variable", undefined);
    });
    document.getElementById("data-box").style.display = "none";
    document.getElementById("data-caret").style.display = "none";
  }
  /**
   * Applies a gradient style based on the 'census_variable' column.
   * This is the callback passed to data.setStyle() and is called for each row in
   * the data set.  Check out the docs for Data.StylingFunction.
   *
   * @param {google.maps.Data.Feature} feature
   */
  // [START maps_combining_data_snippet_stylefeature]

  function styleFeature(feature) {
    var low = [5, 69, 54]; // color of smallest datum

    var high = [151, 83, 34]; // color of largest datum
    // delta represents where the value sits between the min and max

    var delta =
      (feature.getProperty("census_variable") - exports.censusMin) /
      (censusMax - exports.censusMin);
    var color = [];

    for (var i = 0; i < 3; i++) {
      // calculate an integer color based on the delta
      color[i] = (high[i] - low[i]) * delta + low[i];
    } // determine whether to show this shape or not

    var showRow = true;

    if (
      feature.getProperty("census_variable") == null ||
      isNaN(feature.getProperty("census_variable"))
    ) {
      showRow = false;
    }

    var outlineWeight = 0.5,
      zIndex = 1;

    if (feature.getProperty("state") === "hover") {
      outlineWeight = zIndex = 2;
    }

    return {
      strokeWeight: outlineWeight,
      strokeColor: "#fff",
      zIndex: zIndex,
      fillColor: "hsl(" + color[0] + "," + color[1] + "%," + color[2] + "%)",
      fillOpacity: 0.75,
      visible: showRow
    };
  } // [END maps_combining_data_snippet_stylefeature]
  // [START maps_combining_data_snippet_mouseevents]

  /**
   * Responds to the mouse-in event on a map shape (state).
   *
   * @param {?google.maps.MouseEvent} e
   */

  function mouseInToRegion(e) {
    // set the hover state so the setStyle function can change the border
    e.feature.setProperty("state", "hover");
    var percent =
      ((e.feature.getProperty("census_variable") - exports.censusMin) /
        (censusMax - exports.censusMin)) *
      100; // update the label

    document.getElementById("data-label").textContent = e.feature.getProperty(
      "NAME"
    );
    document.getElementById("data-value").textContent = e.feature
      .getProperty("census_variable")
      .toLocaleString();
    document.getElementById("data-box").style.display = "block";
    document.getElementById("data-caret").style.display = "block";
    document.getElementById("data-caret").style.paddingLeft = percent + "%";
  }
  /**
   * Responds to the mouse-out event on a map shape (state).
   *
   * @param {?google.maps.MouseEvent} e
   */

  function mouseOutOfRegion(e) {
    // reset the hover state, returning the border to normal
    e.feature.setProperty("state", "normal");
  } // [END maps_combining_data_snippet_mouseevents]

  exports.clearCensusData = clearCensusData;
  exports.initMap = initMap;
  exports.loadCensusData = loadCensusData;
  exports.loadMapShapes = loadMapShapes;
  exports.mapStyle = mapStyle;
  exports.mouseInToRegion = mouseInToRegion;
  exports.mouseOutOfRegion = mouseOutOfRegion;
  exports.styleFeature = styleFeature;
})((this.window = this.window || {}));
