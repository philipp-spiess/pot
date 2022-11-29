import * as H from "history";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { navigate } from "./navigation";

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
export interface RouterContextType {
  history: H.History;
  mutableState: RouterState;
}

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  native?: boolean;
}
export function Link(props: LinkProps) {
  const routerContext = React.useContext(RouterContext);
  if (!routerContext) {
    throw new Error("<Link /> must be used within a <Router />");
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

export const RouterContext = React.createContext<null | RouterContextType>(
  null
);

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

export function getUrl(location: {
  pathname: string;
  search: string;
  hash: string;
}): string {
  return `${location.pathname}${location.search}${location.hash}`;
}
