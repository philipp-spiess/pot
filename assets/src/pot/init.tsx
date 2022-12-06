import "vite/modulepreload-polyfill";

import ReactDOM from "react-dom/client";
import React from "react";
import Main from "./Main";
import { createEntrypoint as createEntrypoint } from "./entrypoint";

import "../../css/app.css";

export type RawEntrypoints = Array<{
  path: string;
  current?: true;
  entrypoint: string;
  module: string;
  reload: boolean;
}>;

export type RawData = Array<{
  path: string;
  current?: true;
  // When no data is set, the entrypoint does not need to have it's data updated
  data?: string;
}>;

export type Entrypoints = Array<{
  path: string;
  entrypoint: React.ComponentType;
  isCurrentRoute: boolean;
}>;

export type Data = {
  layoutData: Map<string, null | any>;
  routeData: null | any;
};

declare global {
  interface Window {
    __runMe?: Array<() => void>;

    // Used by Elixir or the Router
    __loadEntrypoints?: (entrypoints: RawEntrypoints) => void;
    __provideLoaderData?: (data: RawData) => void;
  }
}

// Since layouts might not always return new data when loaders are called, we
// keep track of the currently mounted layout and their data.
let activeLayoutData: Map<string, null | any> = new Map();

let root: null | ReactDOM.Root = null;
window.__loadEntrypoints = (rawEntrypoints: RawEntrypoints) => {
  if (root === null) {
    root = ReactDOM.createRoot(document.getElementById("app")!);
  }

  function parseEntrypoints(rawEntrypoints: RawEntrypoints): Entrypoints {
    const entrypoints = rawEntrypoints.map((rawEntrypoint) => {
      const isCurrentRoute = rawEntrypoint.current ?? false;
      const shouldReloadData = rawEntrypoint.reload ?? false;
      const path = rawEntrypoint.path;

      const entrypoint = {
        path,
        isCurrentRoute,
        entrypoint: createEntrypoint(rawEntrypoint.entrypoint),
      };

      if (!isCurrentRoute) {
        if (!activeLayoutData.has(path)) {
          activeLayoutData.set(path, null);
        }

        // In the case that a layout route is being reloaded, we do not need to
        // suspend it right away. It's fine if we show stale data until the
        // router data kicks in to avoid any UI flickering.
        // if (shouldReloadData) {}
      }

      return entrypoint;
    });

    // Throw away cached loader data for layouts that are no longer mounted
    for (const [path] of activeLayoutData) {
      if (!entrypoints.some((e) => e.path === path)) {
        activeLayoutData.delete(path);
      }
    }

    return entrypoints;
  }

  let entrypoints = parseEntrypoints(rawEntrypoints);

  React.startTransition(() =>
    root!.render(
      <Main
        entrypoints={entrypoints}
        data={{
          layoutData: activeLayoutData,
          routeData: null,
        }}
      />
    )
  );

  window.__provideLoaderData = (rawData: RawData) => {
    function parseData(rawData: RawData): Data {
      let routeData: null | any = null;
      for (const entrypoint of rawData) {
        const isCurrentRoute = entrypoint.current ?? false;
        if (typeof entrypoint.data === "undefined") {
          if (isCurrentRoute) {
            throw new Error("The current route must always have data");
          } else if (!activeLayoutData.has(entrypoint.path)) {
            throw new Error("No cached data found for " + entrypoint.path);
          }
        } else {
          const data = JSON.parse(entrypoint.data);
          if (!isCurrentRoute) {
            activeLayoutData.set(entrypoint.path, data);
          } else {
            routeData = data;
          }
        }
      }

      return { layoutData: activeLayoutData, routeData };
    }

    const data = parseData(rawData);
    React.startTransition(() =>
      root!.render(<Main entrypoints={entrypoints} data={data} />)
    );
  };
};

if (window.__runMe) {
  window.__runMe.forEach((run) => run());
}
