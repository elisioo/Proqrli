import { r as reactExports, f as functionalUpdate, a as arraysEqual, c as createLRUCache, i as isPromise, b as isRedirect, d as isNotFound, e as invariant, g as createControlledPromise, h as rootRouteId, j as isServer, k as compileDecodeCharMap, t as trimPath, l as rewriteBasepath, m as composeRewrites, p as processRouteTree, n as processRouteMasks, o as resolvePath, q as cleanPath, s as trimPathRight, u as parseHref, v as executeRewriteInput, w as isDangerousProtocol, x as redirect, y as findSingleMatch, z as deepEqual, D as DEFAULT_PROTOCOL_ALLOWLIST, A as interpolatePath, B as nullReplaceEqualDeep, C as replaceEqualDeep, E as last, F as decodePath, G as findFlatMatch, H as findRouteMatch, I as executeRewriteOutput, J as encodePathLikeUrl, K as trimPathLeft, L as joinPaths, M as useRouter, N as dummyMatchContext, O as matchContext, P as getDefaultExportFromCjs, Q as requireReactDom, R as exactPathTest, S as removeTrailingSlash, T as React, U as jsxRuntimeExports, V as isModuleNotFoundError, W as useHydrated, X as escapeHtml, Y as getAssetCrossOrigin, Z as resolveManifestAssetLink, _ as Outlet, $ as notFound } from "./worker-entry.js";
var reactUse = reactExports.use;
function useForwardedRef(ref) {
  const innerRef = reactExports.useRef(null);
  reactExports.useImperativeHandle(ref, () => innerRef.current, []);
  return innerRef;
}
function encode(obj, stringify = String) {
  const result = new URLSearchParams();
  for (const key in obj) {
    const val = obj[key];
    if (val !== void 0) result.set(key, stringify(val));
  }
  return result.toString();
}
function toValue(str) {
  if (!str) return "";
  if (str === "false") return false;
  if (str === "true") return true;
  return +str * 0 === 0 && +str + "" === str ? +str : str;
}
function decode(str) {
  const searchParams = new URLSearchParams(str);
  const result = /* @__PURE__ */ Object.create(null);
  for (const [key, value] of searchParams.entries()) {
    const previousValue = result[key];
    if (previousValue == null) result[key] = toValue(value);
    else if (Array.isArray(previousValue)) previousValue.push(toValue(value));
    else result[key] = [previousValue, toValue(value)];
  }
  return result;
}
var defaultParseSearch = parseSearchWith(JSON.parse);
var defaultStringifySearch = stringifySearchWith(JSON.stringify, JSON.parse);
function parseSearchWith(parser) {
  return (searchStr) => {
    if (searchStr[0] === "?") searchStr = searchStr.substring(1);
    const query = decode(searchStr);
    for (const key in query) {
      const value = query[key];
      if (typeof value === "string") try {
        query[key] = parser(value);
      } catch (_err) {
      }
    }
    return query;
  };
}
function stringifySearchWith(stringify, parser) {
  const hasParser = typeof parser === "function";
  function stringifyValue(val) {
    if (typeof val === "object" && val !== null) try {
      return stringify(val);
    } catch (_err) {
    }
    else if (hasParser && typeof val === "string") try {
      parser(val);
      return stringify(val);
    } catch (_err) {
    }
    return val;
  }
  return (search) => {
    const searchStr = encode(search, stringifyValue);
    return searchStr ? `?${searchStr}` : "";
  };
}
function createNonReactiveMutableStore(initialValue) {
  let value = initialValue;
  return {
    get() {
      return value;
    },
    set(nextOrUpdater) {
      value = functionalUpdate(nextOrUpdater, value);
    }
  };
}
function createNonReactiveReadonlyStore(read) {
  return { get() {
    return read();
  } };
}
function createRouterStores(initialState, config) {
  const { createMutableStore, createReadonlyStore, batch, init } = config;
  const matchStores = /* @__PURE__ */ new Map();
  const pendingMatchStores = /* @__PURE__ */ new Map();
  const cachedMatchStores = /* @__PURE__ */ new Map();
  const status = createMutableStore(initialState.status);
  const loadedAt = createMutableStore(initialState.loadedAt);
  const isLoading = createMutableStore(initialState.isLoading);
  const isTransitioning = createMutableStore(initialState.isTransitioning);
  const location = createMutableStore(initialState.location);
  const resolvedLocation = createMutableStore(initialState.resolvedLocation);
  const statusCode = createMutableStore(initialState.statusCode);
  const redirect2 = createMutableStore(initialState.redirect);
  const matchesId = createMutableStore([]);
  const pendingIds = createMutableStore([]);
  const cachedIds = createMutableStore([]);
  const matches = createReadonlyStore(() => readPoolMatches(matchStores, matchesId.get()));
  const pendingMatches = createReadonlyStore(() => readPoolMatches(pendingMatchStores, pendingIds.get()));
  const cachedMatches = createReadonlyStore(() => readPoolMatches(cachedMatchStores, cachedIds.get()));
  const firstId = createReadonlyStore(() => matchesId.get()[0]);
  const hasPending = createReadonlyStore(() => matchesId.get().some((matchId) => {
    return matchStores.get(matchId)?.get().status === "pending";
  }));
  const matchRouteDeps = createReadonlyStore(() => ({
    locationHref: location.get().href,
    resolvedLocationHref: resolvedLocation.get()?.href,
    status: status.get()
  }));
  const __store = createReadonlyStore(() => ({
    status: status.get(),
    loadedAt: loadedAt.get(),
    isLoading: isLoading.get(),
    isTransitioning: isTransitioning.get(),
    matches: matches.get(),
    location: location.get(),
    resolvedLocation: resolvedLocation.get(),
    statusCode: statusCode.get(),
    redirect: redirect2.get()
  }));
  const matchStoreByRouteIdCache = createLRUCache(64);
  function getRouteMatchStore(routeId) {
    let cached = matchStoreByRouteIdCache.get(routeId);
    if (!cached) {
      cached = createReadonlyStore(() => {
        const ids = matchesId.get();
        for (const id of ids) {
          const matchStore = matchStores.get(id);
          if (matchStore && matchStore.routeId === routeId) return matchStore.get();
        }
      });
      matchStoreByRouteIdCache.set(routeId, cached);
    }
    return cached;
  }
  const store = {
    status,
    loadedAt,
    isLoading,
    isTransitioning,
    location,
    resolvedLocation,
    statusCode,
    redirect: redirect2,
    matchesId,
    pendingIds,
    cachedIds,
    matches,
    pendingMatches,
    cachedMatches,
    firstId,
    hasPending,
    matchRouteDeps,
    matchStores,
    pendingMatchStores,
    cachedMatchStores,
    __store,
    getRouteMatchStore,
    setMatches,
    setPending,
    setCached
  };
  setMatches(initialState.matches);
  init?.(store);
  function setMatches(nextMatches) {
    reconcileMatchPool(nextMatches, matchStores, matchesId, createMutableStore, batch);
  }
  function setPending(nextMatches) {
    reconcileMatchPool(nextMatches, pendingMatchStores, pendingIds, createMutableStore, batch);
  }
  function setCached(nextMatches) {
    reconcileMatchPool(nextMatches, cachedMatchStores, cachedIds, createMutableStore, batch);
  }
  return store;
}
function readPoolMatches(pool, ids) {
  const matches = [];
  for (const id of ids) {
    const matchStore = pool.get(id);
    if (matchStore) matches.push(matchStore.get());
  }
  return matches;
}
function reconcileMatchPool(nextMatches, pool, idStore, createMutableStore, batch) {
  const nextIds = nextMatches.map((d) => d.id);
  const nextIdSet = new Set(nextIds);
  batch(() => {
    for (const id of pool.keys()) if (!nextIdSet.has(id)) pool.delete(id);
    for (const nextMatch of nextMatches) {
      const existing = pool.get(nextMatch.id);
      if (!existing) {
        const matchStore = createMutableStore(nextMatch);
        matchStore.routeId = nextMatch.routeId;
        pool.set(nextMatch.id, matchStore);
        continue;
      }
      existing.routeId = nextMatch.routeId;
      if (existing.get() !== nextMatch) existing.set(nextMatch);
    }
    if (!arraysEqual(idStore.get(), nextIds)) idStore.set(nextIds);
  });
}
var triggerOnReady = (inner) => {
  if (!inner.rendered) {
    inner.rendered = true;
    return inner.onReady?.();
  }
};
var resolvePreload = (inner, matchId) => {
  return !!(inner.preload && !inner.router.stores.matchStores.has(matchId));
};
var buildMatchContext = (inner, index, includeCurrentMatch = true) => {
  const context = { ...inner.router.options.context ?? {} };
  const end = includeCurrentMatch ? index : index - 1;
  for (let i = 0; i <= end; i++) {
    const innerMatch = inner.matches[i];
    if (!innerMatch) continue;
    const m = inner.router.getMatch(innerMatch.id);
    if (!m) continue;
    Object.assign(context, m.__routeContext, m.__beforeLoadContext);
  }
  return context;
};
var getNotFoundBoundaryIndex = (inner, err) => {
  if (!inner.matches.length) return;
  const requestedRouteId = err.routeId;
  const matchedRootIndex = inner.matches.findIndex((m) => m.routeId === inner.router.routeTree.id);
  const rootIndex = matchedRootIndex >= 0 ? matchedRootIndex : 0;
  let startIndex = requestedRouteId ? inner.matches.findIndex((match) => match.routeId === requestedRouteId) : inner.firstBadMatchIndex ?? inner.matches.length - 1;
  if (startIndex < 0) startIndex = rootIndex;
  for (let i = startIndex; i >= 0; i--) {
    const match = inner.matches[i];
    if (inner.router.looseRoutesById[match.routeId].options.notFoundComponent) return i;
  }
  return requestedRouteId ? startIndex : rootIndex;
};
var handleRedirectAndNotFound = (inner, match, err) => {
  if (!isRedirect(err) && !isNotFound(err)) return;
  if (isRedirect(err) && err.redirectHandled && !err.options.reloadDocument) throw err;
  if (match) {
    match._nonReactive.beforeLoadPromise?.resolve();
    match._nonReactive.loaderPromise?.resolve();
    match._nonReactive.beforeLoadPromise = void 0;
    match._nonReactive.loaderPromise = void 0;
    match._nonReactive.error = err;
    inner.updateMatch(match.id, (prev) => ({
      ...prev,
      status: isRedirect(err) ? "redirected" : isNotFound(err) ? "notFound" : prev.status === "pending" ? "success" : prev.status,
      context: buildMatchContext(inner, match.index),
      isFetching: false,
      error: err
    }));
    if (isNotFound(err) && !err.routeId) err.routeId = match.routeId;
    match._nonReactive.loadPromise?.resolve();
  }
  if (isRedirect(err)) {
    inner.rendered = true;
    err.options._fromLocation = inner.location;
    err.redirectHandled = true;
    err = inner.router.resolveRedirect(err);
  }
  throw err;
};
var shouldSkipLoader = (inner, matchId) => {
  const match = inner.router.getMatch(matchId);
  if (!match) return true;
  if (match.ssr === false) return true;
  return false;
};
var syncMatchContext = (inner, matchId, index) => {
  const nextContext = buildMatchContext(inner, index);
  inner.updateMatch(matchId, (prev) => {
    return {
      ...prev,
      context: nextContext
    };
  });
};
var handleSerialError = (inner, index, err, routerCode) => {
  const { id: matchId, routeId } = inner.matches[index];
  const route = inner.router.looseRoutesById[routeId];
  if (err instanceof Promise) throw err;
  err.routerCode = routerCode;
  inner.firstBadMatchIndex ??= index;
  handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), err);
  try {
    route.options.onError?.(err);
  } catch (errorHandlerErr) {
    err = errorHandlerErr;
    handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), err);
  }
  inner.updateMatch(matchId, (prev) => {
    prev._nonReactive.beforeLoadPromise?.resolve();
    prev._nonReactive.beforeLoadPromise = void 0;
    prev._nonReactive.loadPromise?.resolve();
    return {
      ...prev,
      error: err,
      status: "error",
      isFetching: false,
      updatedAt: Date.now(),
      abortController: new AbortController()
    };
  });
  if (!inner.preload && !isRedirect(err) && !isNotFound(err)) inner.serialError ??= err;
};
var isBeforeLoadSsr = (inner, matchId, index, route) => {
  const existingMatch = inner.router.getMatch(matchId);
  const parentMatchId = inner.matches[index - 1]?.id;
  const parentMatch = parentMatchId ? inner.router.getMatch(parentMatchId) : void 0;
  if (inner.router.isShell()) {
    existingMatch.ssr = route.id === rootRouteId;
    return;
  }
  if (parentMatch?.ssr === false) {
    existingMatch.ssr = false;
    return;
  }
  const parentOverride = (tempSsr2) => {
    if (tempSsr2 === true && parentMatch?.ssr === "data-only") return "data-only";
    return tempSsr2;
  };
  const defaultSsr = inner.router.options.defaultSsr ?? true;
  if (route.options.ssr === void 0) {
    existingMatch.ssr = parentOverride(defaultSsr);
    return;
  }
  if (typeof route.options.ssr !== "function") {
    existingMatch.ssr = parentOverride(route.options.ssr);
    return;
  }
  const { search, params } = existingMatch;
  const ssrFnContext = {
    search: makeMaybe(search, existingMatch.searchError),
    params: makeMaybe(params, existingMatch.paramsError),
    location: inner.location,
    matches: inner.matches.map((match) => ({
      index: match.index,
      pathname: match.pathname,
      fullPath: match.fullPath,
      staticData: match.staticData,
      id: match.id,
      routeId: match.routeId,
      search: makeMaybe(match.search, match.searchError),
      params: makeMaybe(match.params, match.paramsError),
      ssr: match.ssr
    }))
  };
  const tempSsr = route.options.ssr(ssrFnContext);
  if (isPromise(tempSsr)) return tempSsr.then((ssr) => {
    existingMatch.ssr = parentOverride(ssr ?? defaultSsr);
  });
  existingMatch.ssr = parentOverride(tempSsr ?? defaultSsr);
};
var setupPendingTimeout = (inner, matchId, route, match) => {
  if (match._nonReactive.pendingTimeout !== void 0) return;
  const pendingMs = route.options.pendingMs ?? inner.router.options.defaultPendingMs;
  if (!!(inner.onReady && false)) {
    const pendingTimeout = setTimeout(() => {
      triggerOnReady(inner);
    }, pendingMs);
    match._nonReactive.pendingTimeout = pendingTimeout;
  }
};
var preBeforeLoadSetup = (inner, matchId, route) => {
  const existingMatch = inner.router.getMatch(matchId);
  if (!existingMatch._nonReactive.beforeLoadPromise && !existingMatch._nonReactive.loaderPromise) return;
  setupPendingTimeout(inner, matchId, route, existingMatch);
  const then = () => {
    const match = inner.router.getMatch(matchId);
    if (match.preload && (match.status === "redirected" || match.status === "notFound")) handleRedirectAndNotFound(inner, match, match.error);
  };
  return existingMatch._nonReactive.beforeLoadPromise ? existingMatch._nonReactive.beforeLoadPromise.then(then) : then();
};
var executeBeforeLoad = (inner, matchId, index, route) => {
  const match = inner.router.getMatch(matchId);
  let prevLoadPromise = match._nonReactive.loadPromise;
  match._nonReactive.loadPromise = createControlledPromise(() => {
    prevLoadPromise?.resolve();
    prevLoadPromise = void 0;
  });
  const { paramsError, searchError } = match;
  if (paramsError) handleSerialError(inner, index, paramsError, "PARSE_PARAMS");
  if (searchError) handleSerialError(inner, index, searchError, "VALIDATE_SEARCH");
  setupPendingTimeout(inner, matchId, route, match);
  const abortController = new AbortController();
  let isPending = false;
  const pending = () => {
    if (isPending) return;
    isPending = true;
    inner.updateMatch(matchId, (prev) => ({
      ...prev,
      isFetching: "beforeLoad",
      fetchCount: prev.fetchCount + 1,
      abortController
    }));
  };
  const resolve = () => {
    match._nonReactive.beforeLoadPromise?.resolve();
    match._nonReactive.beforeLoadPromise = void 0;
    inner.updateMatch(matchId, (prev) => ({
      ...prev,
      isFetching: false
    }));
  };
  if (!route.options.beforeLoad) {
    inner.router.batch(() => {
      pending();
      resolve();
    });
    return;
  }
  match._nonReactive.beforeLoadPromise = createControlledPromise();
  const context = {
    ...buildMatchContext(inner, index, false),
    ...match.__routeContext
  };
  const { search, params, cause } = match;
  const preload = resolvePreload(inner, matchId);
  const beforeLoadFnContext = {
    search,
    abortController,
    params,
    preload,
    context,
    location: inner.location,
    navigate: (opts) => inner.router.navigate({
      ...opts,
      _fromLocation: inner.location
    }),
    buildLocation: inner.router.buildLocation,
    cause: preload ? "preload" : cause,
    matches: inner.matches,
    routeId: route.id,
    ...inner.router.options.additionalContext
  };
  const updateContext = (beforeLoadContext2) => {
    if (beforeLoadContext2 === void 0) {
      inner.router.batch(() => {
        pending();
        resolve();
      });
      return;
    }
    if (isRedirect(beforeLoadContext2) || isNotFound(beforeLoadContext2)) {
      pending();
      handleSerialError(inner, index, beforeLoadContext2, "BEFORE_LOAD");
    }
    inner.router.batch(() => {
      pending();
      inner.updateMatch(matchId, (prev) => ({
        ...prev,
        __beforeLoadContext: beforeLoadContext2
      }));
      resolve();
    });
  };
  let beforeLoadContext;
  try {
    beforeLoadContext = route.options.beforeLoad(beforeLoadFnContext);
    if (isPromise(beforeLoadContext)) {
      pending();
      return beforeLoadContext.catch((err) => {
        handleSerialError(inner, index, err, "BEFORE_LOAD");
      }).then(updateContext);
    }
  } catch (err) {
    pending();
    handleSerialError(inner, index, err, "BEFORE_LOAD");
  }
  updateContext(beforeLoadContext);
};
var handleBeforeLoad = (inner, index) => {
  const { id: matchId, routeId } = inner.matches[index];
  const route = inner.router.looseRoutesById[routeId];
  const serverSsr = () => {
    {
      const maybePromise = isBeforeLoadSsr(inner, matchId, index, route);
      if (isPromise(maybePromise)) return maybePromise.then(queueExecution);
    }
    return queueExecution();
  };
  const execute = () => executeBeforeLoad(inner, matchId, index, route);
  const queueExecution = () => {
    if (shouldSkipLoader(inner, matchId)) return;
    const result = preBeforeLoadSetup(inner, matchId, route);
    return isPromise(result) ? result.then(execute) : execute();
  };
  return serverSsr();
};
var executeHead = (inner, matchId, route) => {
  const match = inner.router.getMatch(matchId);
  if (!match) return;
  if (!route.options.head && !route.options.scripts && !route.options.headers) return;
  const assetContext = {
    ssr: inner.router.options.ssr,
    matches: inner.matches,
    match,
    params: match.params,
    loaderData: match.loaderData
  };
  return Promise.all([
    route.options.head?.(assetContext),
    route.options.scripts?.(assetContext),
    route.options.headers?.(assetContext)
  ]).then(([headFnContent, scripts, headers]) => {
    return {
      meta: headFnContent?.meta,
      links: headFnContent?.links,
      headScripts: headFnContent?.scripts,
      headers,
      scripts,
      styles: headFnContent?.styles
    };
  });
};
var getLoaderContext = (inner, matchPromises, matchId, index, route) => {
  const parentMatchPromise = matchPromises[index - 1];
  const { params, loaderDeps, abortController, cause } = inner.router.getMatch(matchId);
  const context = buildMatchContext(inner, index);
  const preload = resolvePreload(inner, matchId);
  return {
    params,
    deps: loaderDeps,
    preload: !!preload,
    parentMatchPromise,
    abortController,
    context,
    location: inner.location,
    navigate: (opts) => inner.router.navigate({
      ...opts,
      _fromLocation: inner.location
    }),
    cause: preload ? "preload" : cause,
    route,
    ...inner.router.options.additionalContext
  };
};
var runLoader = async (inner, matchPromises, matchId, index, route) => {
  try {
    const match = inner.router.getMatch(matchId);
    try {
      if (!(isServer ?? inner.router.isServer) || match.ssr === true) loadRouteChunk(route);
      const routeLoader = route.options.loader;
      const loader = typeof routeLoader === "function" ? routeLoader : routeLoader?.handler;
      const loaderResult = loader?.(getLoaderContext(inner, matchPromises, matchId, index, route));
      const loaderResultIsPromise = !!loader && isPromise(loaderResult);
      if (!!(loaderResultIsPromise || route._lazyPromise || route._componentsPromise || route.options.head || route.options.scripts || route.options.headers || match._nonReactive.minPendingPromise)) inner.updateMatch(matchId, (prev) => ({
        ...prev,
        isFetching: "loader"
      }));
      if (loader) {
        const loaderData = loaderResultIsPromise ? await loaderResult : loaderResult;
        handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), loaderData);
        if (loaderData !== void 0) inner.updateMatch(matchId, (prev) => ({
          ...prev,
          loaderData
        }));
      }
      if (route._lazyPromise) await route._lazyPromise;
      const pendingPromise = match._nonReactive.minPendingPromise;
      if (pendingPromise) await pendingPromise;
      if (route._componentsPromise) await route._componentsPromise;
      inner.updateMatch(matchId, (prev) => ({
        ...prev,
        error: void 0,
        context: buildMatchContext(inner, index),
        status: "success",
        isFetching: false,
        updatedAt: Date.now()
      }));
    } catch (e) {
      let error = e;
      if (error?.name === "AbortError") {
        if (match.abortController.signal.aborted) {
          match._nonReactive.loaderPromise?.resolve();
          match._nonReactive.loaderPromise = void 0;
          return;
        }
        inner.updateMatch(matchId, (prev) => ({
          ...prev,
          status: prev.status === "pending" ? "success" : prev.status,
          isFetching: false,
          context: buildMatchContext(inner, index)
        }));
        return;
      }
      const pendingPromise = match._nonReactive.minPendingPromise;
      if (pendingPromise) await pendingPromise;
      if (isNotFound(e)) await route.options.notFoundComponent?.preload?.();
      handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), e);
      try {
        route.options.onError?.(e);
      } catch (onErrorError) {
        error = onErrorError;
        handleRedirectAndNotFound(inner, inner.router.getMatch(matchId), onErrorError);
      }
      if (!isRedirect(error) && !isNotFound(error)) await loadRouteChunk(route, ["errorComponent"]);
      inner.updateMatch(matchId, (prev) => ({
        ...prev,
        error,
        context: buildMatchContext(inner, index),
        status: "error",
        isFetching: false
      }));
    }
  } catch (err) {
    const match = inner.router.getMatch(matchId);
    if (match) match._nonReactive.loaderPromise = void 0;
    handleRedirectAndNotFound(inner, match, err);
  }
};
var loadRouteMatch = async (inner, matchPromises, index) => {
  async function handleLoader(preload, prevMatch, previousRouteMatchId, match2, route2) {
    const age = Date.now() - prevMatch.updatedAt;
    const staleAge = preload ? route2.options.preloadStaleTime ?? inner.router.options.defaultPreloadStaleTime ?? 3e4 : route2.options.staleTime ?? inner.router.options.defaultStaleTime ?? 0;
    const shouldReloadOption = route2.options.shouldReload;
    const shouldReload = typeof shouldReloadOption === "function" ? shouldReloadOption(getLoaderContext(inner, matchPromises, matchId, index, route2)) : shouldReloadOption;
    const { status, invalid } = match2;
    const staleMatchShouldReload = age >= staleAge && (!!inner.forceStaleReload || match2.cause === "enter" || previousRouteMatchId !== void 0 && previousRouteMatchId !== match2.id);
    loaderShouldRunAsync = status === "success" && (invalid || (shouldReload ?? staleMatchShouldReload));
    if (preload && route2.options.preload === false) ;
    else if (loaderShouldRunAsync && !inner.sync && shouldReloadInBackground) {
      loaderIsRunningAsync = true;
      (async () => {
        try {
          await runLoader(inner, matchPromises, matchId, index, route2);
          const match3 = inner.router.getMatch(matchId);
          match3._nonReactive.loaderPromise?.resolve();
          match3._nonReactive.loadPromise?.resolve();
          match3._nonReactive.loaderPromise = void 0;
          match3._nonReactive.loadPromise = void 0;
        } catch (err) {
          if (isRedirect(err)) await inner.router.navigate(err.options);
        }
      })();
    } else if (status !== "success" || loaderShouldRunAsync) await runLoader(inner, matchPromises, matchId, index, route2);
    else syncMatchContext(inner, matchId, index);
  }
  const { id: matchId, routeId } = inner.matches[index];
  let loaderShouldRunAsync = false;
  let loaderIsRunningAsync = false;
  const route = inner.router.looseRoutesById[routeId];
  const routeLoader = route.options.loader;
  const shouldReloadInBackground = ((typeof routeLoader === "function" ? void 0 : routeLoader?.staleReloadMode) ?? inner.router.options.defaultStaleReloadMode) !== "blocking";
  if (shouldSkipLoader(inner, matchId)) {
    if (!inner.router.getMatch(matchId)) return inner.matches[index];
    syncMatchContext(inner, matchId, index);
    return inner.router.getMatch(matchId);
  } else {
    const prevMatch = inner.router.getMatch(matchId);
    const activeIdAtIndex = inner.router.stores.matchesId.get()[index];
    const previousRouteMatchId = (activeIdAtIndex && inner.router.stores.matchStores.get(activeIdAtIndex) || null)?.routeId === routeId ? activeIdAtIndex : inner.router.stores.matches.get().find((d) => d.routeId === routeId)?.id;
    const preload = resolvePreload(inner, matchId);
    if (prevMatch._nonReactive.loaderPromise) {
      if (prevMatch.status === "success" && !inner.sync && !prevMatch.preload && shouldReloadInBackground) return prevMatch;
      await prevMatch._nonReactive.loaderPromise;
      const match2 = inner.router.getMatch(matchId);
      const error = match2._nonReactive.error || match2.error;
      if (error) handleRedirectAndNotFound(inner, match2, error);
      if (match2.status === "pending") await handleLoader(preload, prevMatch, previousRouteMatchId, match2, route);
    } else {
      const nextPreload = preload && !inner.router.stores.matchStores.has(matchId);
      const match2 = inner.router.getMatch(matchId);
      match2._nonReactive.loaderPromise = createControlledPromise();
      if (nextPreload !== match2.preload) inner.updateMatch(matchId, (prev) => ({
        ...prev,
        preload: nextPreload
      }));
      await handleLoader(preload, prevMatch, previousRouteMatchId, match2, route);
    }
  }
  const match = inner.router.getMatch(matchId);
  if (!loaderIsRunningAsync) {
    match._nonReactive.loaderPromise?.resolve();
    match._nonReactive.loadPromise?.resolve();
    match._nonReactive.loadPromise = void 0;
  }
  clearTimeout(match._nonReactive.pendingTimeout);
  match._nonReactive.pendingTimeout = void 0;
  if (!loaderIsRunningAsync) match._nonReactive.loaderPromise = void 0;
  match._nonReactive.dehydrated = void 0;
  const nextIsFetching = loaderIsRunningAsync ? match.isFetching : false;
  if (nextIsFetching !== match.isFetching || match.invalid !== false) {
    inner.updateMatch(matchId, (prev) => ({
      ...prev,
      isFetching: nextIsFetching,
      invalid: false
    }));
    return inner.router.getMatch(matchId);
  } else return match;
};
async function loadMatches(arg) {
  const inner = arg;
  const matchPromises = [];
  let beforeLoadNotFound;
  for (let i = 0; i < inner.matches.length; i++) {
    try {
      const beforeLoad = handleBeforeLoad(inner, i);
      if (isPromise(beforeLoad)) await beforeLoad;
    } catch (err) {
      if (isRedirect(err)) throw err;
      if (isNotFound(err)) beforeLoadNotFound = err;
      else if (!inner.preload) throw err;
      break;
    }
    if (inner.serialError || inner.firstBadMatchIndex != null) break;
  }
  const baseMaxIndexExclusive = inner.firstBadMatchIndex ?? inner.matches.length;
  const boundaryIndex = beforeLoadNotFound && !inner.preload ? getNotFoundBoundaryIndex(inner, beforeLoadNotFound) : void 0;
  const maxIndexExclusive = beforeLoadNotFound && inner.preload ? 0 : boundaryIndex !== void 0 ? Math.min(boundaryIndex + 1, baseMaxIndexExclusive) : baseMaxIndexExclusive;
  let firstNotFound;
  let firstUnhandledRejection;
  for (let i = 0; i < maxIndexExclusive; i++) matchPromises.push(loadRouteMatch(inner, matchPromises, i));
  try {
    await Promise.all(matchPromises);
  } catch {
    const settled = await Promise.allSettled(matchPromises);
    for (const result of settled) {
      if (result.status !== "rejected") continue;
      const reason = result.reason;
      if (isRedirect(reason)) throw reason;
      if (isNotFound(reason)) firstNotFound ??= reason;
      else firstUnhandledRejection ??= reason;
    }
    if (firstUnhandledRejection !== void 0) throw firstUnhandledRejection;
  }
  const notFoundToThrow = firstNotFound ?? (beforeLoadNotFound && !inner.preload ? beforeLoadNotFound : void 0);
  let headMaxIndex = inner.firstBadMatchIndex !== void 0 ? inner.firstBadMatchIndex : inner.matches.length - 1;
  if (!notFoundToThrow && beforeLoadNotFound && inner.preload) return inner.matches;
  if (notFoundToThrow) {
    const renderedBoundaryIndex = getNotFoundBoundaryIndex(inner, notFoundToThrow);
    if (renderedBoundaryIndex === void 0) {
      invariant();
    }
    const boundaryMatch = inner.matches[renderedBoundaryIndex];
    const boundaryRoute = inner.router.looseRoutesById[boundaryMatch.routeId];
    const defaultNotFoundComponent = inner.router.options?.defaultNotFoundComponent;
    if (!boundaryRoute.options.notFoundComponent && defaultNotFoundComponent) boundaryRoute.options.notFoundComponent = defaultNotFoundComponent;
    notFoundToThrow.routeId = boundaryMatch.routeId;
    const boundaryIsRoot = boundaryMatch.routeId === inner.router.routeTree.id;
    inner.updateMatch(boundaryMatch.id, (prev) => ({
      ...prev,
      ...boundaryIsRoot ? {
        status: "success",
        globalNotFound: true,
        error: void 0
      } : {
        status: "notFound",
        error: notFoundToThrow
      },
      isFetching: false
    }));
    headMaxIndex = renderedBoundaryIndex;
    await loadRouteChunk(boundaryRoute, ["notFoundComponent"]);
  } else if (!inner.preload) {
    const rootMatch = inner.matches[0];
    if (!rootMatch.globalNotFound) {
      if (inner.router.getMatch(rootMatch.id)?.globalNotFound) inner.updateMatch(rootMatch.id, (prev) => ({
        ...prev,
        globalNotFound: false,
        error: void 0
      }));
    }
  }
  if (inner.serialError && inner.firstBadMatchIndex !== void 0) {
    const errorRoute = inner.router.looseRoutesById[inner.matches[inner.firstBadMatchIndex].routeId];
    await loadRouteChunk(errorRoute, ["errorComponent"]);
  }
  for (let i = 0; i <= headMaxIndex; i++) {
    const { id: matchId, routeId } = inner.matches[i];
    const route = inner.router.looseRoutesById[routeId];
    try {
      const headResult = executeHead(inner, matchId, route);
      if (headResult) {
        const head = await headResult;
        inner.updateMatch(matchId, (prev) => ({
          ...prev,
          ...head
        }));
      }
    } catch (err) {
      console.error(`Error executing head for route ${routeId}:`, err);
    }
  }
  const readyPromise = triggerOnReady(inner);
  if (isPromise(readyPromise)) await readyPromise;
  if (notFoundToThrow) throw notFoundToThrow;
  if (inner.serialError && !inner.preload && !inner.onReady) throw inner.serialError;
  return inner.matches;
}
function preloadRouteComponents(route, componentTypesToLoad) {
  const preloads = componentTypesToLoad.map((type) => route.options[type]?.preload?.()).filter(Boolean);
  if (preloads.length === 0) return void 0;
  return Promise.all(preloads);
}
function loadRouteChunk(route, componentTypesToLoad = componentTypes) {
  if (!route._lazyLoaded && route._lazyPromise === void 0) if (route.lazyFn) route._lazyPromise = route.lazyFn().then((lazyRoute) => {
    const { id: _id, ...options } = lazyRoute.options;
    Object.assign(route.options, options);
    route._lazyLoaded = true;
    route._lazyPromise = void 0;
  });
  else route._lazyLoaded = true;
  const runAfterLazy = () => route._componentsLoaded ? void 0 : componentTypesToLoad === componentTypes ? (() => {
    if (route._componentsPromise === void 0) {
      const componentsPromise = preloadRouteComponents(route, componentTypes);
      if (componentsPromise) route._componentsPromise = componentsPromise.then(() => {
        route._componentsLoaded = true;
        route._componentsPromise = void 0;
      });
      else route._componentsLoaded = true;
    }
    return route._componentsPromise;
  })() : preloadRouteComponents(route, componentTypesToLoad);
  return route._lazyPromise ? route._lazyPromise.then(runAfterLazy) : runAfterLazy();
}
function makeMaybe(value, error) {
  if (error) return {
    status: "error",
    error
  };
  return {
    status: "success",
    value
  };
}
function routeNeedsPreload(route) {
  for (const componentType of componentTypes) if (route.options[componentType]?.preload) return true;
  return false;
}
var componentTypes = [
  "component",
  "errorComponent",
  "pendingComponent",
  "notFoundComponent"
];
function getLocationChangeInfo(location, resolvedLocation) {
  const fromLocation = resolvedLocation;
  const toLocation = location;
  return {
    fromLocation,
    toLocation,
    pathChanged: fromLocation?.pathname !== toLocation.pathname,
    hrefChanged: fromLocation?.href !== toLocation.href,
    hashChanged: fromLocation?.hash !== toLocation.hash
  };
}
var RouterCore = class {
  /**
  * @deprecated Use the `createRouter` function instead
  */
  constructor(options, getStoreConfig) {
    this.tempLocationKey = `${Math.round(Math.random() * 1e7)}`;
    this.resetNextScroll = true;
    this.shouldViewTransition = void 0;
    this.isViewTransitionTypesSupported = void 0;
    this.subscribers = /* @__PURE__ */ new Set();
    this.isScrollRestoring = false;
    this.isScrollRestorationSetup = false;
    this.startTransition = (fn) => fn();
    this.update = (newOptions) => {
      const prevOptions = this.options;
      const prevBasepath = this.basepath ?? prevOptions?.basepath ?? "/";
      const basepathWasUnset = this.basepath === void 0;
      const prevRewriteOption = prevOptions?.rewrite;
      this.options = {
        ...prevOptions,
        ...newOptions
      };
      this.isServer = this.options.isServer ?? typeof document === "undefined";
      this.protocolAllowlist = new Set(this.options.protocolAllowlist);
      if (this.options.pathParamsAllowedCharacters) this.pathParamsDecoder = compileDecodeCharMap(this.options.pathParamsAllowedCharacters);
      if (!this.history || this.options.history && this.options.history !== this.history) if (!this.options.history) ;
      else this.history = this.options.history;
      this.origin = this.options.origin;
      if (!this.origin) this.origin = "http://localhost";
      if (this.history) this.updateLatestLocation();
      if (this.options.routeTree !== this.routeTree) {
        this.routeTree = this.options.routeTree;
        let processRouteTreeResult;
        if (globalThis.__TSR_CACHE__ && globalThis.__TSR_CACHE__.routeTree === this.routeTree) {
          const cached = globalThis.__TSR_CACHE__;
          this.resolvePathCache = cached.resolvePathCache;
          processRouteTreeResult = cached.processRouteTreeResult;
        } else {
          this.resolvePathCache = createLRUCache(1e3);
          processRouteTreeResult = this.buildRouteTree();
          if (globalThis.__TSR_CACHE__ === void 0) globalThis.__TSR_CACHE__ = {
            routeTree: this.routeTree,
            processRouteTreeResult,
            resolvePathCache: this.resolvePathCache
          };
        }
        this.setRoutes(processRouteTreeResult);
      }
      if (!this.stores && this.latestLocation) {
        const config = this.getStoreConfig(this);
        this.batch = config.batch;
        this.stores = createRouterStores(getInitialRouterState(this.latestLocation), config);
      }
      let needsLocationUpdate = false;
      const nextBasepath = this.options.basepath ?? "/";
      const nextRewriteOption = this.options.rewrite;
      if (basepathWasUnset || prevBasepath !== nextBasepath || prevRewriteOption !== nextRewriteOption) {
        this.basepath = nextBasepath;
        const rewrites = [];
        const trimmed = trimPath(nextBasepath);
        if (trimmed && trimmed !== "/") rewrites.push(rewriteBasepath({ basepath: nextBasepath }));
        if (nextRewriteOption) rewrites.push(nextRewriteOption);
        this.rewrite = rewrites.length === 0 ? void 0 : rewrites.length === 1 ? rewrites[0] : composeRewrites(rewrites);
        if (this.history) this.updateLatestLocation();
        needsLocationUpdate = true;
      }
      if (needsLocationUpdate && this.stores) this.stores.location.set(this.latestLocation);
      if (typeof window !== "undefined" && "CSS" in window && typeof window.CSS?.supports === "function") this.isViewTransitionTypesSupported = window.CSS.supports("selector(:active-view-transition-type(a)");
    };
    this.updateLatestLocation = () => {
      this.latestLocation = this.parseLocation(this.history.location, this.latestLocation);
    };
    this.buildRouteTree = () => {
      const result = processRouteTree(this.routeTree, this.options.caseSensitive, (route, i) => {
        route.init({ originalIndex: i });
      });
      if (this.options.routeMasks) processRouteMasks(this.options.routeMasks, result.processedTree);
      return result;
    };
    this.subscribe = (eventType, fn) => {
      const listener = {
        eventType,
        fn
      };
      this.subscribers.add(listener);
      return () => {
        this.subscribers.delete(listener);
      };
    };
    this.emit = (routerEvent) => {
      this.subscribers.forEach((listener) => {
        if (listener.eventType === routerEvent.type) listener.fn(routerEvent);
      });
    };
    this.parseLocation = (locationToParse, previousLocation) => {
      const parse = ({ pathname, search, hash, href, state }) => {
        if (!this.rewrite && !/[ \x00-\x1f\x7f\u0080-\uffff]/.test(pathname)) {
          const parsedSearch2 = this.options.parseSearch(search);
          const searchStr2 = this.options.stringifySearch(parsedSearch2);
          return {
            href: pathname + searchStr2 + hash,
            publicHref: pathname + searchStr2 + hash,
            pathname: decodePath(pathname).path,
            external: false,
            searchStr: searchStr2,
            search: nullReplaceEqualDeep(previousLocation?.search, parsedSearch2),
            hash: decodePath(hash.slice(1)).path,
            state: replaceEqualDeep(previousLocation?.state, state)
          };
        }
        const fullUrl = new URL(href, this.origin);
        const url = executeRewriteInput(this.rewrite, fullUrl);
        const parsedSearch = this.options.parseSearch(url.search);
        const searchStr = this.options.stringifySearch(parsedSearch);
        url.search = searchStr;
        return {
          href: url.href.replace(url.origin, ""),
          publicHref: href,
          pathname: decodePath(url.pathname).path,
          external: !!this.rewrite && url.origin !== this.origin,
          searchStr,
          search: nullReplaceEqualDeep(previousLocation?.search, parsedSearch),
          hash: decodePath(url.hash.slice(1)).path,
          state: replaceEqualDeep(previousLocation?.state, state)
        };
      };
      const location = parse(locationToParse);
      const { __tempLocation, __tempKey } = location.state;
      if (__tempLocation && (!__tempKey || __tempKey === this.tempLocationKey)) {
        const parsedTempLocation = parse(__tempLocation);
        parsedTempLocation.state.key = location.state.key;
        parsedTempLocation.state.__TSR_key = location.state.__TSR_key;
        delete parsedTempLocation.state.__tempLocation;
        return {
          ...parsedTempLocation,
          maskedLocation: location
        };
      }
      return location;
    };
    this.resolvePathWithBase = (from, path) => {
      return resolvePath({
        base: from,
        to: cleanPath(path),
        trailingSlash: this.options.trailingSlash,
        cache: this.resolvePathCache
      });
    };
    this.matchRoutes = (pathnameOrNext, locationSearchOrOpts, opts) => {
      if (typeof pathnameOrNext === "string") return this.matchRoutesInternal({
        pathname: pathnameOrNext,
        search: locationSearchOrOpts
      }, opts);
      return this.matchRoutesInternal(pathnameOrNext, locationSearchOrOpts);
    };
    this.getMatchedRoutes = (pathname) => {
      return getMatchedRoutes({
        pathname,
        routesById: this.routesById,
        processedTree: this.processedTree
      });
    };
    this.cancelMatch = (id) => {
      const match = this.getMatch(id);
      if (!match) return;
      match.abortController.abort();
      clearTimeout(match._nonReactive.pendingTimeout);
      match._nonReactive.pendingTimeout = void 0;
    };
    this.cancelMatches = () => {
      this.stores.pendingIds.get().forEach((matchId) => {
        this.cancelMatch(matchId);
      });
      this.stores.matchesId.get().forEach((matchId) => {
        if (this.stores.pendingMatchStores.has(matchId)) return;
        const match = this.stores.matchStores.get(matchId)?.get();
        if (!match) return;
        if (match.status === "pending" || match.isFetching === "loader") this.cancelMatch(matchId);
      });
    };
    this.buildLocation = (opts) => {
      const build = (dest = {}) => {
        const currentLocation = dest._fromLocation || this.pendingBuiltLocation || this.latestLocation;
        const lightweightResult = this.matchRoutesLightweight(currentLocation);
        if (dest.from && false) ;
        const defaultedFromPath = dest.unsafeRelative === "path" ? currentLocation.pathname : dest.from ?? lightweightResult.fullPath;
        const fromPath = this.resolvePathWithBase(defaultedFromPath, ".");
        const fromSearch = lightweightResult.search;
        const fromParams = Object.assign(/* @__PURE__ */ Object.create(null), lightweightResult.params);
        const nextTo = dest.to ? this.resolvePathWithBase(fromPath, `${dest.to}`) : this.resolvePathWithBase(fromPath, ".");
        const nextParams = dest.params === false || dest.params === null ? /* @__PURE__ */ Object.create(null) : (dest.params ?? true) === true ? fromParams : Object.assign(fromParams, functionalUpdate(dest.params, fromParams));
        const destMatchResult = this.getMatchedRoutes(nextTo);
        let destRoutes = destMatchResult.matchedRoutes;
        if ((!destMatchResult.foundRoute || destMatchResult.foundRoute.path !== "/" && destMatchResult.routeParams["**"]) && this.options.notFoundRoute) destRoutes = [...destRoutes, this.options.notFoundRoute];
        if (Object.keys(nextParams).length > 0) for (const route of destRoutes) {
          const fn = route.options.params?.stringify ?? route.options.stringifyParams;
          if (fn) try {
            Object.assign(nextParams, fn(nextParams));
          } catch {
          }
        }
        const nextPathname = opts.leaveParams ? nextTo : decodePath(interpolatePath({
          path: nextTo,
          params: nextParams,
          decoder: this.pathParamsDecoder,
          server: this.isServer
        }).interpolatedPath).path;
        let nextSearch = fromSearch;
        if (opts._includeValidateSearch && this.options.search?.strict) {
          const validatedSearch = {};
          destRoutes.forEach((route) => {
            if (route.options.validateSearch) try {
              Object.assign(validatedSearch, validateSearch(route.options.validateSearch, {
                ...validatedSearch,
                ...nextSearch
              }));
            } catch {
            }
          });
          nextSearch = validatedSearch;
        }
        nextSearch = applySearchMiddleware({
          search: nextSearch,
          dest,
          destRoutes,
          _includeValidateSearch: opts._includeValidateSearch
        });
        nextSearch = nullReplaceEqualDeep(fromSearch, nextSearch);
        const searchStr = this.options.stringifySearch(nextSearch);
        const hash = dest.hash === true ? currentLocation.hash : dest.hash ? functionalUpdate(dest.hash, currentLocation.hash) : void 0;
        const hashStr = hash ? `#${hash}` : "";
        let nextState = dest.state === true ? currentLocation.state : dest.state ? functionalUpdate(dest.state, currentLocation.state) : {};
        nextState = replaceEqualDeep(currentLocation.state, nextState);
        const fullPath = `${nextPathname}${searchStr}${hashStr}`;
        let href;
        let publicHref;
        let external = false;
        if (this.rewrite) {
          const url = new URL(fullPath, this.origin);
          const rewrittenUrl = executeRewriteOutput(this.rewrite, url);
          href = url.href.replace(url.origin, "");
          if (rewrittenUrl.origin !== this.origin) {
            publicHref = rewrittenUrl.href;
            external = true;
          } else publicHref = rewrittenUrl.pathname + rewrittenUrl.search + rewrittenUrl.hash;
        } else {
          href = encodePathLikeUrl(fullPath);
          publicHref = href;
        }
        return {
          publicHref,
          href,
          pathname: nextPathname,
          search: nextSearch,
          searchStr,
          state: nextState,
          hash: hash ?? "",
          external,
          unmaskOnReload: dest.unmaskOnReload
        };
      };
      const buildWithMatches = (dest = {}, maskedDest) => {
        const next = build(dest);
        let maskedNext = maskedDest ? build(maskedDest) : void 0;
        if (!maskedNext) {
          const params = /* @__PURE__ */ Object.create(null);
          if (this.options.routeMasks) {
            const match = findFlatMatch(next.pathname, this.processedTree);
            if (match) {
              Object.assign(params, match.rawParams);
              const { from: _from, params: maskParams, ...maskProps } = match.route;
              const nextParams = maskParams === false || maskParams === null ? /* @__PURE__ */ Object.create(null) : (maskParams ?? true) === true ? params : Object.assign(params, functionalUpdate(maskParams, params));
              maskedDest = {
                from: opts.from,
                ...maskProps,
                params: nextParams
              };
              maskedNext = build(maskedDest);
            }
          }
        }
        if (maskedNext) next.maskedLocation = maskedNext;
        return next;
      };
      if (opts.mask) return buildWithMatches(opts, {
        from: opts.from,
        ...opts.mask
      });
      return buildWithMatches(opts);
    };
    this.commitLocation = async ({ viewTransition, ignoreBlocker, ...next }) => {
      const isSameState = () => {
        const ignoredProps = [
          "key",
          "__TSR_key",
          "__TSR_index",
          "__hashScrollIntoViewOptions"
        ];
        ignoredProps.forEach((prop) => {
          next.state[prop] = this.latestLocation.state[prop];
        });
        const isEqual = deepEqual(next.state, this.latestLocation.state);
        ignoredProps.forEach((prop) => {
          delete next.state[prop];
        });
        return isEqual;
      };
      const isSameUrl = trimPathRight(this.latestLocation.href) === trimPathRight(next.href);
      let previousCommitPromise = this.commitLocationPromise;
      this.commitLocationPromise = createControlledPromise(() => {
        previousCommitPromise?.resolve();
        previousCommitPromise = void 0;
      });
      if (isSameUrl && isSameState()) this.load();
      else {
        let { maskedLocation, hashScrollIntoView, ...nextHistory } = next;
        if (maskedLocation) {
          nextHistory = {
            ...maskedLocation,
            state: {
              ...maskedLocation.state,
              __tempKey: void 0,
              __tempLocation: {
                ...nextHistory,
                search: nextHistory.searchStr,
                state: {
                  ...nextHistory.state,
                  __tempKey: void 0,
                  __tempLocation: void 0,
                  __TSR_key: void 0,
                  key: void 0
                }
              }
            }
          };
          if (nextHistory.unmaskOnReload ?? this.options.unmaskOnReload ?? false) nextHistory.state.__tempKey = this.tempLocationKey;
        }
        nextHistory.state.__hashScrollIntoViewOptions = hashScrollIntoView ?? this.options.defaultHashScrollIntoView ?? true;
        this.shouldViewTransition = viewTransition;
        this.history[next.replace ? "replace" : "push"](nextHistory.publicHref, nextHistory.state, { ignoreBlocker });
      }
      this.resetNextScroll = next.resetScroll ?? true;
      if (!this.history.subscribers.size) this.load();
      return this.commitLocationPromise;
    };
    this.buildAndCommitLocation = ({ replace, resetScroll, hashScrollIntoView, viewTransition, ignoreBlocker, href, ...rest } = {}) => {
      if (href) {
        const currentIndex = this.history.location.state.__TSR_index;
        const parsed = parseHref(href, { __TSR_index: replace ? currentIndex : currentIndex + 1 });
        const hrefUrl = new URL(parsed.pathname, this.origin);
        rest.to = executeRewriteInput(this.rewrite, hrefUrl).pathname;
        rest.search = this.options.parseSearch(parsed.search);
        rest.hash = parsed.hash.slice(1);
      }
      const location = this.buildLocation({
        ...rest,
        _includeValidateSearch: true
      });
      this.pendingBuiltLocation = location;
      const commitPromise = this.commitLocation({
        ...location,
        viewTransition,
        replace,
        resetScroll,
        hashScrollIntoView,
        ignoreBlocker
      });
      Promise.resolve().then(() => {
        if (this.pendingBuiltLocation === location) this.pendingBuiltLocation = void 0;
      });
      return commitPromise;
    };
    this.navigate = async ({ to, reloadDocument, href, publicHref, ...rest }) => {
      let hrefIsUrl = false;
      if (href) try {
        new URL(`${href}`);
        hrefIsUrl = true;
      } catch {
      }
      if (hrefIsUrl && !reloadDocument) reloadDocument = true;
      if (reloadDocument) {
        if (to !== void 0 || !href) {
          const location = this.buildLocation({
            to,
            ...rest
          });
          href = href ?? location.publicHref;
          publicHref = publicHref ?? location.publicHref;
        }
        const reloadHref = !hrefIsUrl && publicHref ? publicHref : href;
        if (isDangerousProtocol(reloadHref, this.protocolAllowlist)) {
          return Promise.resolve();
        }
        if (!rest.ignoreBlocker) {
          const blockers = this.history.getBlockers?.() ?? [];
          for (const blocker of blockers) if (blocker?.blockerFn) {
            if (await blocker.blockerFn({
              currentLocation: this.latestLocation,
              nextLocation: this.latestLocation,
              action: "PUSH"
            })) return Promise.resolve();
          }
        }
        if (rest.replace) window.location.replace(reloadHref);
        else window.location.href = reloadHref;
        return Promise.resolve();
      }
      return this.buildAndCommitLocation({
        ...rest,
        href,
        to,
        _isNavigate: true
      });
    };
    this.beforeLoad = () => {
      this.cancelMatches();
      this.updateLatestLocation();
      {
        const nextLocation = this.buildLocation({
          to: this.latestLocation.pathname,
          search: true,
          params: true,
          hash: true,
          state: true,
          _includeValidateSearch: true
        });
        if (this.latestLocation.publicHref !== nextLocation.publicHref) {
          const href = this.getParsedLocationHref(nextLocation);
          if (nextLocation.external) throw redirect({ href });
          else throw redirect({
            href,
            _builtLocation: nextLocation
          });
        }
      }
      const pendingMatches = this.matchRoutes(this.latestLocation);
      const nextCachedMatches = this.stores.cachedMatches.get().filter((d) => !pendingMatches.some((e) => e.id === d.id));
      this.batch(() => {
        this.stores.status.set("pending");
        this.stores.statusCode.set(200);
        this.stores.isLoading.set(true);
        this.stores.location.set(this.latestLocation);
        this.stores.setPending(pendingMatches);
        this.stores.setCached(nextCachedMatches);
      });
    };
    this.load = async (opts) => {
      let redirect2;
      let notFound2;
      let loadPromise;
      const previousLocation = this.stores.resolvedLocation.get() ?? this.stores.location.get();
      loadPromise = new Promise((resolve) => {
        this.startTransition(async () => {
          try {
            this.beforeLoad();
            const next = this.latestLocation;
            const locationChangeInfo = getLocationChangeInfo(next, this.stores.resolvedLocation.get());
            if (!this.stores.redirect.get()) this.emit({
              type: "onBeforeNavigate",
              ...locationChangeInfo
            });
            this.emit({
              type: "onBeforeLoad",
              ...locationChangeInfo
            });
            await loadMatches({
              router: this,
              sync: opts?.sync,
              forceStaleReload: previousLocation.href === next.href,
              matches: this.stores.pendingMatches.get(),
              location: next,
              updateMatch: this.updateMatch,
              onReady: async () => {
                this.startTransition(() => {
                  this.startViewTransition(async () => {
                    let exitingMatches = null;
                    let hookExitingMatches = null;
                    let hookEnteringMatches = null;
                    let hookStayingMatches = null;
                    this.batch(() => {
                      const pendingMatches = this.stores.pendingMatches.get();
                      const mountPending = pendingMatches.length;
                      const currentMatches = this.stores.matches.get();
                      exitingMatches = mountPending ? currentMatches.filter((match) => !this.stores.pendingMatchStores.has(match.id)) : null;
                      const pendingRouteIds = /* @__PURE__ */ new Set();
                      for (const s of this.stores.pendingMatchStores.values()) if (s.routeId) pendingRouteIds.add(s.routeId);
                      const activeRouteIds = /* @__PURE__ */ new Set();
                      for (const s of this.stores.matchStores.values()) if (s.routeId) activeRouteIds.add(s.routeId);
                      hookExitingMatches = mountPending ? currentMatches.filter((match) => !pendingRouteIds.has(match.routeId)) : null;
                      hookEnteringMatches = mountPending ? pendingMatches.filter((match) => !activeRouteIds.has(match.routeId)) : null;
                      hookStayingMatches = mountPending ? pendingMatches.filter((match) => activeRouteIds.has(match.routeId)) : currentMatches;
                      this.stores.isLoading.set(false);
                      this.stores.loadedAt.set(Date.now());
                      if (mountPending) {
                        this.stores.setMatches(pendingMatches);
                        this.stores.setPending([]);
                        this.stores.setCached([...this.stores.cachedMatches.get(), ...exitingMatches.filter((d) => d.status !== "error" && d.status !== "notFound" && d.status !== "redirected")]);
                        this.clearExpiredCache();
                      }
                    });
                    for (const [matches, hook] of [
                      [hookExitingMatches, "onLeave"],
                      [hookEnteringMatches, "onEnter"],
                      [hookStayingMatches, "onStay"]
                    ]) {
                      if (!matches) continue;
                      for (const match of matches) this.looseRoutesById[match.routeId].options[hook]?.(match);
                    }
                  });
                });
              }
            });
          } catch (err) {
            if (isRedirect(err)) {
              redirect2 = err;
            } else if (isNotFound(err)) notFound2 = err;
            const nextStatusCode = redirect2 ? redirect2.status : notFound2 ? 404 : this.stores.matches.get().some((d) => d.status === "error") ? 500 : 200;
            this.batch(() => {
              this.stores.statusCode.set(nextStatusCode);
              this.stores.redirect.set(redirect2);
            });
          }
          if (this.latestLoadPromise === loadPromise) {
            this.commitLocationPromise?.resolve();
            this.latestLoadPromise = void 0;
            this.commitLocationPromise = void 0;
          }
          resolve();
        });
      });
      this.latestLoadPromise = loadPromise;
      await loadPromise;
      while (this.latestLoadPromise && loadPromise !== this.latestLoadPromise) await this.latestLoadPromise;
      let newStatusCode = void 0;
      if (this.hasNotFoundMatch()) newStatusCode = 404;
      else if (this.stores.matches.get().some((d) => d.status === "error")) newStatusCode = 500;
      if (newStatusCode !== void 0) this.stores.statusCode.set(newStatusCode);
    };
    this.startViewTransition = (fn) => {
      const shouldViewTransition = this.shouldViewTransition ?? this.options.defaultViewTransition;
      this.shouldViewTransition = void 0;
      if (shouldViewTransition && typeof document !== "undefined" && "startViewTransition" in document && typeof document.startViewTransition === "function") {
        let startViewTransitionParams;
        if (typeof shouldViewTransition === "object" && this.isViewTransitionTypesSupported) {
          const next = this.latestLocation;
          const prevLocation = this.stores.resolvedLocation.get();
          const resolvedViewTransitionTypes = typeof shouldViewTransition.types === "function" ? shouldViewTransition.types(getLocationChangeInfo(next, prevLocation)) : shouldViewTransition.types;
          if (resolvedViewTransitionTypes === false) {
            fn();
            return;
          }
          startViewTransitionParams = {
            update: fn,
            types: resolvedViewTransitionTypes
          };
        } else startViewTransitionParams = fn;
        document.startViewTransition(startViewTransitionParams);
      } else fn();
    };
    this.updateMatch = (id, updater) => {
      this.startTransition(() => {
        const pendingMatch = this.stores.pendingMatchStores.get(id);
        if (pendingMatch) {
          pendingMatch.set(updater);
          return;
        }
        const activeMatch = this.stores.matchStores.get(id);
        if (activeMatch) {
          activeMatch.set(updater);
          return;
        }
        const cachedMatch = this.stores.cachedMatchStores.get(id);
        if (cachedMatch) {
          const next = updater(cachedMatch.get());
          if (next.status === "redirected") {
            if (this.stores.cachedMatchStores.delete(id)) this.stores.cachedIds.set((prev) => prev.filter((matchId) => matchId !== id));
          } else cachedMatch.set(next);
        }
      });
    };
    this.getMatch = (matchId) => {
      return this.stores.cachedMatchStores.get(matchId)?.get() ?? this.stores.pendingMatchStores.get(matchId)?.get() ?? this.stores.matchStores.get(matchId)?.get();
    };
    this.invalidate = (opts) => {
      const invalidate = (d) => {
        if (opts?.filter?.(d) ?? true) return {
          ...d,
          invalid: true,
          ...opts?.forcePending || d.status === "error" || d.status === "notFound" ? {
            status: "pending",
            error: void 0
          } : void 0
        };
        return d;
      };
      this.batch(() => {
        this.stores.setMatches(this.stores.matches.get().map(invalidate));
        this.stores.setCached(this.stores.cachedMatches.get().map(invalidate));
        this.stores.setPending(this.stores.pendingMatches.get().map(invalidate));
      });
      this.shouldViewTransition = false;
      return this.load({ sync: opts?.sync });
    };
    this.getParsedLocationHref = (location) => {
      return location.publicHref || "/";
    };
    this.resolveRedirect = (redirect2) => {
      const locationHeader = redirect2.headers.get("Location");
      if (!redirect2.options.href || redirect2.options._builtLocation) {
        const location = redirect2.options._builtLocation ?? this.buildLocation(redirect2.options);
        const href = this.getParsedLocationHref(location);
        redirect2.options.href = href;
        redirect2.headers.set("Location", href);
      } else if (locationHeader) try {
        const url = new URL(locationHeader);
        if (this.origin && url.origin === this.origin) {
          const href = url.pathname + url.search + url.hash;
          redirect2.options.href = href;
          redirect2.headers.set("Location", href);
        }
      } catch {
      }
      if (redirect2.options.href && !redirect2.options._builtLocation && isDangerousProtocol(redirect2.options.href, this.protocolAllowlist)) throw new Error("Redirect blocked: unsafe protocol");
      if (!redirect2.headers.get("Location")) redirect2.headers.set("Location", redirect2.options.href);
      return redirect2;
    };
    this.clearCache = (opts) => {
      const filter = opts?.filter;
      if (filter !== void 0) this.stores.setCached(this.stores.cachedMatches.get().filter((m) => !filter(m)));
      else this.stores.setCached([]);
    };
    this.clearExpiredCache = () => {
      const now = Date.now();
      const filter = (d) => {
        const route = this.looseRoutesById[d.routeId];
        if (!route.options.loader) return true;
        const gcTime = (d.preload ? route.options.preloadGcTime ?? this.options.defaultPreloadGcTime : route.options.gcTime ?? this.options.defaultGcTime) ?? 300 * 1e3;
        if (d.status === "error") return true;
        return now - d.updatedAt >= gcTime;
      };
      this.clearCache({ filter });
    };
    this.loadRouteChunk = loadRouteChunk;
    this.preloadRoute = async (opts) => {
      const next = opts._builtLocation ?? this.buildLocation(opts);
      let matches = this.matchRoutes(next, {
        throwOnError: true,
        preload: true,
        dest: opts
      });
      const activeMatchIds = /* @__PURE__ */ new Set([...this.stores.matchesId.get(), ...this.stores.pendingIds.get()]);
      const loadedMatchIds = /* @__PURE__ */ new Set([...activeMatchIds, ...this.stores.cachedIds.get()]);
      const matchesToCache = matches.filter((match) => !loadedMatchIds.has(match.id));
      if (matchesToCache.length) {
        const cachedMatches = this.stores.cachedMatches.get();
        this.stores.setCached([...cachedMatches, ...matchesToCache]);
      }
      try {
        matches = await loadMatches({
          router: this,
          matches,
          location: next,
          preload: true,
          updateMatch: (id, updater) => {
            if (activeMatchIds.has(id)) matches = matches.map((d) => d.id === id ? updater(d) : d);
            else this.updateMatch(id, updater);
          }
        });
        return matches;
      } catch (err) {
        if (isRedirect(err)) {
          if (err.options.reloadDocument) return;
          return await this.preloadRoute({
            ...err.options,
            _fromLocation: next
          });
        }
        if (!isNotFound(err)) console.error(err);
        return;
      }
    };
    this.matchRoute = (location, opts) => {
      const matchLocation = {
        ...location,
        to: location.to ? this.resolvePathWithBase(location.from || "", location.to) : void 0,
        params: location.params || {},
        leaveParams: true
      };
      const next = this.buildLocation(matchLocation);
      if (opts?.pending && this.stores.status.get() !== "pending") return false;
      const baseLocation = (opts?.pending === void 0 ? !this.stores.isLoading.get() : opts.pending) ? this.latestLocation : this.stores.resolvedLocation.get() || this.stores.location.get();
      const match = findSingleMatch(next.pathname, opts?.caseSensitive ?? false, opts?.fuzzy ?? false, baseLocation.pathname, this.processedTree);
      if (!match) return false;
      if (location.params) {
        if (!deepEqual(match.rawParams, location.params, { partial: true })) return false;
      }
      if (opts?.includeSearch ?? true) return deepEqual(baseLocation.search, next.search, { partial: true }) ? match.rawParams : false;
      return match.rawParams;
    };
    this.hasNotFoundMatch = () => {
      return this.stores.matches.get().some((d) => d.status === "notFound" || d.globalNotFound);
    };
    this.getStoreConfig = getStoreConfig;
    this.update({
      defaultPreloadDelay: 50,
      defaultPendingMs: 1e3,
      defaultPendingMinMs: 500,
      context: void 0,
      ...options,
      caseSensitive: options.caseSensitive ?? false,
      notFoundMode: options.notFoundMode ?? "fuzzy",
      stringifySearch: options.stringifySearch ?? defaultStringifySearch,
      parseSearch: options.parseSearch ?? defaultParseSearch,
      protocolAllowlist: options.protocolAllowlist ?? DEFAULT_PROTOCOL_ALLOWLIST
    });
    if (typeof document !== "undefined") self.__TSR_ROUTER__ = this;
  }
  isShell() {
    return !!this.options.isShell;
  }
  isPrerendering() {
    return !!this.options.isPrerendering;
  }
  get state() {
    return this.stores.__store.get();
  }
  setRoutes({ routesById, routesByPath, processedTree }) {
    this.routesById = routesById;
    this.routesByPath = routesByPath;
    this.processedTree = processedTree;
    const notFoundRoute = this.options.notFoundRoute;
    if (notFoundRoute) {
      notFoundRoute.init({ originalIndex: 99999999999 });
      this.routesById[notFoundRoute.id] = notFoundRoute;
    }
  }
  get looseRoutesById() {
    return this.routesById;
  }
  getParentContext(parentMatch) {
    return !parentMatch?.id ? this.options.context ?? void 0 : parentMatch.context ?? this.options.context ?? void 0;
  }
  matchRoutesInternal(next, opts) {
    const matchedRoutesResult = this.getMatchedRoutes(next.pathname);
    const { foundRoute, routeParams, parsedParams } = matchedRoutesResult;
    let { matchedRoutes } = matchedRoutesResult;
    let isGlobalNotFound = false;
    if (foundRoute ? foundRoute.path !== "/" && routeParams["**"] : trimPathRight(next.pathname)) if (this.options.notFoundRoute) matchedRoutes = [...matchedRoutes, this.options.notFoundRoute];
    else isGlobalNotFound = true;
    const globalNotFoundRouteId = isGlobalNotFound ? findGlobalNotFoundRouteId(this.options.notFoundMode, matchedRoutes) : void 0;
    const matches = new Array(matchedRoutes.length);
    const previousActiveMatchesByRouteId = /* @__PURE__ */ new Map();
    for (const store of this.stores.matchStores.values()) if (store.routeId) previousActiveMatchesByRouteId.set(store.routeId, store.get());
    for (let index = 0; index < matchedRoutes.length; index++) {
      const route = matchedRoutes[index];
      const parentMatch = matches[index - 1];
      let preMatchSearch;
      let strictMatchSearch;
      let searchError;
      {
        const parentSearch = parentMatch?.search ?? next.search;
        const parentStrictSearch = parentMatch?._strictSearch ?? void 0;
        try {
          const strictSearch = validateSearch(route.options.validateSearch, { ...parentSearch }) ?? void 0;
          preMatchSearch = {
            ...parentSearch,
            ...strictSearch
          };
          strictMatchSearch = {
            ...parentStrictSearch,
            ...strictSearch
          };
          searchError = void 0;
        } catch (err) {
          let searchParamError = err;
          if (!(err instanceof SearchParamError)) searchParamError = new SearchParamError(err.message, { cause: err });
          if (opts?.throwOnError) throw searchParamError;
          preMatchSearch = parentSearch;
          strictMatchSearch = {};
          searchError = searchParamError;
        }
      }
      const loaderDeps = route.options.loaderDeps?.({ search: preMatchSearch }) ?? "";
      const loaderDepsHash = loaderDeps ? JSON.stringify(loaderDeps) : "";
      const { interpolatedPath, usedParams } = interpolatePath({
        path: route.fullPath,
        params: routeParams,
        decoder: this.pathParamsDecoder,
        server: this.isServer
      });
      const matchId = route.id + interpolatedPath + loaderDepsHash;
      const existingMatch = this.getMatch(matchId);
      const previousMatch = previousActiveMatchesByRouteId.get(route.id);
      const strictParams = existingMatch?._strictParams ?? usedParams;
      let paramsError = void 0;
      if (!existingMatch) try {
        extractStrictParams(route, usedParams, parsedParams, strictParams);
      } catch (err) {
        if (isNotFound(err) || isRedirect(err)) paramsError = err;
        else paramsError = new PathParamError(err.message, { cause: err });
        if (opts?.throwOnError) throw paramsError;
      }
      Object.assign(routeParams, strictParams);
      const cause = previousMatch ? "stay" : "enter";
      let match;
      if (existingMatch) match = {
        ...existingMatch,
        cause,
        params: previousMatch?.params ?? routeParams,
        _strictParams: strictParams,
        search: previousMatch ? nullReplaceEqualDeep(previousMatch.search, preMatchSearch) : nullReplaceEqualDeep(existingMatch.search, preMatchSearch),
        _strictSearch: strictMatchSearch
      };
      else {
        const status = route.options.loader || route.options.beforeLoad || route.lazyFn || routeNeedsPreload(route) ? "pending" : "success";
        match = {
          id: matchId,
          ssr: void 0,
          index,
          routeId: route.id,
          params: previousMatch?.params ?? routeParams,
          _strictParams: strictParams,
          pathname: interpolatedPath,
          updatedAt: Date.now(),
          search: previousMatch ? nullReplaceEqualDeep(previousMatch.search, preMatchSearch) : preMatchSearch,
          _strictSearch: strictMatchSearch,
          searchError: void 0,
          status,
          isFetching: false,
          error: void 0,
          paramsError,
          __routeContext: void 0,
          _nonReactive: { loadPromise: createControlledPromise() },
          __beforeLoadContext: void 0,
          context: {},
          abortController: new AbortController(),
          fetchCount: 0,
          cause,
          loaderDeps: previousMatch ? replaceEqualDeep(previousMatch.loaderDeps, loaderDeps) : loaderDeps,
          invalid: false,
          preload: false,
          links: void 0,
          scripts: void 0,
          headScripts: void 0,
          meta: void 0,
          staticData: route.options.staticData || {},
          fullPath: route.fullPath
        };
      }
      if (!opts?.preload) match.globalNotFound = globalNotFoundRouteId === route.id;
      match.searchError = searchError;
      const parentContext = this.getParentContext(parentMatch);
      match.context = {
        ...parentContext,
        ...match.__routeContext,
        ...match.__beforeLoadContext
      };
      matches[index] = match;
    }
    for (let index = 0; index < matches.length; index++) {
      const match = matches[index];
      const route = this.looseRoutesById[match.routeId];
      const existingMatch = this.getMatch(match.id);
      const previousMatch = previousActiveMatchesByRouteId.get(match.routeId);
      match.params = previousMatch ? nullReplaceEqualDeep(previousMatch.params, routeParams) : routeParams;
      if (!existingMatch) {
        const parentMatch = matches[index - 1];
        const parentContext = this.getParentContext(parentMatch);
        if (route.options.context) {
          const contextFnContext = {
            deps: match.loaderDeps,
            params: match.params,
            context: parentContext ?? {},
            location: next,
            navigate: (opts2) => this.navigate({
              ...opts2,
              _fromLocation: next
            }),
            buildLocation: this.buildLocation,
            cause: match.cause,
            abortController: match.abortController,
            preload: !!match.preload,
            matches,
            routeId: route.id
          };
          match.__routeContext = route.options.context(contextFnContext) ?? void 0;
        }
        match.context = {
          ...parentContext,
          ...match.__routeContext,
          ...match.__beforeLoadContext
        };
      }
    }
    return matches;
  }
  /**
  * Lightweight route matching for buildLocation.
  * Only computes fullPath, accumulated search, and params - skipping expensive
  * operations like AbortController, ControlledPromise, loaderDeps, and full match objects.
  */
  matchRoutesLightweight(location) {
    const { matchedRoutes, routeParams, parsedParams } = this.getMatchedRoutes(location.pathname);
    const lastRoute = last(matchedRoutes);
    const accumulatedSearch = { ...location.search };
    for (const route of matchedRoutes) try {
      Object.assign(accumulatedSearch, validateSearch(route.options.validateSearch, accumulatedSearch));
    } catch {
    }
    const lastStateMatchId = last(this.stores.matchesId.get());
    const lastStateMatch = lastStateMatchId && this.stores.matchStores.get(lastStateMatchId)?.get();
    const canReuseParams = lastStateMatch && lastStateMatch.routeId === lastRoute.id && lastStateMatch.pathname === location.pathname;
    let params;
    if (canReuseParams) params = lastStateMatch.params;
    else {
      const strictParams = Object.assign(/* @__PURE__ */ Object.create(null), routeParams);
      for (const route of matchedRoutes) try {
        extractStrictParams(route, routeParams, parsedParams ?? {}, strictParams);
      } catch {
      }
      params = strictParams;
    }
    return {
      matchedRoutes,
      fullPath: lastRoute.fullPath,
      search: accumulatedSearch,
      params
    };
  }
};
var SearchParamError = class extends Error {
};
var PathParamError = class extends Error {
};
function getInitialRouterState(location) {
  return {
    loadedAt: 0,
    isLoading: false,
    isTransitioning: false,
    status: "idle",
    resolvedLocation: void 0,
    location,
    matches: [],
    statusCode: 200
  };
}
function validateSearch(validateSearch2, input) {
  if (validateSearch2 == null) return {};
  if ("~standard" in validateSearch2) {
    const result = validateSearch2["~standard"].validate(input);
    if (result instanceof Promise) throw new SearchParamError("Async validation not supported");
    if (result.issues) throw new SearchParamError(JSON.stringify(result.issues, void 0, 2), { cause: result });
    return result.value;
  }
  if ("parse" in validateSearch2) return validateSearch2.parse(input);
  if (typeof validateSearch2 === "function") return validateSearch2(input);
  return {};
}
function getMatchedRoutes({ pathname, routesById, processedTree }) {
  const routeParams = /* @__PURE__ */ Object.create(null);
  const trimmedPath = trimPathRight(pathname);
  let foundRoute = void 0;
  let parsedParams = void 0;
  const match = findRouteMatch(trimmedPath, processedTree, true);
  if (match) {
    foundRoute = match.route;
    Object.assign(routeParams, match.rawParams);
    parsedParams = Object.assign(/* @__PURE__ */ Object.create(null), match.parsedParams);
  }
  return {
    matchedRoutes: match?.branch || [routesById["__root__"]],
    routeParams,
    foundRoute,
    parsedParams
  };
}
function applySearchMiddleware({ search, dest, destRoutes, _includeValidateSearch }) {
  return buildMiddlewareChain(destRoutes)(search, dest, _includeValidateSearch ?? false);
}
function buildMiddlewareChain(destRoutes) {
  const context = {
    dest: null,
    _includeValidateSearch: false,
    middlewares: []
  };
  for (const route of destRoutes) {
    if ("search" in route.options) {
      if (route.options.search?.middlewares) context.middlewares.push(...route.options.search.middlewares);
    } else if (route.options.preSearchFilters || route.options.postSearchFilters) {
      const legacyMiddleware = ({ search, next }) => {
        let nextSearch = search;
        if ("preSearchFilters" in route.options && route.options.preSearchFilters) nextSearch = route.options.preSearchFilters.reduce((prev, next2) => next2(prev), search);
        const result = next(nextSearch);
        if ("postSearchFilters" in route.options && route.options.postSearchFilters) return route.options.postSearchFilters.reduce((prev, next2) => next2(prev), result);
        return result;
      };
      context.middlewares.push(legacyMiddleware);
    }
    if (route.options.validateSearch) {
      const validate = ({ search, next }) => {
        const result = next(search);
        if (!context._includeValidateSearch) return result;
        try {
          return {
            ...result,
            ...validateSearch(route.options.validateSearch, result) ?? void 0
          };
        } catch {
          return result;
        }
      };
      context.middlewares.push(validate);
    }
  }
  const final = ({ search }) => {
    const dest = context.dest;
    if (!dest.search) return {};
    if (dest.search === true) return search;
    return functionalUpdate(dest.search, search);
  };
  context.middlewares.push(final);
  const applyNext = (index, currentSearch, middlewares) => {
    if (index >= middlewares.length) return currentSearch;
    const middleware = middlewares[index];
    const next = (newSearch) => {
      return applyNext(index + 1, newSearch, middlewares);
    };
    return middleware({
      search: currentSearch,
      next
    });
  };
  return function middleware(search, dest, _includeValidateSearch) {
    context.dest = dest;
    context._includeValidateSearch = _includeValidateSearch;
    return applyNext(0, search, context.middlewares);
  };
}
function findGlobalNotFoundRouteId(notFoundMode, routes) {
  if (notFoundMode !== "root") for (let i = routes.length - 1; i >= 0; i--) {
    const route = routes[i];
    if (route.children) return route.id;
  }
  return rootRouteId;
}
function extractStrictParams(route, referenceParams, parsedParams, accumulatedParams) {
  const parseParams = route.options.params?.parse ?? route.options.parseParams;
  if (parseParams) if (route.options.skipRouteOnParseError) {
    for (const key in referenceParams) if (key in parsedParams) accumulatedParams[key] = parsedParams[key];
  } else {
    const result = parseParams(accumulatedParams);
    Object.assign(accumulatedParams, result);
  }
}
var BaseRoute = class {
  get to() {
    return this._to;
  }
  get id() {
    return this._id;
  }
  get path() {
    return this._path;
  }
  get fullPath() {
    return this._fullPath;
  }
  constructor(options) {
    this.init = (opts) => {
      this.originalIndex = opts.originalIndex;
      const options2 = this.options;
      const isRoot = !options2?.path && !options2?.id;
      this.parentRoute = this.options.getParentRoute?.();
      if (isRoot) this._path = rootRouteId;
      else if (!this.parentRoute) {
        invariant();
      }
      let path = isRoot ? rootRouteId : options2?.path;
      if (path && path !== "/") path = trimPathLeft(path);
      const customId = options2?.id || path;
      let id = isRoot ? rootRouteId : joinPaths([this.parentRoute.id === "__root__" ? "" : this.parentRoute.id, customId]);
      if (path === "__root__") path = "/";
      if (id !== "__root__") id = joinPaths(["/", id]);
      const fullPath = id === "__root__" ? "/" : joinPaths([this.parentRoute.fullPath, path]);
      this._path = path;
      this._id = id;
      this._fullPath = fullPath;
      this._to = trimPathRight(fullPath);
    };
    this.addChildren = (children) => {
      return this._addFileChildren(children);
    };
    this._addFileChildren = (children) => {
      if (Array.isArray(children)) this.children = children;
      if (typeof children === "object" && children !== null) this.children = Object.values(children);
      return this;
    };
    this._addFileTypes = () => {
      return this;
    };
    this.updateLoader = (options2) => {
      Object.assign(this.options, options2);
      return this;
    };
    this.update = (options2) => {
      Object.assign(this.options, options2);
      return this;
    };
    this.lazy = (lazyFn) => {
      this.lazyFn = lazyFn;
      return this;
    };
    this.redirect = (opts) => redirect({
      from: this.fullPath,
      ...opts
    });
    this.options = options || {};
    this.isRoot = !options?.getParentRoute;
    if (options?.id && options?.path) throw new Error(`Route cannot have both an 'id' and a 'path' option.`);
  }
};
var BaseRootRoute = class extends BaseRoute {
  constructor(options) {
    super(options);
  }
};
function useMatch(opts) {
  const router2 = useRouter();
  const nearestMatchId = reactExports.useContext(opts.from ? dummyMatchContext : matchContext);
  const key = opts.from ?? nearestMatchId;
  const matchStore = key ? opts.from ? router2.stores.getRouteMatchStore(key) : router2.stores.matchStores.get(key) : void 0;
  {
    const match = matchStore?.get();
    if ((opts.shouldThrow ?? true) && !match) {
      invariant();
    }
    if (match === void 0) return;
    return opts.select ? opts.select(match) : match;
  }
}
function useLoaderData(opts) {
  return useMatch({
    from: opts.from,
    strict: opts.strict,
    structuralSharing: opts.structuralSharing,
    select: (s) => {
      return opts.select ? opts.select(s.loaderData) : s.loaderData;
    }
  });
}
function useLoaderDeps(opts) {
  const { select, ...rest } = opts;
  return useMatch({
    ...rest,
    select: (s) => {
      return select ? select(s.loaderDeps) : s.loaderDeps;
    }
  });
}
function useParams(opts) {
  return useMatch({
    from: opts.from,
    shouldThrow: opts.shouldThrow,
    structuralSharing: opts.structuralSharing,
    strict: opts.strict,
    select: (match) => {
      const params = opts.strict === false ? match.params : match._strictParams;
      return opts.select ? opts.select(params) : params;
    }
  });
}
function useSearch(opts) {
  return useMatch({
    from: opts.from,
    strict: opts.strict,
    shouldThrow: opts.shouldThrow,
    structuralSharing: opts.structuralSharing,
    select: (match) => {
      return opts.select ? opts.select(match.search) : match.search;
    }
  });
}
function useNavigate(_defaultOpts) {
  const router2 = useRouter();
  return reactExports.useCallback((options) => {
    return router2.navigate({
      ...options,
      from: options.from ?? _defaultOpts?.from
    });
  }, [_defaultOpts?.from, router2]);
}
function useRouteContext(opts) {
  return useMatch({
    ...opts,
    select: (match) => opts.select ? opts.select(match.context) : match.context
  });
}
var reactDomExports = requireReactDom();
const ReactDOM = /* @__PURE__ */ getDefaultExportFromCjs(reactDomExports);
function useLinkProps(options, forwardedRef) {
  const router2 = useRouter();
  const innerRef = useForwardedRef(forwardedRef);
  const { activeProps, inactiveProps, activeOptions, to, preload: userPreload, preloadDelay: userPreloadDelay, preloadIntentProximity: _preloadIntentProximity, hashScrollIntoView, replace, startTransition, resetScroll, viewTransition, children, target, disabled, style, className, onClick, onBlur, onFocus, onMouseEnter, onMouseLeave, onTouchStart, ignoreBlocker, params: _params, search: _search, hash: _hash, state: _state, mask: _mask, reloadDocument: _reloadDocument, unsafeRelative: _unsafeRelative, from: _from, _fromLocation, ...propsSafeToSpread } = options;
  {
    const safeInternal = isSafeInternal(to);
    if (typeof to === "string" && !safeInternal && to.indexOf(":") > -1) try {
      new URL(to);
      if (isDangerousProtocol(to, router2.protocolAllowlist)) {
        if (false) ;
        return {
          ...propsSafeToSpread,
          ref: innerRef,
          href: void 0,
          ...children && { children },
          ...target && { target },
          ...disabled && { disabled },
          ...style && { style },
          ...className && { className }
        };
      }
      return {
        ...propsSafeToSpread,
        ref: innerRef,
        href: to,
        ...children && { children },
        ...target && { target },
        ...disabled && { disabled },
        ...style && { style },
        ...className && { className }
      };
    } catch {
    }
    const next2 = router2.buildLocation({
      ...options,
      from: options.from
    });
    const hrefOption2 = getHrefOption(next2.maskedLocation ? next2.maskedLocation.publicHref : next2.publicHref, next2.maskedLocation ? next2.maskedLocation.external : next2.external, router2.history, disabled);
    const externalLink2 = (() => {
      if (hrefOption2?.external) {
        if (isDangerousProtocol(hrefOption2.href, router2.protocolAllowlist)) {
          return;
        }
        return hrefOption2.href;
      }
      if (safeInternal) return void 0;
      if (typeof to === "string" && to.indexOf(":") > -1) try {
        new URL(to);
        if (isDangerousProtocol(to, router2.protocolAllowlist)) {
          if (false) ;
          return;
        }
        return to;
      } catch {
      }
    })();
    const isActive2 = (() => {
      if (externalLink2) return false;
      const currentLocation2 = router2.stores.location.get();
      const exact = activeOptions?.exact ?? false;
      if (exact) {
        if (!exactPathTest(currentLocation2.pathname, next2.pathname, router2.basepath)) return false;
      } else {
        const currentPathSplit = removeTrailingSlash(currentLocation2.pathname, router2.basepath);
        const nextPathSplit = removeTrailingSlash(next2.pathname, router2.basepath);
        if (!(currentPathSplit.startsWith(nextPathSplit) && (currentPathSplit.length === nextPathSplit.length || currentPathSplit[nextPathSplit.length] === "/"))) return false;
      }
      if (activeOptions?.includeSearch ?? true) {
        if (currentLocation2.search !== next2.search) {
          const currentSearchEmpty = !currentLocation2.search || typeof currentLocation2.search === "object" && Object.keys(currentLocation2.search).length === 0;
          const nextSearchEmpty = !next2.search || typeof next2.search === "object" && Object.keys(next2.search).length === 0;
          if (!(currentSearchEmpty && nextSearchEmpty)) {
            if (!deepEqual(currentLocation2.search, next2.search, {
              partial: !exact,
              ignoreUndefined: !activeOptions?.explicitUndefined
            })) return false;
          }
        }
      }
      if (activeOptions?.includeHash) return false;
      return true;
    })();
    if (externalLink2) return {
      ...propsSafeToSpread,
      ref: innerRef,
      href: externalLink2,
      ...children && { children },
      ...target && { target },
      ...disabled && { disabled },
      ...style && { style },
      ...className && { className }
    };
    const resolvedActiveProps2 = isActive2 ? functionalUpdate(activeProps, {}) ?? STATIC_ACTIVE_OBJECT : STATIC_EMPTY_OBJECT;
    const resolvedInactiveProps2 = isActive2 ? STATIC_EMPTY_OBJECT : functionalUpdate(inactiveProps, {}) ?? STATIC_EMPTY_OBJECT;
    const resolvedStyle2 = (() => {
      const baseStyle = style;
      const activeStyle = resolvedActiveProps2.style;
      const inactiveStyle = resolvedInactiveProps2.style;
      if (!baseStyle && !activeStyle && !inactiveStyle) return;
      if (baseStyle && !activeStyle && !inactiveStyle) return baseStyle;
      if (!baseStyle && activeStyle && !inactiveStyle) return activeStyle;
      if (!baseStyle && !activeStyle && inactiveStyle) return inactiveStyle;
      return {
        ...baseStyle,
        ...activeStyle,
        ...inactiveStyle
      };
    })();
    const resolvedClassName2 = (() => {
      const baseClassName = className;
      const activeClassName = resolvedActiveProps2.className;
      const inactiveClassName = resolvedInactiveProps2.className;
      if (!baseClassName && !activeClassName && !inactiveClassName) return "";
      let out = "";
      if (baseClassName) out = baseClassName;
      if (activeClassName) out = out ? `${out} ${activeClassName}` : activeClassName;
      if (inactiveClassName) out = out ? `${out} ${inactiveClassName}` : inactiveClassName;
      return out;
    })();
    return {
      ...propsSafeToSpread,
      ...resolvedActiveProps2,
      ...resolvedInactiveProps2,
      href: hrefOption2?.href,
      ref: innerRef,
      disabled: !!disabled,
      target,
      ...resolvedStyle2 && { style: resolvedStyle2 },
      ...resolvedClassName2 && { className: resolvedClassName2 },
      ...disabled && STATIC_DISABLED_PROPS,
      ...isActive2 && STATIC_ACTIVE_PROPS
    };
  }
}
var STATIC_EMPTY_OBJECT = {};
var STATIC_ACTIVE_OBJECT = { className: "active" };
var STATIC_DISABLED_PROPS = {
  role: "link",
  "aria-disabled": true
};
var STATIC_ACTIVE_PROPS = {
  "data-status": "active",
  "aria-current": "page"
};
function getHrefOption(publicHref, external, history, disabled) {
  if (disabled) return void 0;
  if (external) return {
    href: publicHref,
    external: true
  };
  return {
    href: history.createHref(publicHref) || "/",
    external: false
  };
}
function isSafeInternal(to) {
  if (typeof to !== "string") return false;
  const zero = to.charCodeAt(0);
  if (zero === 47) return to.charCodeAt(1) !== 47;
  return zero === 46;
}
var Link = reactExports.forwardRef((props, ref) => {
  const { _asChild, ...rest } = props;
  const { type: _type, ...linkProps } = useLinkProps(rest, ref);
  const children = typeof rest.children === "function" ? rest.children({ isActive: linkProps["data-status"] === "active" }) : rest.children;
  if (!_asChild) {
    const { disabled: _, ...rest2 } = linkProps;
    return reactExports.createElement("a", rest2, children);
  }
  return reactExports.createElement(_asChild, linkProps, children);
});
var Route$B = class Route extends BaseRoute {
  /**
  * @deprecated Use the `createRoute` function instead.
  */
  constructor(options) {
    super(options);
    this.useMatch = (opts) => {
      return useMatch({
        select: opts?.select,
        from: this.id,
        structuralSharing: opts?.structuralSharing
      });
    };
    this.useRouteContext = (opts) => {
      return useRouteContext({
        ...opts,
        from: this.id
      });
    };
    this.useSearch = (opts) => {
      return useSearch({
        select: opts?.select,
        structuralSharing: opts?.structuralSharing,
        from: this.id
      });
    };
    this.useParams = (opts) => {
      return useParams({
        select: opts?.select,
        structuralSharing: opts?.structuralSharing,
        from: this.id
      });
    };
    this.useLoaderDeps = (opts) => {
      return useLoaderDeps({
        ...opts,
        from: this.id
      });
    };
    this.useLoaderData = (opts) => {
      return useLoaderData({
        ...opts,
        from: this.id
      });
    };
    this.useNavigate = () => {
      return useNavigate({ from: this.fullPath });
    };
    this.Link = React.forwardRef((props, ref) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
        ref,
        from: this.fullPath,
        ...props
      });
    });
  }
};
function createRoute(options) {
  return new Route$B(options);
}
var RootRoute = class extends BaseRootRoute {
  /**
  * @deprecated `RootRoute` is now an internal implementation detail. Use `createRootRoute()` instead.
  */
  constructor(options) {
    super(options);
    this.useMatch = (opts) => {
      return useMatch({
        select: opts?.select,
        from: this.id,
        structuralSharing: opts?.structuralSharing
      });
    };
    this.useRouteContext = (opts) => {
      return useRouteContext({
        ...opts,
        from: this.id
      });
    };
    this.useSearch = (opts) => {
      return useSearch({
        select: opts?.select,
        structuralSharing: opts?.structuralSharing,
        from: this.id
      });
    };
    this.useParams = (opts) => {
      return useParams({
        select: opts?.select,
        structuralSharing: opts?.structuralSharing,
        from: this.id
      });
    };
    this.useLoaderDeps = (opts) => {
      return useLoaderDeps({
        ...opts,
        from: this.id
      });
    };
    this.useLoaderData = (opts) => {
      return useLoaderData({
        ...opts,
        from: this.id
      });
    };
    this.useNavigate = () => {
      return useNavigate({ from: this.fullPath });
    };
    this.Link = React.forwardRef((props, ref) => {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Link, {
        ref,
        from: this.fullPath,
        ...props
      });
    });
  }
};
function createRootRoute(options) {
  return new RootRoute(options);
}
function createFileRoute(path) {
  return new FileRoute(path, { silent: true }).createRoute;
}
var FileRoute = class {
  constructor(path, _opts) {
    this.path = path;
    this.createRoute = (options) => {
      const route = createRoute(options);
      route.isRoot = false;
      return route;
    };
    this.silent = _opts?.silent;
  }
};
function lazyRouteComponent(importer, exportName) {
  let loadPromise;
  let comp;
  let error;
  let reload;
  const load = () => {
    if (!loadPromise) loadPromise = importer().then((res) => {
      loadPromise = void 0;
      comp = res[exportName ?? "default"];
    }).catch((err) => {
      error = err;
      if (isModuleNotFoundError(error)) {
        if (error instanceof Error && typeof window !== "undefined" && typeof sessionStorage !== "undefined") {
          const storageKey = `tanstack_router_reload:${error.message}`;
          if (!sessionStorage.getItem(storageKey)) {
            sessionStorage.setItem(storageKey, "1");
            reload = true;
          }
        }
      }
    });
    return loadPromise;
  };
  const lazyComp = function Lazy(props) {
    if (reload) {
      window.location.reload();
      throw new Promise(() => {
      });
    }
    if (error) throw error;
    if (!comp) if (reactUse) reactUse(load());
    else throw load();
    return reactExports.createElement(comp, props);
  };
  lazyComp.preload = load;
  return lazyComp;
}
var getStoreFactory = (opts) => {
  return {
    createMutableStore: createNonReactiveMutableStore,
    createReadonlyStore: createNonReactiveReadonlyStore,
    batch: (fn) => fn()
  };
};
var createRouter = (options) => {
  return new Router(options);
};
var Router = class extends RouterCore {
  constructor(options) {
    super(options, getStoreFactory);
  }
};
function Asset({ tag, attrs, children, nonce }) {
  switch (tag) {
    case "title":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("title", {
        ...attrs,
        suppressHydrationWarning: true,
        children
      });
    case "meta":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("meta", {
        ...attrs,
        suppressHydrationWarning: true
      });
    case "link":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("link", {
        ...attrs,
        precedence: attrs?.precedence ?? (attrs?.rel === "stylesheet" ? "default" : void 0),
        nonce,
        suppressHydrationWarning: true
      });
    case "style":
      return /* @__PURE__ */ jsxRuntimeExports.jsx("style", {
        ...attrs,
        dangerouslySetInnerHTML: { __html: children },
        nonce
      });
    case "script":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Script, {
        attrs,
        children
      });
    default:
      return null;
  }
}
function Script({ attrs, children }) {
  useRouter();
  useHydrated();
  const dataScript = typeof attrs?.type === "string" && attrs.type !== "" && attrs.type !== "text/javascript" && attrs.type !== "module";
  reactExports.useEffect(() => {
    if (dataScript) return;
    if (attrs?.src) {
      const normSrc = (() => {
        try {
          const base = document.baseURI || window.location.href;
          return new URL(attrs.src, base).href;
        } catch {
          return attrs.src;
        }
      })();
      if (Array.from(document.querySelectorAll("script[src]")).find((el) => el.src === normSrc)) return;
      const script = document.createElement("script");
      for (const [key, value] of Object.entries(attrs)) if (key !== "suppressHydrationWarning" && value !== void 0 && value !== false) script.setAttribute(key, typeof value === "boolean" ? "" : String(value));
      document.head.appendChild(script);
      return () => {
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    }
    if (typeof children === "string") {
      const typeAttr = typeof attrs?.type === "string" ? attrs.type : "text/javascript";
      const nonceAttr = typeof attrs?.nonce === "string" ? attrs.nonce : void 0;
      if (Array.from(document.querySelectorAll("script:not([src])")).find((el) => {
        if (!(el instanceof HTMLScriptElement)) return false;
        const sType = el.getAttribute("type") ?? "text/javascript";
        const sNonce = el.getAttribute("nonce") ?? void 0;
        return el.textContent === children && sType === typeAttr && sNonce === nonceAttr;
      })) return;
      const script = document.createElement("script");
      script.textContent = children;
      if (attrs) {
        for (const [key, value] of Object.entries(attrs)) if (key !== "suppressHydrationWarning" && value !== void 0 && value !== false) script.setAttribute(key, typeof value === "boolean" ? "" : String(value));
      }
      document.head.appendChild(script);
      return () => {
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    }
  }, [
    attrs,
    children,
    dataScript
  ]);
  {
    if (attrs?.src) return /* @__PURE__ */ jsxRuntimeExports.jsx("script", {
      ...attrs,
      suppressHydrationWarning: true
    });
    if (typeof children === "string") return /* @__PURE__ */ jsxRuntimeExports.jsx("script", {
      ...attrs,
      dangerouslySetInnerHTML: { __html: children },
      suppressHydrationWarning: true
    });
    return null;
  }
}
function buildTagsFromMatches(router2, nonce, matches, assetCrossOrigin) {
  const routeMeta = matches.map((match) => match.meta).filter(Boolean);
  const resultMeta = [];
  const metaByAttribute = {};
  let title;
  for (let i = routeMeta.length - 1; i >= 0; i--) {
    const metas = routeMeta[i];
    for (let j = metas.length - 1; j >= 0; j--) {
      const m = metas[j];
      if (!m) continue;
      if (m.title) {
        if (!title) title = {
          tag: "title",
          children: m.title
        };
      } else if ("script:ld+json" in m) try {
        const json = JSON.stringify(m["script:ld+json"]);
        resultMeta.push({
          tag: "script",
          attrs: { type: "application/ld+json" },
          children: escapeHtml(json)
        });
      } catch {
      }
      else {
        const attribute = m.name ?? m.property;
        if (attribute) if (metaByAttribute[attribute]) continue;
        else metaByAttribute[attribute] = true;
        resultMeta.push({
          tag: "meta",
          attrs: {
            ...m,
            nonce
          }
        });
      }
    }
  }
  if (title) resultMeta.push(title);
  if (nonce) resultMeta.push({
    tag: "meta",
    attrs: {
      property: "csp-nonce",
      content: nonce
    }
  });
  resultMeta.reverse();
  const constructedLinks = matches.map((match) => match.links).filter(Boolean).flat(1).map((link) => ({
    tag: "link",
    attrs: {
      ...link,
      nonce
    }
  }));
  const manifest = router2.ssr?.manifest;
  const assetLinks = matches.map((match) => manifest?.routes[match.routeId]?.assets ?? []).filter(Boolean).flat(1).filter((asset) => asset.tag === "link").map((asset) => ({
    tag: "link",
    attrs: {
      ...asset.attrs,
      crossOrigin: getAssetCrossOrigin(assetCrossOrigin, "stylesheet") ?? asset.attrs?.crossOrigin,
      suppressHydrationWarning: true,
      nonce
    }
  }));
  const preloadLinks = [];
  matches.map((match) => router2.looseRoutesById[match.routeId]).forEach((route) => router2.ssr?.manifest?.routes[route.id]?.preloads?.filter(Boolean).forEach((preload) => {
    const preloadLink = resolveManifestAssetLink(preload);
    preloadLinks.push({
      tag: "link",
      attrs: {
        rel: "modulepreload",
        href: preloadLink.href,
        crossOrigin: getAssetCrossOrigin(assetCrossOrigin, "modulepreload") ?? preloadLink.crossOrigin,
        nonce
      }
    });
  }));
  const styles = matches.map((match) => match.styles).flat(1).filter(Boolean).map(({ children, ...attrs }) => ({
    tag: "style",
    attrs: {
      ...attrs,
      nonce
    },
    children
  }));
  const headScripts = matches.map((match) => match.headScripts).flat(1).filter(Boolean).map(({ children, ...script }) => ({
    tag: "script",
    attrs: {
      ...script,
      nonce
    },
    children
  }));
  return uniqBy([
    ...resultMeta,
    ...preloadLinks,
    ...constructedLinks,
    ...assetLinks,
    ...styles,
    ...headScripts
  ], (d) => JSON.stringify(d));
}
var useTags = (assetCrossOrigin) => {
  const router2 = useRouter();
  const nonce = router2.options.ssr?.nonce;
  return buildTagsFromMatches(router2, nonce, router2.stores.matches.get(), assetCrossOrigin);
};
function uniqBy(arr, fn) {
  const seen = /* @__PURE__ */ new Set();
  return arr.filter((item) => {
    const key = fn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function HeadContent(props) {
  const tags = useTags(props.assetCrossOrigin);
  const nonce = useRouter().options.ssr?.nonce;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: tags.map((tag) => /* @__PURE__ */ reactExports.createElement(Asset, {
    ...tag,
    key: `tsr-meta-${JSON.stringify(tag)}`,
    nonce
  })) });
}
var Scripts = () => {
  const router2 = useRouter();
  const nonce = router2.options.ssr?.nonce;
  const getAssetScripts = (matches) => {
    const assetScripts = [];
    const manifest = router2.ssr?.manifest;
    if (!manifest) return [];
    matches.map((match) => router2.looseRoutesById[match.routeId]).forEach((route) => manifest.routes[route.id]?.assets?.filter((d) => d.tag === "script").forEach((asset) => {
      assetScripts.push({
        tag: "script",
        attrs: {
          ...asset.attrs,
          nonce
        },
        children: asset.children
      });
    }));
    return assetScripts;
  };
  const getScripts = (matches) => matches.map((match) => match.scripts).flat(1).filter(Boolean).map(({ children, ...script }) => ({
    tag: "script",
    attrs: {
      ...script,
      suppressHydrationWarning: true,
      nonce
    },
    children
  }));
  {
    const activeMatches = router2.stores.matches.get();
    const assetScripts = getAssetScripts(activeMatches);
    return renderScripts(router2, getScripts(activeMatches), assetScripts);
  }
};
function renderScripts(router2, scripts, assetScripts) {
  let serverBufferedScript = void 0;
  if (router2.serverSsr) serverBufferedScript = router2.serverSsr.takeBufferedScripts();
  const allScripts = [...scripts, ...assetScripts];
  if (serverBufferedScript) allScripts.unshift(serverBufferedScript);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: allScripts.map((asset, i) => /* @__PURE__ */ reactExports.createElement(Asset, {
    ...asset,
    key: `tsr-scripts-${asset.tag}-${i}`
  })) });
}
const appCss = "/assets/styles.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
const Route$A = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "vendor-management" },
      { name: "description", content: "A vendor marketplace interface with RBAC-ready features and user-customizable themes." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "vendor-management" },
      { property: "og:description", content: "A vendor marketplace interface with RBAC-ready features and user-customizable themes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "vendor-management" },
      { name: "twitter:description", content: "A vendor marketplace interface with RBAC-ready features and user-customizable themes." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5f1aa6b2-7b45-4021-8a07-a471fb49ce62/id-preview-34830e4a--f4f924a2-f002-4f25-b0a3-a2f21d2cea47.lovable.app-1776917842784.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5f1aa6b2-7b45-4021-8a07-a471fb49ce62/id-preview-34830e4a--f4f924a2-f002-4f25-b0a3-a2f21d2cea47.lovable.app-1776917842784.png" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
}
const $$splitComponentImporter$z = () => import("./vendor.js");
const Route$z = createFileRoute("/vendor")({
  component: lazyRouteComponent($$splitComponentImporter$z, "component")
});
const $$splitComponentImporter$y = () => import("./register.js");
const Route$y = createFileRoute("/register")({
  component: lazyRouteComponent($$splitComponentImporter$y, "component")
});
const $$splitComponentImporter$x = () => import("./onboarding.js");
const Route$x = createFileRoute("/onboarding")({
  validateSearch: (search) => ({
    portal: search.portal ?? "vendor"
  }),
  component: lazyRouteComponent($$splitComponentImporter$x, "component")
});
const $$splitComponentImporter$w = () => import("./login.js");
const Route$w = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$w, "component")
});
const $$splitComponentImporter$v = () => import("./buyer.js");
const Route$v = createFileRoute("/buyer")({
  component: lazyRouteComponent($$splitComponentImporter$v, "component")
});
const $$splitComponentImporter$u = () => import("./index2.js");
const Route$u = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "ProcurLi — Procure smarter. Risk less."
    }, {
      name: "description",
      content: "ProcurLi is a cloud procurement and vendor management platform for industrial enterprises — from requisition to contract, powered by ML risk intelligence."
    }, {
      property: "og:title",
      content: "ProcurLi — Procure smarter. Risk less."
    }, {
      property: "og:description",
      content: "Cloud-based procurement & vendor management for industrial enterprises. ML-driven risk scoring, full procure-to-pay flow."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$u, "component")
});
const $$splitComponentImporter$t = () => import("./vendor.index.js");
const Route$t = createFileRoute("/vendor/")({
  component: lazyRouteComponent($$splitComponentImporter$t, "component")
});
const $$splitComponentImporter$s = () => import("./buyer.index.js");
const Route$s = createFileRoute("/buyer/")({
  component: lazyRouteComponent($$splitComponentImporter$s, "component")
});
const $$splitComponentImporter$r = () => import("./vendor.storefront.js");
const Route$r = createFileRoute("/vendor/storefront")({
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const $$splitComponentImporter$q = () => import("./vendor.settings.js");
const Route$q = createFileRoute("/vendor/settings")({
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const $$splitComponentImporter$p = () => import("./vendor.rfqs.js");
const Route$p = createFileRoute("/vendor/rfqs")({
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./vendor.reviews.js");
const Route$o = createFileRoute("/vendor/reviews")({
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./vendor.purchase-orders.js");
const Route$n = createFileRoute("/vendor/purchase-orders")({
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./vendor.products.js");
const Route$m = createFileRoute("/vendor/products")({
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./vendor.payouts.js");
const Route$l = createFileRoute("/vendor/payouts")({
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./vendor.orders.js");
const Route$k = createFileRoute("/vendor/orders")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./vendor.messages.js");
const Route$j = createFileRoute("/vendor/messages")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./vendor.invoices.js");
const Route$i = createFileRoute("/vendor/invoices")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./vendor.deliveries.js");
const Route$h = createFileRoute("/vendor/deliveries")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./vendor.compliance.js");
const Route$g = createFileRoute("/vendor/compliance")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./vendor.buyers.js");
const Route$f = createFileRoute("/vendor/buyers")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./buyer.vendors.js");
const Route$e = createFileRoute("/buyer/vendors")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./buyer.settings.js");
const Route$d = createFileRoute("/buyer/settings")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./buyer.risk.js");
const Route$c = createFileRoute("/buyer/risk")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./buyer.rfqs.js");
const Route$b = createFileRoute("/buyer/rfqs")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./buyer.requisitions.js");
const Route$a = createFileRoute("/buyer/requisitions")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./buyer.receipts.js");
const Route$9 = createFileRoute("/buyer/receipts")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./buyer.quotations.js");
const Route$8 = createFileRoute("/buyer/quotations")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./buyer.purchase-orders.js");
const Route$7 = createFileRoute("/buyer/purchase-orders")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./buyer.payments.js");
const Route$6 = createFileRoute("/buyer/payments")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./buyer.messages.js");
const Route$5 = createFileRoute("/buyer/messages")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./buyer.marketplace.js");
const Route$4 = createFileRoute("/buyer/marketplace")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./buyer.inventory.js");
const Route$3 = createFileRoute("/buyer/inventory")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./buyer.bills.js");
const Route$2 = createFileRoute("/buyer/bills")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const ROLE_LABELS = {
  vendor_owner: "Owner",
  vendor_admin: "Admin",
  vendor_staff: "Sales / Staff",
  vendor_finance: "Finance"
};
const ROLE_DESCRIPTIONS = {
  vendor_owner: "Full access, including billing, team, and store deletion.",
  vendor_admin: "Manage products, orders, deliveries, team, and storefront.",
  vendor_staff: "Manage products and orders. No billing or team access.",
  vendor_finance: "Read orders. Manage invoices, payouts, and bank details."
};
const PERMISSIONS = [
  "dashboard:view",
  "orders:view",
  "orders:fulfill",
  "po:view",
  "po:acknowledge",
  "rfq:view",
  "rfq:respond",
  "products:view",
  "products:manage",
  "storefront:view",
  "storefront:edit",
  "deliveries:view",
  "deliveries:manage",
  "invoices:view",
  "invoices:manage",
  "payouts:view",
  "payouts:manage",
  "compliance:view",
  "compliance:upload",
  "buyers:view",
  "buyers:manage",
  "messages:view",
  "messages:send",
  "reviews:view",
  "team:view",
  "team:manage",
  "settings:view",
  "settings:edit",
  "billing:view",
  "billing:manage"
];
const ROLE_PERMISSIONS = {
  vendor_owner: [...PERMISSIONS],
  vendor_admin: [
    "dashboard:view",
    "orders:view",
    "orders:fulfill",
    "po:view",
    "po:acknowledge",
    "rfq:view",
    "rfq:respond",
    "products:view",
    "products:manage",
    "storefront:view",
    "storefront:edit",
    "deliveries:view",
    "deliveries:manage",
    "invoices:view",
    "payouts:view",
    "compliance:view",
    "compliance:upload",
    "buyers:view",
    "buyers:manage",
    "messages:view",
    "messages:send",
    "reviews:view",
    "team:view",
    "team:manage",
    "settings:view",
    "settings:edit"
  ],
  vendor_staff: [
    "dashboard:view",
    "orders:view",
    "orders:fulfill",
    "po:view",
    "po:acknowledge",
    "rfq:view",
    "rfq:respond",
    "products:view",
    "products:manage",
    "storefront:view",
    "deliveries:view",
    "deliveries:manage",
    "messages:view",
    "messages:send",
    "reviews:view",
    "settings:view"
  ],
  vendor_finance: [
    "dashboard:view",
    "orders:view",
    "po:view",
    "rfq:view",
    "invoices:view",
    "invoices:manage",
    "payouts:view",
    "payouts:manage",
    "compliance:view",
    "settings:view",
    "billing:view",
    "billing:manage"
  ]
};
const CURRENT_TENANT = {
  id: "tnt_acme",
  companyName: "Acme Industrial Supply",
  industry: "Industrial Equipment",
  contactEmail: "ops@acme-supply.com",
  status: "Active",
  riskScore: 0.18,
  riskClass: "Low",
  storeSlug: "acme-industrial-supply",
  tagline: "Heavy machinery & MRO supplies, shipped fast.",
  storeBio: "Family-run since 1987. ISO 9001 certified. Serving manufacturers across SE Asia with industrial bearings, hydraulics, and replacement parts.",
  certifiedBadge: true
};
const TEAM_MEMBERS = [
  { id: "u1", name: "Shane Sorono", email: "shane@acme-supply.com", role: "vendor_owner", department: "Executive", active: true, joinedAt: "2023-04-12", initials: "SS" },
  { id: "u2", name: "Mira Tan", email: "mira@acme-supply.com", role: "vendor_admin", department: "Operations", active: true, joinedAt: "2023-06-02", initials: "MT" },
  { id: "u3", name: "Diego Rivera", email: "diego@acme-supply.com", role: "vendor_staff", department: "Sales", active: true, joinedAt: "2024-01-18", initials: "DR" },
  { id: "u4", name: "Anya Petrova", email: "anya@acme-supply.com", role: "vendor_staff", department: "Warehouse", active: true, joinedAt: "2024-03-04", initials: "AP" },
  { id: "u5", name: "Linh Nguyen", email: "linh@acme-supply.com", role: "vendor_finance", department: "Finance", active: true, joinedAt: "2024-07-22", initials: "LN" },
  { id: "u6", name: "Jorge Cruz", email: "jorge@acme-supply.com", role: "vendor_staff", department: "Sales", active: false, joinedAt: "2023-11-09", initials: "JC" }
];
const PRODUCTS = [
  { id: "p1", sku: "ACM-BRG-6204", name: "Deep Groove Ball Bearing 6204", category: "Bearings", price: 12.5, uom: "pc", stock: 480, status: "Active", views: 1245, orders: 84, rating: 4.7, image: "⚙️" },
  { id: "p2", sku: "ACM-HYD-25M", name: "Hydraulic Hose 25mm × 5m", category: "Hydraulics", price: 84, uom: "pc", stock: 62, status: "Active", views: 880, orders: 42, rating: 4.6, image: "🔧" },
  { id: "p3", sku: "ACM-LUB-20L", name: "Industrial Lubricant ISO VG 68", category: "Chemicals", price: 145, uom: "drum", stock: 18, status: "Active", views: 612, orders: 27, rating: 4.8, image: "🛢️" },
  { id: "p4", sku: "ACM-FAS-M12", name: "Hex Bolt M12 × 60 Grade 8.8", category: "Fasteners", price: 0.42, uom: "pc", stock: 12e3, status: "Active", views: 2105, orders: 198, rating: 4.9, image: "🔩" },
  { id: "p5", sku: "ACM-ELC-CB16", name: "Circuit Breaker 16A 1P", category: "Electrical", price: 22.5, uom: "pc", stock: 0, status: "Out of stock", views: 540, orders: 31, rating: 4.5, image: "⚡" },
  { id: "p6", sku: "ACM-SAF-HLM", name: "Hard Hat Type 1 Class E", category: "Safety", price: 18.9, uom: "pc", stock: 240, status: "Active", views: 720, orders: 55, rating: 4.7, image: "⛑️" },
  { id: "p7", sku: "ACM-MRO-WD40", name: "Multi-Use Lubricant 400ml", category: "MRO", price: 9.5, uom: "can", stock: 360, status: "Active", views: 1880, orders: 142, rating: 4.9, image: "🧴" },
  { id: "p8", sku: "ACM-BRG-6307", name: "Deep Groove Ball Bearing 6307", category: "Bearings", price: 18.4, uom: "pc", stock: 145, status: "Draft", views: 14, orders: 0, rating: 0, image: "⚙️" }
];
const PRODUCT_CATEGORIES = [
  "Bearings",
  "Hydraulics",
  "Chemicals",
  "Fasteners",
  "Electrical",
  "Safety",
  "MRO",
  "Tools",
  "Raw Materials"
];
const BUYERS = [
  { id: "b1", companyName: "Pacific Manufacturing Corp", industry: "Heavy Equipment", status: "Approved", appliedAt: "2024-02-04", totalSpend: 184500, orderCount: 32, initials: "PM" },
  { id: "b2", companyName: "Northwind Logistics", industry: "Logistics", status: "Approved", appliedAt: "2024-05-18", totalSpend: 92300, orderCount: 21, initials: "NL" },
  { id: "b3", companyName: "Coastal Energy Holdings", industry: "Oil & Gas", status: "Approved", appliedAt: "2024-07-09", totalSpend: 256800, orderCount: 41, initials: "CE" },
  { id: "b4", companyName: "Highland Steel Works", industry: "Manufacturing", status: "Pending", appliedAt: "2026-04-12", totalSpend: 0, orderCount: 0, initials: "HS" },
  { id: "b5", companyName: "Southport Construction", industry: "Construction", status: "Approved", appliedAt: "2024-11-22", totalSpend: 67900, orderCount: 14, initials: "SC" },
  { id: "b6", companyName: "Vertex Pharmaceuticals", industry: "Chemical & Pharma", status: "Pending", appliedAt: "2026-04-19", totalSpend: 0, orderCount: 0, initials: "VP" },
  { id: "b7", companyName: "Old Republic Mining", industry: "Mining", status: "Suspended", appliedAt: "2023-09-01", totalSpend: 12400, orderCount: 3, initials: "OR" }
];
const MARKETPLACE_ORDERS = [
  { id: "mo1", orderNumber: "MO-2026-0421", buyerId: "b1", buyerName: "Pacific Manufacturing Corp", status: "New", total: 1842.5, itemCount: 4, placedAt: "2026-04-22", expectedBy: "2026-04-29", paymentMethod: "PayMongo Card", shippingAddress: "Bay 4, Pacific Industrial Park, Cebu", lines: [
    { sku: "ACM-BRG-6204", name: "Deep Groove Ball Bearing 6204", qty: 80, unitPrice: 12.5 },
    { sku: "ACM-HYD-25M", name: "Hydraulic Hose 25mm × 5m", qty: 6, unitPrice: 84 },
    { sku: "ACM-LUB-20L", name: "Industrial Lubricant ISO VG 68", qty: 2, unitPrice: 145 },
    { sku: "ACM-FAS-M12", name: "Hex Bolt M12 × 60", qty: 200, unitPrice: 0.42 }
  ] },
  { id: "mo2", orderNumber: "MO-2026-0420", buyerId: "b3", buyerName: "Coastal Energy Holdings", status: "Acknowledged", total: 4350, itemCount: 2, placedAt: "2026-04-21", expectedBy: "2026-04-28", paymentMethod: "Net30", shippingAddress: "Wharf 12, Coastal Refinery, Batangas", lines: [
    { sku: "ACM-LUB-20L", name: "Industrial Lubricant ISO VG 68", qty: 30, unitPrice: 145 }
  ] },
  { id: "mo3", orderNumber: "MO-2026-0418", buyerId: "b2", buyerName: "Northwind Logistics", status: "Packed", total: 980, itemCount: 3, placedAt: "2026-04-20", expectedBy: "2026-04-25", paymentMethod: "PayMongo GCash", shippingAddress: "Hub A, Northwind DC, Quezon City", lines: [] },
  { id: "mo4", orderNumber: "MO-2026-0415", buyerId: "b5", buyerName: "Southport Construction", status: "Shipped", total: 2240, itemCount: 5, placedAt: "2026-04-18", expectedBy: "2026-04-24", paymentMethod: "PayMongo Card", shippingAddress: "Site B-7, Southport Tower, Davao", lines: [] },
  { id: "mo5", orderNumber: "MO-2026-0410", buyerId: "b1", buyerName: "Pacific Manufacturing Corp", status: "Delivered", total: 5680, itemCount: 12, placedAt: "2026-04-12", expectedBy: "2026-04-19", paymentMethod: "Net30", shippingAddress: "Bay 4, Pacific Industrial Park", lines: [] },
  { id: "mo6", orderNumber: "MO-2026-0408", buyerId: "b3", buyerName: "Coastal Energy Holdings", status: "Delivered", total: 980, itemCount: 2, placedAt: "2026-04-10", expectedBy: "2026-04-17", paymentMethod: "Net30", shippingAddress: "Wharf 12, Coastal Refinery", lines: [] },
  { id: "mo7", orderNumber: "MO-2026-0405", buyerId: "b2", buyerName: "Northwind Logistics", status: "Cancelled", total: 320, itemCount: 1, placedAt: "2026-04-08", expectedBy: "2026-04-15", paymentMethod: "PayMongo Card", shippingAddress: "Hub A, Northwind DC", lines: [] }
];
const PURCHASE_ORDERS = [
  { id: "po1", poNumber: "PO-PMC-008412", buyerName: "Pacific Manufacturing Corp", status: "Issued", total: 12480, poDate: "2026-04-22", expectedDelivery: "2026-05-06", paymentTerms: "Net30", itemCount: 8 },
  { id: "po2", poNumber: "PO-CEH-002201", buyerName: "Coastal Energy Holdings", status: "Acknowledged", total: 24800, poDate: "2026-04-19", expectedDelivery: "2026-05-03", paymentTerms: "Net45", itemCount: 12 },
  { id: "po3", poNumber: "PO-NWL-000932", buyerName: "Northwind Logistics", status: "Partially Received", total: 6720, poDate: "2026-04-15", expectedDelivery: "2026-04-29", paymentTerms: "Net30", itemCount: 5 },
  { id: "po4", poNumber: "PO-PMC-008401", buyerName: "Pacific Manufacturing Corp", status: "Received", total: 9650, poDate: "2026-04-08", expectedDelivery: "2026-04-22", paymentTerms: "Net30", itemCount: 6 },
  { id: "po5", poNumber: "PO-SPC-001154", buyerName: "Southport Construction", status: "Received", total: 4280, poDate: "2026-04-04", expectedDelivery: "2026-04-18", paymentTerms: "COD", itemCount: 4 }
];
const DELIVERIES = [
  { id: "d1", deliveryNumber: "DLV-2026-0421-A", orderRef: "MO-2026-0418", buyerName: "Northwind Logistics", status: "Preparing", carrier: "Acme Internal Fleet", trackingNumber: "ACME-78421", shippedAt: "2026-04-22", expectedAt: "2026-04-25", itemCount: 3 },
  { id: "d2", deliveryNumber: "DLV-2026-0420-B", orderRef: "MO-2026-0415", buyerName: "Southport Construction", status: "In Transit", carrier: "LBC Express", trackingNumber: "LBC-9923-4421", shippedAt: "2026-04-21", expectedAt: "2026-04-24", itemCount: 5 },
  { id: "d3", deliveryNumber: "DLV-2026-0418-C", orderRef: "PO-NWL-000932", buyerName: "Northwind Logistics", status: "Out for Delivery", carrier: "J&T Express", trackingNumber: "JT-42100-8821", shippedAt: "2026-04-20", expectedAt: "2026-04-23", itemCount: 5 },
  { id: "d4", deliveryNumber: "DLV-2026-0412-D", orderRef: "MO-2026-0410", buyerName: "Pacific Manufacturing Corp", status: "Delivered", carrier: "Acme Internal Fleet", trackingNumber: "ACME-78340", shippedAt: "2026-04-13", expectedAt: "2026-04-18", itemCount: 12 },
  { id: "d5", deliveryNumber: "DLV-2026-0410-E", orderRef: "MO-2026-0408", buyerName: "Coastal Energy Holdings", status: "Delivered", carrier: "2GO Express", trackingNumber: "2GO-55-4421", shippedAt: "2026-04-11", expectedAt: "2026-04-16", itemCount: 2 },
  { id: "d6", deliveryNumber: "DLV-2026-0405-F", orderRef: "PO-PMC-008401", buyerName: "Pacific Manufacturing Corp", status: "Failed", carrier: "LBC Express", trackingNumber: "LBC-9921-1188", shippedAt: "2026-04-09", expectedAt: "2026-04-14", itemCount: 1 }
];
const INVOICES = [
  { id: "i1", invoiceNumber: "INV-2026-04-0042", buyerName: "Pacific Manufacturing Corp", amount: 12480, status: "Sent", issuedAt: "2026-04-22", dueAt: "2026-05-22", reference: "PO-PMC-008412" },
  { id: "i2", invoiceNumber: "INV-2026-04-0041", buyerName: "Coastal Energy Holdings", amount: 4350, status: "Paid", issuedAt: "2026-04-21", dueAt: "2026-05-21", reference: "MO-2026-0420" },
  { id: "i3", invoiceNumber: "INV-2026-04-0038", buyerName: "Northwind Logistics", amount: 6720, status: "Sent", issuedAt: "2026-04-15", dueAt: "2026-05-15", reference: "PO-NWL-000932" },
  { id: "i4", invoiceNumber: "INV-2026-03-0029", buyerName: "Pacific Manufacturing Corp", amount: 9650, status: "Paid", issuedAt: "2026-03-28", dueAt: "2026-04-27", reference: "PO-PMC-008401" },
  { id: "i5", invoiceNumber: "INV-2026-03-0021", buyerName: "Old Republic Mining", amount: 2400, status: "Overdue", issuedAt: "2026-03-12", dueAt: "2026-04-11", reference: "PO-ORM-000088" },
  { id: "i6", invoiceNumber: "INV-2026-04-0044", buyerName: "Southport Construction", amount: 2240, status: "Draft", issuedAt: "2026-04-22", dueAt: "2026-05-22", reference: "MO-2026-0415" }
];
const PAYOUTS = [
  { id: "py1", reference: "PYT-2026-0428", amount: 16830, status: "Scheduled", scheduledFor: "2026-04-28", method: "PayMongo → BPI ****4421", invoiceCount: 3 },
  { id: "py2", reference: "PYT-2026-0421", amount: 4350, status: "Paid", scheduledFor: "2026-04-21", method: "PayMongo → BPI ****4421", invoiceCount: 1 },
  { id: "py3", reference: "PYT-2026-0414", amount: 9650, status: "Paid", scheduledFor: "2026-04-14", method: "PayMongo → BPI ****4421", invoiceCount: 1 },
  { id: "py4", reference: "PYT-2026-0407", amount: 12300, status: "Paid", scheduledFor: "2026-04-07", method: "PayMongo → BPI ****4421", invoiceCount: 4 }
];
const COMPLIANCE_DOCS = [
  { id: "c1", type: "BIR Certificate", fileName: "BIR-2316-2025.pdf", status: "Valid", expiresAt: "2026-12-31", uploadedAt: "2025-01-12" },
  { id: "c2", type: "Business Permit", fileName: "MayorPermit-2026.pdf", status: "Valid", expiresAt: "2026-12-31", uploadedAt: "2026-01-05" },
  { id: "c3", type: "ISO 9001", fileName: "ISO-9001-2024.pdf", status: "Valid", expiresAt: "2027-03-15", uploadedAt: "2024-03-15" },
  { id: "c4", type: "DTI Registration", fileName: "DTI-Reg.pdf", status: "Valid", uploadedAt: "2023-04-12" },
  { id: "c5", type: "Product Catalogue", fileName: "Catalogue-2026-Q2.pdf", status: "Valid", uploadedAt: "2026-04-01" },
  { id: "c6", type: "Fire Safety Inspection", fileName: "FSI-2026.pdf", status: "Expiring", expiresAt: "2026-05-30", uploadedAt: "2025-05-30" },
  { id: "c7", type: "PCAB License", fileName: "PCAB-2024.pdf", status: "Expired", expiresAt: "2025-12-31", uploadedAt: "2024-01-08" }
];
const CONVERSATIONS = [
  { id: "cv1", buyerName: "Pacific Manufacturing Corp", initials: "PM", preview: "Can you split the M12 bolts into two pallets?", unread: 2, lastAt: "10:24", pinned: true, messages: [
    { from: "buyer", text: "Hi! We just placed MO-2026-0421.", at: "Yesterday 16:02" },
    { from: "vendor", text: "Got it — confirming stock now.", at: "Yesterday 16:08" },
    { from: "buyer", text: "Can you split the M12 bolts into two pallets?", at: "10:24" }
  ] },
  { id: "cv2", buyerName: "Coastal Energy Holdings", initials: "CE", preview: "Invoice INV-2026-04-0041 paid.", unread: 0, lastAt: "Yesterday", messages: [
    { from: "buyer", text: "Invoice INV-2026-04-0041 paid.", at: "Yesterday 14:11" }
  ] },
  { id: "cv3", buyerName: "Northwind Logistics", initials: "NL", preview: "Tracking number please?", unread: 1, lastAt: "Mon", messages: [
    { from: "buyer", text: "Tracking number please?", at: "Mon 09:30" }
  ] },
  { id: "cv4", buyerName: "Highland Steel Works", initials: "HS", preview: "We submitted an accreditation request.", unread: 0, lastAt: "Apr 12", messages: [
    { from: "buyer", text: "We submitted an accreditation request — let us know if you need more docs.", at: "Apr 12 11:00" }
  ] }
];
const REVIEWS = [
  { id: "r1", buyerName: "Pacific Manufacturing Corp", initials: "PM", productName: "Hex Bolt M12 × 60", rating: 5, text: "Consistent quality, fast dispatch. Our preferred bearings supplier now.", at: "2026-04-18" },
  { id: "r2", buyerName: "Coastal Energy Holdings", initials: "CE", productName: "Industrial Lubricant ISO VG 68", rating: 5, text: "Lubricant shipped on time and properly sealed. Will reorder.", at: "2026-04-15" },
  { id: "r3", buyerName: "Northwind Logistics", initials: "NL", productName: "Hydraulic Hose 25mm × 5m", rating: 4, text: "Good product. One hose had minor packaging damage but still usable.", at: "2026-04-09" },
  { id: "r4", buyerName: "Southport Construction", initials: "SC", productName: "Hard Hat Type 1 Class E", rating: 5, text: "Solid hats. Comfortable for 8-hour shifts.", at: "2026-04-02" }
];
const REVENUE_SERIES = [
  { day: "Apr 09", revenue: 1240, orders: 4 },
  { day: "Apr 10", revenue: 5680, orders: 9 },
  { day: "Apr 11", revenue: 980, orders: 3 },
  { day: "Apr 12", revenue: 2120, orders: 5 },
  { day: "Apr 13", revenue: 4480, orders: 7 },
  { day: "Apr 14", revenue: 3210, orders: 6 },
  { day: "Apr 15", revenue: 6920, orders: 11 },
  { day: "Apr 16", revenue: 1840, orders: 4 },
  { day: "Apr 17", revenue: 2950, orders: 6 },
  { day: "Apr 18", revenue: 4220, orders: 8 },
  { day: "Apr 19", revenue: 5410, orders: 9 },
  { day: "Apr 20", revenue: 3680, orders: 7 },
  { day: "Apr 21", revenue: 4720, orders: 8 },
  { day: "Apr 22", revenue: 6180, orders: 10 }
];
function formatCurrency(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
function formatCurrencyDecimal(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
const INCOMING_RFQS = [
  {
    id: "irfq1",
    rfqNumber: "RFQ-2026-0420",
    buyerName: "Pacific Manufacturing Corp",
    buyerInitials: "PM",
    title: "Hydraulic line overhaul materials",
    category: "Hydraulics",
    receivedAt: "2026-04-21",
    closesAt: "2026-04-28",
    status: "Quoted",
    competingVendors: 4,
    estTotal: 18620,
    unread: 0,
    lines: [
      { sku: "HYD-HSE-25M", description: "Hydraulic Hose 25mm × 5m, 4000psi", qty: 12, uom: "pc", targetPrice: 80, notes: "EN 853 2SN compliant" },
      { sku: "HYD-CYL-50T", description: "Hydraulic Cylinder 50-ton, double-acting", qty: 2, uom: "pc", targetPrice: 2600 },
      { sku: "HYD-PMP-15HP", description: "Hydraulic Pump 15HP, gear-type", qty: 1, uom: "pc", targetPrice: 1800 },
      { description: "Installation labour & commissioning", qty: 1, uom: "lot", targetPrice: 4200 }
    ],
    thread: [
      { from: "vendor", text: "Submitted quotation. Pricing in USD, FOB Cebu.", at: "Apr 22 14:11" },
      { from: "buyer", text: "Thanks — do you offer 30-day payment terms?", at: "Apr 23 07:50" }
    ],
    myQuote: { total: 18620, leadTimeDays: 6, validUntil: "2026-05-15", submittedAt: "2026-04-22", rank: 2 }
  },
  {
    id: "irfq2",
    rfqNumber: "RFQ-2026-0416",
    buyerName: "Pacific Manufacturing Corp",
    buyerInitials: "PM",
    title: "Chemicals quarterly bulk",
    category: "Chemicals",
    receivedAt: "2026-04-16",
    closesAt: "2026-04-23",
    status: "Lost",
    competingVendors: 3,
    estTotal: 2440,
    unread: 0,
    lines: [
      { sku: "CHM-LUB-200L", description: "Industrial Lubricant 200L Drum, ISO VG 68", qty: 4, uom: "drum", targetPrice: 470 },
      { sku: "CHM-DEG-25L", description: "Industrial Degreaser 25L", qty: 3, uom: "pail", targetPrice: 140 }
    ],
    thread: [
      { from: "vendor", text: "Quote submitted, valid 30 days.", at: "Apr 17 10:00" },
      { from: "buyer", text: "Awarded to Vertex Chemicals — thank you for bidding.", at: "Apr 23 09:00" }
    ],
    myQuote: { total: 2440, leadTimeDays: 4, validUntil: "2026-05-10", submittedAt: "2026-04-17", rank: 2 }
  },
  {
    id: "irfq3",
    rfqNumber: "RFQ-2026-0426",
    buyerName: "Coastal Energy Holdings",
    buyerInitials: "CE",
    title: "Bearings annual blanket order",
    category: "Bearings",
    receivedAt: "2026-04-22",
    closesAt: "2026-05-02",
    status: "New",
    competingVendors: 5,
    estTotal: 0,
    unread: 2,
    lines: [
      { sku: "BRG-6204", description: "Deep Groove Ball Bearing 6204 (SKF or equivalent)", qty: 600, uom: "pc", targetPrice: 11.5 },
      { sku: "BRG-6307", description: "Deep Groove Ball Bearing 6307 (SKF or equivalent)", qty: 240, uom: "pc", targetPrice: 17 },
      { sku: "BRG-6206", description: "Deep Groove Ball Bearing 6206", qty: 320, uom: "pc", targetPrice: 13 }
    ],
    thread: [
      { from: "buyer", text: "Annual blanket — please quote unit price plus 12-month commitment discount.", at: "Apr 22 09:00" },
      { from: "buyer", text: "Need ISO 9001 cert attached with quote.", at: "Apr 22 09:02" }
    ]
  },
  {
    id: "irfq4",
    rfqNumber: "RFQ-2026-0425",
    buyerName: "Northwind Logistics",
    buyerInitials: "NL",
    title: "MRO consumables Q3",
    category: "MRO",
    receivedAt: "2026-04-22",
    closesAt: "2026-04-30",
    status: "Viewed",
    competingVendors: 4,
    estTotal: 0,
    unread: 1,
    lines: [
      { sku: "MRO-WD40", description: "Multi-Use Lubricant 400ml", qty: 240, uom: "can", targetPrice: 9 },
      { sku: "MRO-RAG-CTN", description: "Workshop Rags (10kg carton)", qty: 30, uom: "carton", targetPrice: 22 }
    ],
    thread: [
      { from: "buyer", text: "Please confirm if you can hold price for 60 days.", at: "Apr 22 11:30" }
    ]
  },
  {
    id: "irfq5",
    rfqNumber: "RFQ-2026-0418",
    buyerName: "Southport Construction",
    buyerInitials: "SC",
    title: "Fasteners site delivery — Tower B",
    category: "Fasteners",
    receivedAt: "2026-04-18",
    closesAt: "2026-04-26",
    status: "Awarded",
    competingVendors: 3,
    estTotal: 1680,
    unread: 0,
    lines: [
      { sku: "FAS-M12", description: "Hex Bolt M12 × 60 Grade 8.8 (100pk)", qty: 40, uom: "pack", targetPrice: 42 }
    ],
    thread: [
      { from: "vendor", text: "Quote sent — can deliver to site in 2 days.", at: "Apr 18 14:00" },
      { from: "buyer", text: "Awarded — PO incoming.", at: "Apr 20 10:15" }
    ],
    myQuote: { total: 1680, leadTimeDays: 2, validUntil: "2026-05-02", submittedAt: "2026-04-18", rank: 1 }
  }
];
const $$splitNotFoundComponentImporter$1 = () => import("./vendor.rfqs._rfqId.js");
const $$splitComponentImporter$1 = () => import("./vendor.rfqs._rfqId2.js");
const Route$1 = createFileRoute("/vendor/rfqs/$rfqId")({
  loader: ({
    params
  }) => {
    const rfq = INCOMING_RFQS.find((r) => r.id === params.rfqId);
    if (!rfq) throw notFound();
    return rfq;
  },
  component: lazyRouteComponent($$splitComponentImporter$1, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$1, "notFoundComponent")
});
const BUYER_ROLE_LABELS = {
  buyer_owner: "Owner",
  buyer_procurement: "Procurement",
  buyer_approver: "Approver",
  buyer_finance: "Finance"
};
const BUYER_ROLE_DESCRIPTIONS = {
  buyer_owner: "Full access — billing, team, vendors, approvals, payments.",
  buyer_procurement: "Browse marketplace, raise PRs, RFQs, POs. No payment access.",
  buyer_approver: "Approve / reject PRs and POs. Read-only on payments.",
  buyer_finance: "Approve bills, schedule payments, manage budgets."
};
const BUYER_PERMISSIONS = [
  "dashboard:view",
  "marketplace:browse",
  "vendors:view",
  "vendors:manage",
  "requisitions:view",
  "requisitions:create",
  "requisitions:approve",
  "rfq:view",
  "rfq:create",
  "quotations:view",
  "quotations:award",
  "po:view",
  "po:create",
  "po:approve",
  "receipts:view",
  "receipts:create",
  "bills:view",
  "bills:approve",
  "payments:view",
  "payments:schedule",
  "inventory:view",
  "inventory:manage",
  "risk:view",
  "messages:view",
  "messages:send",
  "team:view",
  "team:manage",
  "settings:view",
  "settings:edit",
  "billing:view",
  "billing:manage",
  "budget:view",
  "budget:manage"
];
const BUYER_ROLE_PERMISSIONS = {
  buyer_owner: [...BUYER_PERMISSIONS],
  buyer_procurement: [
    "dashboard:view",
    "marketplace:browse",
    "vendors:view",
    "vendors:manage",
    "requisitions:view",
    "requisitions:create",
    "rfq:view",
    "rfq:create",
    "quotations:view",
    "quotations:award",
    "po:view",
    "po:create",
    "receipts:view",
    "receipts:create",
    "bills:view",
    "payments:view",
    "inventory:view",
    "inventory:manage",
    "risk:view",
    "messages:view",
    "messages:send",
    "settings:view"
  ],
  buyer_approver: [
    "dashboard:view",
    "vendors:view",
    "requisitions:view",
    "requisitions:approve",
    "rfq:view",
    "quotations:view",
    "po:view",
    "po:approve",
    "receipts:view",
    "bills:view",
    "payments:view",
    "inventory:view",
    "risk:view",
    "messages:view",
    "messages:send",
    "settings:view"
  ],
  buyer_finance: [
    "dashboard:view",
    "vendors:view",
    "requisitions:view",
    "po:view",
    "receipts:view",
    "bills:view",
    "bills:approve",
    "payments:view",
    "payments:schedule",
    "risk:view",
    "settings:view",
    "billing:view",
    "billing:manage",
    "budget:view",
    "budget:manage"
  ]
};
const CURRENT_BUYER_TENANT = {
  id: "tnt_pacific",
  companyName: "Pacific Manufacturing Corp",
  industry: "Heavy Equipment",
  contactEmail: "procurement@pacificmfg.com",
  budgetYTD: 482300,
  budgetLimit: 85e4,
  certifiedBadge: true
};
const BUYER_TEAM = [
  { id: "bu1", name: "Elena Marquez", email: "elena@pacificmfg.com", role: "buyer_owner", department: "Executive", active: true, joinedAt: "2022-09-01", initials: "EM" },
  { id: "bu2", name: "Raj Bhatt", email: "raj@pacificmfg.com", role: "buyer_procurement", department: "Procurement", active: true, joinedAt: "2023-02-14", initials: "RB" },
  { id: "bu3", name: "Sara Lim", email: "sara@pacificmfg.com", role: "buyer_procurement", department: "Procurement", active: true, joinedAt: "2023-08-30", initials: "SL" },
  { id: "bu4", name: "Marco Velasquez", email: "marco@pacificmfg.com", role: "buyer_approver", department: "Operations", active: true, joinedAt: "2022-11-04", initials: "MV" },
  { id: "bu5", name: "Yuki Tanaka", email: "yuki@pacificmfg.com", role: "buyer_finance", department: "Finance", active: true, joinedAt: "2024-01-22", initials: "YT" },
  { id: "bu6", name: "Tomás Reyes", email: "tomas@pacificmfg.com", role: "buyer_procurement", department: "Procurement", active: false, joinedAt: "2023-05-10", initials: "TR" }
];
const BUYER_VENDORS = [
  { id: "v1", companyName: "Acme Industrial Supply", category: "Industrial Equipment", status: "Accredited", riskClass: "Low", riskScore: 0.18, rating: 4.7, totalSpend: 184500, orders: 32, onTimeRate: 96, initials: "AI" },
  { id: "v2", companyName: "Northstar Hydraulics", category: "Hydraulics", status: "Accredited", riskClass: "Low", riskScore: 0.22, rating: 4.5, totalSpend: 92300, orders: 18, onTimeRate: 92, initials: "NH" },
  { id: "v3", companyName: "Vertex Chemicals", category: "Chemicals", status: "Accredited", riskClass: "Medium", riskScore: 0.45, rating: 4.2, totalSpend: 56400, orders: 11, onTimeRate: 84, initials: "VC" },
  { id: "v4", companyName: "Bolt & Nut Co.", category: "Fasteners", status: "Accredited", riskClass: "Low", riskScore: 0.12, rating: 4.8, totalSpend: 38900, orders: 47, onTimeRate: 99, initials: "BN" },
  { id: "v5", companyName: "Volt Electrical Trading", category: "Electrical", status: "Pending", riskClass: "Medium", riskScore: 0.51, rating: 4, totalSpend: 0, orders: 0, onTimeRate: 0, initials: "VE" },
  { id: "v6", companyName: "SafeGear PH", category: "Safety", status: "Accredited", riskClass: "Low", riskScore: 0.2, rating: 4.6, totalSpend: 27800, orders: 15, onTimeRate: 95, initials: "SG" },
  { id: "v7", companyName: "Eastern Steel Mills", category: "Raw Materials", status: "Accredited", riskClass: "High", riskScore: 0.71, rating: 3.6, totalSpend: 142e3, orders: 9, onTimeRate: 67, initials: "ES" },
  { id: "v8", companyName: "OldRep Mining Supplies", category: "MRO", status: "Blocked", riskClass: "High", riskScore: 0.82, rating: 2.9, totalSpend: 12400, orders: 3, onTimeRate: 50, initials: "OR" }
];
const MARKETPLACE_PRODUCTS = [
  { id: "mp1", vendorId: "v1", vendorName: "Acme Industrial Supply", sku: "ACM-BRG-6204", name: "Deep Groove Ball Bearing 6204", category: "Bearings", price: 12.5, uom: "pc", inStock: true, rating: 4.7, image: "⚙️", leadTimeDays: 3 },
  { id: "mp2", vendorId: "v1", vendorName: "Acme Industrial Supply", sku: "ACM-HYD-25M", name: "Hydraulic Hose 25mm × 5m", category: "Hydraulics", price: 84, uom: "pc", inStock: true, rating: 4.6, image: "🔧", leadTimeDays: 5 },
  { id: "mp3", vendorId: "v2", vendorName: "Northstar Hydraulics", sku: "NS-PMP-15HP", name: "Hydraulic Pump 15HP", category: "Hydraulics", price: 1840, uom: "pc", inStock: true, rating: 4.5, image: "🛠️", leadTimeDays: 10 },
  { id: "mp4", vendorId: "v3", vendorName: "Vertex Chemicals", sku: "VC-LUB-200L", name: "Industrial Lubricant 200L Drum", category: "Chemicals", price: 480, uom: "drum", inStock: true, rating: 4.2, image: "🛢️", leadTimeDays: 7 },
  { id: "mp5", vendorId: "v4", vendorName: "Bolt & Nut Co.", sku: "BN-FAS-M12", name: "Hex Bolt M12 × 60 Grade 8.8 (100pk)", category: "Fasteners", price: 42, uom: "pack", inStock: true, rating: 4.8, image: "🔩", leadTimeDays: 2 },
  { id: "mp6", vendorId: "v6", vendorName: "SafeGear PH", sku: "SG-HLM-T1E", name: "Hard Hat Type 1 Class E (Yellow)", category: "Safety", price: 18.9, uom: "pc", inStock: true, rating: 4.6, image: "⛑️", leadTimeDays: 3 },
  { id: "mp7", vendorId: "v6", vendorName: "SafeGear PH", sku: "SG-GLV-CUT5", name: "Cut-Resistant Gloves Level 5", category: "Safety", price: 9.5, uom: "pair", inStock: true, rating: 4.7, image: "🧤", leadTimeDays: 4 },
  { id: "mp8", vendorId: "v7", vendorName: "Eastern Steel Mills", sku: "ES-PLT-10MM", name: "Steel Plate 10mm 1220×2440", category: "Raw Materials", price: 312, uom: "sheet", inStock: false, rating: 3.6, image: "🪨", leadTimeDays: 14 },
  { id: "mp9", vendorId: "v1", vendorName: "Acme Industrial Supply", sku: "ACM-MRO-WD40", name: "Multi-Use Lubricant 400ml", category: "MRO", price: 9.5, uom: "can", inStock: true, rating: 4.9, image: "🧴", leadTimeDays: 2 },
  { id: "mp10", vendorId: "v2", vendorName: "Northstar Hydraulics", sku: "NS-CYL-50T", name: "Hydraulic Cylinder 50-ton", category: "Hydraulics", price: 2640, uom: "pc", inStock: true, rating: 4.4, image: "⚒️", leadTimeDays: 12 },
  { id: "mp11", vendorId: "v4", vendorName: "Bolt & Nut Co.", sku: "BN-NUT-M16", name: "Hex Nut M16 Grade 8 (100pk)", category: "Fasteners", price: 28, uom: "pack", inStock: true, rating: 4.7, image: "🔩", leadTimeDays: 2 },
  { id: "mp12", vendorId: "v3", vendorName: "Vertex Chemicals", sku: "VC-DEG-25L", name: "Industrial Degreaser 25L", category: "Chemicals", price: 145, uom: "pail", inStock: true, rating: 4, image: "🧪", leadTimeDays: 5 }
];
const MARKETPLACE_CATEGORIES = [
  "All",
  "Bearings",
  "Hydraulics",
  "Chemicals",
  "Fasteners",
  "Electrical",
  "Safety",
  "MRO",
  "Raw Materials"
];
const REQUISITIONS = [
  { id: "pr1", prNumber: "PR-2026-0421", title: "Q2 Bearings restock — Bay 4", requestedBy: "Raj Bhatt", department: "Maintenance", amount: 4280, itemCount: 6, status: "Pending Approval", raisedAt: "2026-04-22", neededBy: "2026-05-06" },
  { id: "pr2", prNumber: "PR-2026-0420", title: "Hydraulic line overhaul — Press 2", requestedBy: "Sara Lim", department: "Production", amount: 18420, itemCount: 4, status: "Approved", raisedAt: "2026-04-21", neededBy: "2026-05-12" },
  { id: "pr3", prNumber: "PR-2026-0418", title: "Safety PPE quarterly issue", requestedBy: "Raj Bhatt", department: "EHS", amount: 6240, itemCount: 8, status: "Converted to PO", raisedAt: "2026-04-19", neededBy: "2026-04-30" },
  { id: "pr4", prNumber: "PR-2026-0415", title: "Chemicals — Lubricant + degreaser", requestedBy: "Sara Lim", department: "Maintenance", amount: 2410, itemCount: 3, status: "Converted to RFQ", raisedAt: "2026-04-16", neededBy: "2026-05-02" },
  { id: "pr5", prNumber: "PR-2026-0410", title: "Steel plate 10mm — Project Atlas", requestedBy: "Raj Bhatt", department: "Engineering", amount: 9360, itemCount: 30, status: "Approved", raisedAt: "2026-04-12", neededBy: "2026-05-20" },
  { id: "pr6", prNumber: "PR-2026-0408", title: "Office MRO consumables", requestedBy: "Sara Lim", department: "Facilities", amount: 480, itemCount: 12, status: "Rejected", raisedAt: "2026-04-09", neededBy: "2026-04-20" },
  { id: "pr7", prNumber: "PR-2026-0405", title: "Fasteners — assembly line top-up", requestedBy: "Raj Bhatt", department: "Production", amount: 1680, itemCount: 4, status: "Draft", raisedAt: "2026-04-23", neededBy: "2026-05-08" }
];
const RFQS = [
  { id: "rfq1", rfqNumber: "RFQ-2026-0420", title: "Hydraulic line overhaul materials", category: "Hydraulics", invitedVendors: 4, responsesReceived: 3, status: "Open", createdAt: "2026-04-21", closesAt: "2026-04-28", prRef: "PR-2026-0420" },
  { id: "rfq2", rfqNumber: "RFQ-2026-0416", title: "Chemicals quarterly bulk", category: "Chemicals", invitedVendors: 3, responsesReceived: 3, status: "Closed", createdAt: "2026-04-16", closesAt: "2026-04-23", prRef: "PR-2026-0415" },
  { id: "rfq3", rfqNumber: "RFQ-2026-0410", title: "Steel plate 10mm — Project Atlas", category: "Raw Materials", invitedVendors: 5, responsesReceived: 4, status: "Awarded", createdAt: "2026-04-12", closesAt: "2026-04-20", prRef: "PR-2026-0410" },
  { id: "rfq4", rfqNumber: "RFQ-2026-0405", title: "Annual safety PPE contract", category: "Safety", invitedVendors: 6, responsesReceived: 5, status: "Awarded", createdAt: "2026-04-05", closesAt: "2026-04-15", prRef: "PR-2026-0418" },
  { id: "rfq5", rfqNumber: "RFQ-2026-0422", title: "Fasteners blanket order Q3", category: "Fasteners", invitedVendors: 0, responsesReceived: 0, status: "Draft", createdAt: "2026-04-22", closesAt: "2026-05-05", prRef: "PR-2026-0405" }
];
const QUOTATIONS = [
  { id: "q1", rfqRef: "RFQ-2026-0420", vendorId: "v2", vendorName: "Northstar Hydraulics", total: 17920, leadTimeDays: 8, validUntil: "2026-05-15", status: "Submitted", rank: 1 },
  { id: "q2", rfqRef: "RFQ-2026-0420", vendorId: "v1", vendorName: "Acme Industrial Supply", total: 18620, leadTimeDays: 6, validUntil: "2026-05-15", status: "Submitted", rank: 2 },
  { id: "q3", rfqRef: "RFQ-2026-0420", vendorId: "v3", vendorName: "Vertex Chemicals", total: 19840, leadTimeDays: 12, validUntil: "2026-05-15", status: "Submitted", rank: 3 },
  { id: "q4", rfqRef: "RFQ-2026-0416", vendorId: "v3", vendorName: "Vertex Chemicals", total: 2290, leadTimeDays: 5, validUntil: "2026-05-10", status: "Awarded", rank: 1 },
  { id: "q5", rfqRef: "RFQ-2026-0416", vendorId: "v1", vendorName: "Acme Industrial Supply", total: 2440, leadTimeDays: 4, validUntil: "2026-05-10", status: "Submitted", rank: 2 },
  { id: "q6", rfqRef: "RFQ-2026-0410", vendorId: "v7", vendorName: "Eastern Steel Mills", total: 9120, leadTimeDays: 14, validUntil: "2026-05-05", status: "Awarded", rank: 1 },
  { id: "q7", rfqRef: "RFQ-2026-0405", vendorId: "v6", vendorName: "SafeGear PH", total: 6080, leadTimeDays: 5, validUntil: "2026-05-01", status: "Awarded", rank: 1 }
];
const BUYER_PURCHASE_ORDERS = [
  { id: "bpo1", poNumber: "PO-PMC-008420", vendorName: "Acme Industrial Supply", vendorId: "v1", status: "Pending Approval", total: 6240, itemCount: 8, poDate: "2026-04-22", expectedDelivery: "2026-05-06", paymentTerms: "Net30", raisedBy: "Raj Bhatt", prRef: "PR-2026-0418" },
  { id: "bpo2", poNumber: "PO-PMC-008419", vendorName: "Vertex Chemicals", vendorId: "v3", status: "Acknowledged", total: 2290, itemCount: 3, poDate: "2026-04-21", expectedDelivery: "2026-04-28", paymentTerms: "Net30", raisedBy: "Sara Lim", prRef: "PR-2026-0415" },
  { id: "bpo3", poNumber: "PO-PMC-008412", vendorName: "Acme Industrial Supply", vendorId: "v1", status: "Issued", total: 12480, itemCount: 8, poDate: "2026-04-22", expectedDelivery: "2026-05-06", paymentTerms: "Net30", raisedBy: "Raj Bhatt" },
  { id: "bpo4", poNumber: "PO-PMC-008410", vendorName: "Eastern Steel Mills", vendorId: "v7", status: "Partially Received", total: 9120, itemCount: 30, poDate: "2026-04-15", expectedDelivery: "2026-05-02", paymentTerms: "Net45", raisedBy: "Raj Bhatt", prRef: "PR-2026-0410" },
  { id: "bpo5", poNumber: "PO-PMC-008405", vendorName: "Northstar Hydraulics", vendorId: "v2", status: "Received", total: 3680, itemCount: 4, poDate: "2026-04-10", expectedDelivery: "2026-04-20", paymentTerms: "Net30", raisedBy: "Sara Lim" },
  { id: "bpo6", poNumber: "PO-PMC-008401", vendorName: "Bolt & Nut Co.", vendorId: "v4", status: "Closed", total: 1680, itemCount: 40, poDate: "2026-04-04", expectedDelivery: "2026-04-12", paymentTerms: "COD", raisedBy: "Raj Bhatt" },
  { id: "bpo7", poNumber: "PO-PMC-008398", vendorName: "SafeGear PH", vendorId: "v6", status: "Closed", total: 6080, itemCount: 60, poDate: "2026-03-28", expectedDelivery: "2026-04-08", paymentTerms: "Net30", raisedBy: "Sara Lim" }
];
const GOODS_RECEIPTS = [
  { id: "gr1", grnNumber: "GRN-2026-0422-A", poRef: "PO-PMC-008405", vendorName: "Northstar Hydraulics", receivedAt: "2026-04-22", receivedBy: "Anya Petrova", itemCount: 4, status: "Accepted" },
  { id: "gr2", grnNumber: "GRN-2026-0421-B", poRef: "PO-PMC-008410", vendorName: "Eastern Steel Mills", receivedAt: "2026-04-21", receivedBy: "Diego Rivera", itemCount: 18, status: "Partially Accepted", notes: "12 sheets back-ordered, ETA 2 weeks." },
  { id: "gr3", grnNumber: "GRN-2026-0418-C", poRef: "PO-PMC-008401", vendorName: "Bolt & Nut Co.", receivedAt: "2026-04-12", receivedBy: "Anya Petrova", itemCount: 40, status: "Accepted" },
  { id: "gr4", grnNumber: "GRN-2026-0410-D", poRef: "PO-PMC-008398", vendorName: "SafeGear PH", receivedAt: "2026-04-08", receivedBy: "Diego Rivera", itemCount: 60, status: "Accepted" },
  { id: "gr5", grnNumber: "GRN-2026-0420-E", poRef: "PO-PMC-008419", vendorName: "Vertex Chemicals", receivedAt: "2026-04-23", receivedBy: "Anya Petrova", itemCount: 3, status: "Pending Inspection" }
];
const VENDOR_BILLS = [
  { id: "vb1", billNumber: "INV-NS-001124", vendorName: "Northstar Hydraulics", poRef: "PO-PMC-008405", amount: 3680, status: "Approved", receivedAt: "2026-04-22", dueAt: "2026-05-22" },
  { id: "vb2", billNumber: "INV-ES-002201", vendorName: "Eastern Steel Mills", poRef: "PO-PMC-008410", amount: 5472, status: "Pending", receivedAt: "2026-04-22", dueAt: "2026-06-06" },
  { id: "vb3", billNumber: "INV-BN-005512", vendorName: "Bolt & Nut Co.", poRef: "PO-PMC-008401", amount: 1680, status: "Paid", receivedAt: "2026-04-12", dueAt: "2026-04-12" },
  { id: "vb4", billNumber: "INV-SG-009941", vendorName: "SafeGear PH", poRef: "PO-PMC-008398", amount: 6080, status: "Paid", receivedAt: "2026-04-08", dueAt: "2026-05-08" },
  { id: "vb5", billNumber: "INV-VC-006621", vendorName: "Vertex Chemicals", poRef: "PO-PMC-008419", amount: 2290, status: "Scheduled", receivedAt: "2026-04-23", dueAt: "2026-05-23" },
  { id: "vb6", billNumber: "INV-AC-008412", vendorName: "Acme Industrial Supply", poRef: "PO-PMC-008412", amount: 12480, status: "Pending", receivedAt: "2026-04-22", dueAt: "2026-05-22" },
  { id: "vb7", billNumber: "INV-ES-001990", vendorName: "Eastern Steel Mills", poRef: "PO-PMC-008390", amount: 4200, status: "Overdue", receivedAt: "2026-03-12", dueAt: "2026-04-11" },
  { id: "vb8", billNumber: "INV-OR-000088", vendorName: "OldRep Mining Supplies", poRef: "PO-PMC-008321", amount: 1840, status: "Disputed", receivedAt: "2026-03-22", dueAt: "2026-04-22" }
];
const BUYER_PAYMENTS = [
  { id: "pay1", reference: "PAY-2026-0428-A", vendorName: "Northstar Hydraulics", billRef: "INV-NS-001124", amount: 3680, status: "Scheduled", scheduledFor: "2026-04-28", method: "Bank transfer" },
  { id: "pay2", reference: "PAY-2026-0423-B", vendorName: "Vertex Chemicals", billRef: "INV-VC-006621", amount: 2290, status: "Processing", scheduledFor: "2026-04-23", method: "PayMongo" },
  { id: "pay3", reference: "PAY-2026-0412-C", vendorName: "Bolt & Nut Co.", billRef: "INV-BN-005512", amount: 1680, status: "Paid", scheduledFor: "2026-04-12", method: "COD" },
  { id: "pay4", reference: "PAY-2026-0408-D", vendorName: "SafeGear PH", billRef: "INV-SG-009941", amount: 6080, status: "Paid", scheduledFor: "2026-04-08", method: "Bank transfer" },
  { id: "pay5", reference: "PAY-2026-0322-E", vendorName: "Acme Industrial Supply", billRef: "INV-AC-008321", amount: 9650, status: "Paid", scheduledFor: "2026-03-22", method: "Bank transfer" }
];
const SPEND_BY_CATEGORY = [
  { category: "Hydraulics", spend: 96200 },
  { category: "Raw Materials", spend: 142e3 },
  { category: "Industrial Eq.", spend: 184500 },
  { category: "Chemicals", spend: 56400 },
  { category: "Fasteners", spend: 38900 },
  { category: "Safety", spend: 27800 }
];
const SPEND_SERIES = [
  { month: "Nov 25", spend: 38400, orders: 18 },
  { month: "Dec 25", spend: 52100, orders: 22 },
  { month: "Jan 26", spend: 41800, orders: 17 },
  { month: "Feb 26", spend: 67300, orders: 28 },
  { month: "Mar 26", spend: 78400, orders: 32 },
  { month: "Apr 26", spend: 92200, orders: 38 }
];
const BUYER_CONVERSATIONS = [
  { id: "bcv1", vendorName: "Acme Industrial Supply", initials: "AI", preview: "Confirming PO-PMC-008412 — ships Apr 26.", unread: 1, lastAt: "11:02", pinned: true, messages: [
    { from: "buyer", text: "Hi, can you split the M12 bolts into two pallets?", at: "10:24" },
    { from: "vendor", text: "Yes — 2 pallets, separate carriers. Confirming PO-PMC-008412 — ships Apr 26.", at: "11:02" }
  ] },
  { id: "bcv2", vendorName: "Northstar Hydraulics", initials: "NH", preview: "GRN received — anything pending?", unread: 0, lastAt: "Yesterday", messages: [
    { from: "vendor", text: "GRN received — anything pending?", at: "Yesterday 16:40" }
  ] },
  { id: "bcv3", vendorName: "Eastern Steel Mills", initials: "ES", preview: "Back-order ETA on the 12 missing sheets?", unread: 2, lastAt: "Mon", messages: [
    { from: "buyer", text: "Back-order ETA on the 12 missing sheets?", at: "Mon 09:30" },
    { from: "vendor", text: "Mill rolling schedule confirmed for May 4-5. Ship by May 7.", at: "Mon 14:11" }
  ] },
  { id: "bcv4", vendorName: "Vertex Chemicals", initials: "VC", preview: "MSDS attached for the new degreaser SKU.", unread: 0, lastAt: "Apr 19", messages: [
    { from: "vendor", text: "MSDS attached for the new degreaser SKU.", at: "Apr 19 11:00" }
  ] }
];
const RISK_ALERTS = [
  { id: "ra1", vendorName: "Eastern Steel Mills", level: "High", signal: "On-time delivery dropped to 67%", detail: "8 of last 12 deliveries late by ≥3 days. Recommend secondary source.", raisedAt: "2026-04-22" },
  { id: "ra2", vendorName: "OldRep Mining Supplies", level: "High", signal: "Compliance docs expired", detail: "PCAB License expired 2025-12-31. Auto-blocked from new POs.", raisedAt: "2026-04-20" },
  { id: "ra3", vendorName: "Vertex Chemicals", level: "Medium", signal: "Quality variance detected", detail: "2 GRNs flagged for off-spec viscosity in last 30 days.", raisedAt: "2026-04-18" },
  { id: "ra4", vendorName: "Volt Electrical Trading", level: "Medium", signal: "Pending accreditation > 14d", detail: "DTI registration uploaded but ISO 9001 still missing.", raisedAt: "2026-04-15" }
];
function formatBuyerCurrency(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
const RFQ_LINES = [
  // RFQ-2026-0420 — Hydraulic line overhaul
  { id: "rl1", rfqRef: "RFQ-2026-0420", sku: "HYD-HSE-25M", description: "Hydraulic Hose 25mm × 5m, 4000psi", qty: 12, uom: "pc", targetPrice: 80, notes: "EN 853 2SN compliant" },
  { id: "rl2", rfqRef: "RFQ-2026-0420", sku: "HYD-CYL-50T", description: "Hydraulic Cylinder 50-ton, double-acting", qty: 2, uom: "pc", targetPrice: 2600 },
  { id: "rl3", rfqRef: "RFQ-2026-0420", sku: "HYD-PMP-15HP", description: "Hydraulic Pump 15HP, gear-type", qty: 1, uom: "pc", targetPrice: 1800 },
  { id: "rl4", rfqRef: "RFQ-2026-0420", description: "Installation labour & commissioning", qty: 1, uom: "lot", targetPrice: 4200 },
  // RFQ-2026-0422 — Fasteners blanket
  { id: "rl5", rfqRef: "RFQ-2026-0422", sku: "FAS-M12", description: "Hex Bolt M12 × 60 Grade 8.8 (100pk)", qty: 40, uom: "pack", targetPrice: 40 },
  { id: "rl6", rfqRef: "RFQ-2026-0422", sku: "FAS-NUT-M16", description: "Hex Nut M16 Grade 8 (100pk)", qty: 25, uom: "pack", targetPrice: 26 },
  // RFQ-2026-0416 — Chemicals
  { id: "rl7", rfqRef: "RFQ-2026-0416", sku: "CHM-LUB-200L", description: "Industrial Lubricant 200L Drum, ISO VG 68", qty: 4, uom: "drum", targetPrice: 470 },
  { id: "rl8", rfqRef: "RFQ-2026-0416", sku: "CHM-DEG-25L", description: "Industrial Degreaser 25L", qty: 3, uom: "pail", targetPrice: 140 },
  // RFQ-2026-0410 — Steel
  { id: "rl9", rfqRef: "RFQ-2026-0410", sku: "STL-PLT-10MM", description: "Steel Plate 10mm 1220×2440 ASTM A36", qty: 30, uom: "sheet", targetPrice: 310 },
  // RFQ-2026-0405 — Safety PPE
  { id: "rl10", rfqRef: "RFQ-2026-0405", sku: "SAF-HLM", description: "Hard Hat Type 1 Class E (Yellow)", qty: 200, uom: "pc", targetPrice: 18 },
  { id: "rl11", rfqRef: "RFQ-2026-0405", sku: "SAF-GLV", description: "Cut-Resistant Gloves Level 5", qty: 300, uom: "pair", targetPrice: 9 }
];
const RFQ_INVITATIONS = [
  // RFQ-2026-0420
  { id: "ri1", rfqRef: "RFQ-2026-0420", vendorId: "v2", vendorName: "Northstar Hydraulics", invitedAt: "2026-04-21", vendorStatus: "Quoted", quotationId: "q1" },
  { id: "ri2", rfqRef: "RFQ-2026-0420", vendorId: "v1", vendorName: "Acme Industrial Supply", invitedAt: "2026-04-21", vendorStatus: "Quoted", quotationId: "q2" },
  { id: "ri3", rfqRef: "RFQ-2026-0420", vendorId: "v3", vendorName: "Vertex Chemicals", invitedAt: "2026-04-21", vendorStatus: "Quoted", quotationId: "q3" },
  { id: "ri4", rfqRef: "RFQ-2026-0420", vendorId: "v7", vendorName: "Eastern Steel Mills", invitedAt: "2026-04-21", vendorStatus: "Viewed" },
  // RFQ-2026-0416
  { id: "ri5", rfqRef: "RFQ-2026-0416", vendorId: "v3", vendorName: "Vertex Chemicals", invitedAt: "2026-04-16", vendorStatus: "Quoted", quotationId: "q4" },
  { id: "ri6", rfqRef: "RFQ-2026-0416", vendorId: "v1", vendorName: "Acme Industrial Supply", invitedAt: "2026-04-16", vendorStatus: "Quoted", quotationId: "q5" },
  { id: "ri7", rfqRef: "RFQ-2026-0416", vendorId: "v6", vendorName: "SafeGear PH", invitedAt: "2026-04-16", vendorStatus: "Declined" },
  // RFQ-2026-0410
  { id: "ri8", rfqRef: "RFQ-2026-0410", vendorId: "v7", vendorName: "Eastern Steel Mills", invitedAt: "2026-04-12", vendorStatus: "Quoted", quotationId: "q6" },
  // RFQ-2026-0405
  { id: "ri9", rfqRef: "RFQ-2026-0405", vendorId: "v6", vendorName: "SafeGear PH", invitedAt: "2026-04-05", vendorStatus: "Quoted", quotationId: "q7" }
  // RFQ-2026-0422 (draft, no invites yet)
];
const RFQ_THREADS = [
  {
    rfqRef: "RFQ-2026-0420",
    vendorId: "v2",
    unreadForBuyer: 1,
    unreadForVendor: 0,
    messages: [
      { from: "buyer", text: "Can you confirm the cylinder bore is 100mm?", at: "Apr 22 09:14" },
      { from: "vendor", text: "Yes — 100mm bore × 200mm stroke. Quote attached.", at: "Apr 22 11:30" },
      { from: "vendor", text: "Lead time can be cut to 6 days if you confirm by Apr 25.", at: "Apr 23 08:02" }
    ]
  },
  {
    rfqRef: "RFQ-2026-0420",
    vendorId: "v1",
    unreadForBuyer: 0,
    unreadForVendor: 1,
    messages: [
      { from: "vendor", text: "Submitted quotation. Pricing in USD, FOB Cebu.", at: "Apr 22 14:11" },
      { from: "buyer", text: "Thanks — do you offer 30-day payment terms?", at: "Apr 23 07:50" }
    ]
  },
  {
    rfqRef: "RFQ-2026-0420",
    vendorId: "v3",
    unreadForBuyer: 0,
    unreadForVendor: 0,
    messages: [
      { from: "vendor", text: "Quote sent. Note: lubricant included as bonus.", at: "Apr 22 16:00" }
    ]
  },
  {
    rfqRef: "RFQ-2026-0420",
    vendorId: "v7",
    unreadForBuyer: 0,
    unreadForVendor: 0,
    messages: [
      { from: "buyer", text: "RFQ closes Apr 28 — please confirm if you'll bid.", at: "Apr 23 09:00" }
    ]
  }
];
const INVENTORY = [
  { id: "iv1", sku: "ACM-BRG-6204", name: "Deep Groove Ball Bearing 6204", category: "Bearings", uom: "pc", location: "Bay 4 · Rack A1", onHand: 28, onOrder: 100, reorderPoint: 60, reorderQty: 200, lastReceivedAt: "2026-03-28", preferredVendorId: "v1", preferredVendorName: "Acme Industrial Supply", unitCost: 12.5 },
  { id: "iv2", sku: "ACM-HYD-25M", name: "Hydraulic Hose 25mm × 5m", category: "Hydraulics", uom: "pc", location: "Bay 4 · Rack B2", onHand: 4, onOrder: 12, reorderPoint: 10, reorderQty: 24, lastReceivedAt: "2026-04-02", preferredVendorId: "v2", preferredVendorName: "Northstar Hydraulics", unitCost: 84 },
  { id: "iv3", sku: "VC-LUB-200L", name: "Industrial Lubricant 200L Drum", category: "Chemicals", uom: "drum", location: "Chem Store · Pad 1", onHand: 6, onOrder: 4, reorderPoint: 4, reorderQty: 8, lastReceivedAt: "2026-03-20", preferredVendorId: "v3", preferredVendorName: "Vertex Chemicals", unitCost: 480 },
  { id: "iv4", sku: "BN-FAS-M12", name: "Hex Bolt M12 × 60 Grade 8.8 (100pk)", category: "Fasteners", uom: "pack", location: "Bay 2 · Bin C5", onHand: 22, onOrder: 0, reorderPoint: 15, reorderQty: 40, lastReceivedAt: "2026-04-12", preferredVendorId: "v4", preferredVendorName: "Bolt & Nut Co.", unitCost: 42 },
  { id: "iv5", sku: "SG-HLM-T1E", name: "Hard Hat Type 1 Class E (Yellow)", category: "Safety", uom: "pc", location: "PPE Store · Shelf D1", onHand: 0, onOrder: 200, reorderPoint: 60, reorderQty: 200, lastReceivedAt: "2026-03-15", preferredVendorId: "v6", preferredVendorName: "SafeGear PH", unitCost: 18.9 },
  { id: "iv6", sku: "SG-GLV-CUT5", name: "Cut-Resistant Gloves Level 5", category: "Safety", uom: "pair", location: "PPE Store · Shelf D2", onHand: 84, onOrder: 0, reorderPoint: 50, reorderQty: 100, lastReceivedAt: "2026-04-08", preferredVendorId: "v6", preferredVendorName: "SafeGear PH", unitCost: 9.5 },
  { id: "iv7", sku: "ES-PLT-10MM", name: "Steel Plate 10mm 1220×2440", category: "Raw Materials", uom: "sheet", location: "Yard · Stack 3", onHand: 8, onOrder: 12, reorderPoint: 12, reorderQty: 30, lastReceivedAt: "2026-04-21", preferredVendorId: "v7", preferredVendorName: "Eastern Steel Mills", unitCost: 312 },
  { id: "iv8", sku: "ACM-MRO-WD40", name: "Multi-Use Lubricant 400ml", category: "MRO", uom: "can", location: "Tool Crib · Shelf E", onHand: 142, onOrder: 0, reorderPoint: 40, reorderQty: 120, lastReceivedAt: "2026-04-10", preferredVendorId: "v1", preferredVendorName: "Acme Industrial Supply", unitCost: 9.5 },
  { id: "iv9", sku: "NS-CYL-50T", name: "Hydraulic Cylinder 50-ton", category: "Hydraulics", uom: "pc", location: "Bay 4 · Heavy Rack", onHand: 1, onOrder: 2, reorderPoint: 2, reorderQty: 2, lastReceivedAt: "2026-02-18", preferredVendorId: "v2", preferredVendorName: "Northstar Hydraulics", unitCost: 2640 },
  { id: "iv10", sku: "VC-DEG-25L", name: "Industrial Degreaser 25L", category: "Chemicals", uom: "pail", location: "Chem Store · Pad 2", onHand: 12, onOrder: 0, reorderPoint: 8, reorderQty: 24, lastReceivedAt: "2026-04-05", preferredVendorId: "v3", preferredVendorName: "Vertex Chemicals", unitCost: 145 },
  { id: "iv11", sku: "BN-NUT-M16", name: "Hex Nut M16 Grade 8 (100pk)", category: "Fasteners", uom: "pack", location: "Bay 2 · Bin C6", onHand: 9, onOrder: 0, reorderPoint: 12, reorderQty: 25, lastReceivedAt: "2026-03-30", preferredVendorId: "v4", preferredVendorName: "Bolt & Nut Co.", unitCost: 28 },
  { id: "iv12", sku: "ACM-BRG-6307", name: "Deep Groove Ball Bearing 6307", category: "Bearings", uom: "pc", location: "Bay 4 · Rack A2", onHand: 64, onOrder: 0, reorderPoint: 30, reorderQty: 120, lastReceivedAt: "2026-04-01", preferredVendorId: "v1", preferredVendorName: "Acme Industrial Supply", unitCost: 18.4 }
];
function getStockState(item) {
  if (item.onHand <= 0) return "Out of stock";
  if (item.onHand <= item.reorderPoint) return "Low stock";
  return "In stock";
}
const $$splitNotFoundComponentImporter = () => import("./buyer.rfqs._rfqId.js");
const $$splitComponentImporter = () => import("./buyer.rfqs._rfqId2.js");
const Route2 = createFileRoute("/buyer/rfqs/$rfqId")({
  loader: ({
    params
  }) => {
    const rfq = RFQS.find((r) => r.id === params.rfqId);
    if (!rfq) throw notFound();
    return rfq;
  },
  component: lazyRouteComponent($$splitComponentImporter, "component"),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
const VendorRoute = Route$z.update({
  id: "/vendor",
  path: "/vendor",
  getParentRoute: () => Route$A
});
const RegisterRoute = Route$y.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => Route$A
});
const OnboardingRoute = Route$x.update({
  id: "/onboarding",
  path: "/onboarding",
  getParentRoute: () => Route$A
});
const LoginRoute = Route$w.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$A
});
const BuyerRoute = Route$v.update({
  id: "/buyer",
  path: "/buyer",
  getParentRoute: () => Route$A
});
const IndexRoute = Route$u.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$A
});
const VendorIndexRoute = Route$t.update({
  id: "/",
  path: "/",
  getParentRoute: () => VendorRoute
});
const BuyerIndexRoute = Route$s.update({
  id: "/",
  path: "/",
  getParentRoute: () => BuyerRoute
});
const VendorStorefrontRoute = Route$r.update({
  id: "/storefront",
  path: "/storefront",
  getParentRoute: () => VendorRoute
});
const VendorSettingsRoute = Route$q.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => VendorRoute
});
const VendorRfqsRoute = Route$p.update({
  id: "/rfqs",
  path: "/rfqs",
  getParentRoute: () => VendorRoute
});
const VendorReviewsRoute = Route$o.update({
  id: "/reviews",
  path: "/reviews",
  getParentRoute: () => VendorRoute
});
const VendorPurchaseOrdersRoute = Route$n.update({
  id: "/purchase-orders",
  path: "/purchase-orders",
  getParentRoute: () => VendorRoute
});
const VendorProductsRoute = Route$m.update({
  id: "/products",
  path: "/products",
  getParentRoute: () => VendorRoute
});
const VendorPayoutsRoute = Route$l.update({
  id: "/payouts",
  path: "/payouts",
  getParentRoute: () => VendorRoute
});
const VendorOrdersRoute = Route$k.update({
  id: "/orders",
  path: "/orders",
  getParentRoute: () => VendorRoute
});
const VendorMessagesRoute = Route$j.update({
  id: "/messages",
  path: "/messages",
  getParentRoute: () => VendorRoute
});
const VendorInvoicesRoute = Route$i.update({
  id: "/invoices",
  path: "/invoices",
  getParentRoute: () => VendorRoute
});
const VendorDeliveriesRoute = Route$h.update({
  id: "/deliveries",
  path: "/deliveries",
  getParentRoute: () => VendorRoute
});
const VendorComplianceRoute = Route$g.update({
  id: "/compliance",
  path: "/compliance",
  getParentRoute: () => VendorRoute
});
const VendorBuyersRoute = Route$f.update({
  id: "/buyers",
  path: "/buyers",
  getParentRoute: () => VendorRoute
});
const BuyerVendorsRoute = Route$e.update({
  id: "/vendors",
  path: "/vendors",
  getParentRoute: () => BuyerRoute
});
const BuyerSettingsRoute = Route$d.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => BuyerRoute
});
const BuyerRiskRoute = Route$c.update({
  id: "/risk",
  path: "/risk",
  getParentRoute: () => BuyerRoute
});
const BuyerRfqsRoute = Route$b.update({
  id: "/rfqs",
  path: "/rfqs",
  getParentRoute: () => BuyerRoute
});
const BuyerRequisitionsRoute = Route$a.update({
  id: "/requisitions",
  path: "/requisitions",
  getParentRoute: () => BuyerRoute
});
const BuyerReceiptsRoute = Route$9.update({
  id: "/receipts",
  path: "/receipts",
  getParentRoute: () => BuyerRoute
});
const BuyerQuotationsRoute = Route$8.update({
  id: "/quotations",
  path: "/quotations",
  getParentRoute: () => BuyerRoute
});
const BuyerPurchaseOrdersRoute = Route$7.update({
  id: "/purchase-orders",
  path: "/purchase-orders",
  getParentRoute: () => BuyerRoute
});
const BuyerPaymentsRoute = Route$6.update({
  id: "/payments",
  path: "/payments",
  getParentRoute: () => BuyerRoute
});
const BuyerMessagesRoute = Route$5.update({
  id: "/messages",
  path: "/messages",
  getParentRoute: () => BuyerRoute
});
const BuyerMarketplaceRoute = Route$4.update({
  id: "/marketplace",
  path: "/marketplace",
  getParentRoute: () => BuyerRoute
});
const BuyerInventoryRoute = Route$3.update({
  id: "/inventory",
  path: "/inventory",
  getParentRoute: () => BuyerRoute
});
const BuyerBillsRoute = Route$2.update({
  id: "/bills",
  path: "/bills",
  getParentRoute: () => BuyerRoute
});
const VendorRfqsRfqIdRoute = Route$1.update({
  id: "/$rfqId",
  path: "/$rfqId",
  getParentRoute: () => VendorRfqsRoute
});
const BuyerRfqsRfqIdRoute = Route2.update({
  id: "/$rfqId",
  path: "/$rfqId",
  getParentRoute: () => BuyerRfqsRoute
});
const BuyerRfqsRouteChildren = {
  BuyerRfqsRfqIdRoute
};
const BuyerRfqsRouteWithChildren = BuyerRfqsRoute._addFileChildren(
  BuyerRfqsRouteChildren
);
const BuyerRouteChildren = {
  BuyerBillsRoute,
  BuyerInventoryRoute,
  BuyerMarketplaceRoute,
  BuyerMessagesRoute,
  BuyerPaymentsRoute,
  BuyerPurchaseOrdersRoute,
  BuyerQuotationsRoute,
  BuyerReceiptsRoute,
  BuyerRequisitionsRoute,
  BuyerRfqsRoute: BuyerRfqsRouteWithChildren,
  BuyerRiskRoute,
  BuyerSettingsRoute,
  BuyerVendorsRoute,
  BuyerIndexRoute
};
const BuyerRouteWithChildren = BuyerRoute._addFileChildren(BuyerRouteChildren);
const VendorRfqsRouteChildren = {
  VendorRfqsRfqIdRoute
};
const VendorRfqsRouteWithChildren = VendorRfqsRoute._addFileChildren(
  VendorRfqsRouteChildren
);
const VendorRouteChildren = {
  VendorBuyersRoute,
  VendorComplianceRoute,
  VendorDeliveriesRoute,
  VendorInvoicesRoute,
  VendorMessagesRoute,
  VendorOrdersRoute,
  VendorPayoutsRoute,
  VendorProductsRoute,
  VendorPurchaseOrdersRoute,
  VendorReviewsRoute,
  VendorRfqsRoute: VendorRfqsRouteWithChildren,
  VendorSettingsRoute,
  VendorStorefrontRoute,
  VendorIndexRoute
};
const VendorRouteWithChildren = VendorRoute._addFileChildren(VendorRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  BuyerRoute: BuyerRouteWithChildren,
  LoginRoute,
  OnboardingRoute,
  RegisterRoute,
  VendorRoute: VendorRouteWithChildren
};
const routeTree = Route$A._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({ error, reset }) {
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-destructive",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "An unexpected error occurred. Please try again." }),
    false,
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  ROLE_PERMISSIONS as A,
  BUYER_TEAM as B,
  CONVERSATIONS as C,
  DELIVERIES as D,
  CURRENT_TENANT as E,
  BUYER_ROLE_PERMISSIONS as F,
  GOODS_RECEIPTS as G,
  CURRENT_BUYER_TENANT as H,
  INVENTORY as I,
  BUYER_PAYMENTS as J,
  BUYER_CONVERSATIONS as K,
  Link as L,
  MARKETPLACE_ORDERS as M,
  MARKETPLACE_PRODUCTS as N,
  MARKETPLACE_CATEGORIES as O,
  PURCHASE_ORDERS as P,
  QUOTATIONS as Q,
  ROLE_LABELS as R,
  SPEND_SERIES as S,
  TEAM_MEMBERS as T,
  Route$1 as U,
  VENDOR_BILLS as V,
  Route2 as W,
  RFQ_LINES as X,
  RFQ_INVITATIONS as Y,
  RFQ_THREADS as Z,
  router as _,
  ROLE_DESCRIPTIONS as a,
  Route$x as b,
  BUYER_ROLE_LABELS as c,
  BUYER_ROLE_DESCRIPTIONS as d,
  ReactDOM as e,
  REVENUE_SERIES as f,
  formatCurrency as g,
  REVIEWS as h,
  REQUISITIONS as i,
  BUYER_PURCHASE_ORDERS as j,
  RISK_ALERTS as k,
  BUYER_VENDORS as l,
  formatBuyerCurrency as m,
  SPEND_BY_CATEGORY as n,
  getStockState as o,
  PRODUCTS as p,
  formatCurrencyDecimal as q,
  reactDomExports as r,
  INCOMING_RFQS as s,
  PRODUCT_CATEGORIES as t,
  useNavigate as u,
  PAYOUTS as v,
  INVOICES as w,
  COMPLIANCE_DOCS as x,
  BUYERS as y,
  RFQS as z
};
