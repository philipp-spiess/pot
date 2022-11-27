import * as H from "history";
import React, {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createEntrypoint, preloadEntrypointModule } from "./entrypoint";

interface RouterState {
  abort: AbortController | null;
  lastTo: string | null;
}
function createRouterState(): RouterState {
  return {
    abort: null,
    lastTo: null,
  };
}
interface RouterContextType {
  history: H.History;
  mutableState: RouterState;
}

interface NavigationPreamble {
  entrypointModule: string;
  entrypoint: string;
}

async function navigate(
  to: string,
  { history, mutableState }: RouterContextType
): Promise<void> {
  const url = new URL(to, window.location.href);

  // Tag the request so the backend knows this comes from a pot client. We use
  // a search param for easier caching and a custom header so redirects work
  // even if they are handled outside of pot routes.
  //
  // We include information about the current route so that the backend can
  // figure out if we can reuse layouts later
  //
  // TODO: Find out if we really need the search param.
  const currentRoute = history.location.pathname;
  url.searchParams.set("_route", currentRoute);
  const headers = { "x-pot-route": currentRoute };

  // We need to abort the previous request if another navigation is happening
  // while the data for the previous one was not fully loaded yet. We later
  // use isCurrentRequest() after every async boundary to make sure we don't
  // process data for the wrong route.
  if (mutableState.abort !== null) {
    history.replace(to);
    mutableState.abort.abort();
  } else {
    history.push(to);
  }
  mutableState.abort = new AbortController();
  mutableState.lastTo = to;
  function isCurrentRequest() {
    return mutableState.lastTo === to;
  }

  try {
    const response = await fetch(url.toString(), {
      credentials: "same-origin",
      signal: mutableState.abort.signal,
      redirect: "follow",
      headers,
    });
    if (!isCurrentRequest) {
      return;
    }

    // We follow redirects in the fetch call but if the call was redirected, we
    // need to rewrite the history to the new location.
    if (response.redirected) {
      history.replace(response.url);
      const url = new URL(response.url);
      to = getUrl(url);
      mutableState.lastTo = to;
    }

    if (response.status !== 200) {
      throw new Error("Failed to navigate");
    }

    const rawPreamble = response.headers.get("x-pot-preamble");
    console.log(rawPreamble);
    if (rawPreamble === null) {
      console.error(`❗️ You're navigating to a non-pot route. This is slow because we have to redirect.

Please use <Link to=\"${to}\" native /> instead.`);
      window.location.href = to;
      return;
    }

    const preamble: NavigationPreamble = JSON.parse(rawPreamble);
    preloadEntrypointModule(preamble.entrypointModule);

    const entrypoint = createEntrypoint(preamble.entrypoint);
    startTransition(() => {
      window.__rerender && window.__rerender(entrypoint, true, null);
    });

    const json = await response.json();
    if (!isCurrentRequest) {
      return;
    }

    startTransition(() => {
      window.__rerender && window.__rerender(entrypoint, false, json);
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      // We aborted this navigation, so we don't need to do anything.
      return;
    }
    throw error;
  } finally {
    if (mutableState.lastTo !== to) {
      return;
    }
    mutableState.abort = null;
  }
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  native?: boolean;
}
export function Link(props: LinkProps) {
  const routerContext = React.useContext(RouterContext);
  if (!routerContext) {
    throw new Error("Link must be used within a <Router>");
  }
  const onClick = (event: React.MouseEvent) => {
    if (
      props.native ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.shiftKey ||
      event.button
    ) {
      return;
    }
    event.preventDefault();
    navigate(props.to, routerContext);
  };

  return <a {...props} href={props.to} onClick={onClick} />;
}

const RouterContext = React.createContext<null | RouterContextType>(null);

interface RouterProps {
  history: H.History;
  children: React.ReactNode;
}
export function Router({ history, children }: RouterProps) {
  const [mutableState] = useState<RouterState>(createRouterState());
  const contextValue = useMemo(
    () => ({
      history,
      mutableState,
    }),
    [history]
  );
  const onHistoryChange = useCallback(
    (update: H.Update): void => {
      if (update.action !== H.Action.Pop) {
        return;
      }
      navigate(getUrl(update.location), contextValue);
    },
    [history, contextValue]
  );
  useEffect(() => history.listen(onHistoryChange), [onHistoryChange, history]);
  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  );
}

export function useHistory(): H.History {
  const routerContext = React.useContext(RouterContext);
  if (!routerContext) {
    throw new Error("useHistory must be used within a <Router>");
  }
  return routerContext.history;
}

function getUrl(location: {
  pathname: string;
  search: string;
  hash: string;
}): string {
  return `${location.pathname}${location.search}${location.hash}`;
}
