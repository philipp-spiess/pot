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
  try {
    const url = new URL(to, window.location.href);
    url.searchParams.set("_navigation", history.location.pathname);

    if (mutableState.abort !== null) {
      history.replace(to);
      mutableState.abort.abort();
    } else {
      history.push(to);
    }
    mutableState.abort = new AbortController();
    mutableState.lastTo = to;

    const response = await fetch(url.toString(), {
      credentials: "same-origin",
      signal: mutableState.abort.signal,
    });

    if (response.status !== 200) {
      throw new Error("Failed to navigate");
    }

    const rawPreamble = response.headers.get("x-pot-preamble");
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
      if (mutableState.lastTo !== to) {
        return;
      }
      window.__rerender && window.__rerender(entrypoint, true, null);
    });

    const json = await response.json();
    startTransition(() => {
      if (mutableState.lastTo !== to) {
        return;
      }
      window.__rerender && window.__rerender(entrypoint, false, json);
      mutableState.abort = null;
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      // We aborted this navigation, so we don't need to do anything.
      return;
    }
    throw error;
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

function getUrl(location: H.Location) {
  return `${location.pathname}${location.search}${location.hash}`;
}
