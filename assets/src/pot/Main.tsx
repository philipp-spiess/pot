import React, { StrictMode, Suspense } from "react";
import { ProvideLoaderData, Router } from "./react";
import { createBrowserHistory } from "history";
import { Data, Entrypoints } from "./init";

const history = createBrowserHistory();

interface Props {
  entrypoints: Entrypoints;
  data: Data;
}
export default function Main({ entrypoints, data }: Props) {
  return (
    <StrictMode>
      <Suspense fallback={"Loading..."}>
        <Router history={history}>
          {entrypoints.reduce<React.ReactNode>((children, entrypoint) => {
            const Entrypoint = entrypoint.entrypoint;
            // A layout path can collide with the route path so we add a prefix
            const key =
              (entrypoint.isCurrentRoute ? "__route" : "") + entrypoint.path;
            const routeData = entrypoint.isCurrentRoute
              ? data.routeData
              : data.layoutData.get(entrypoint.path);
            return (
              <ProvideLoaderData key={key} data={routeData}>
                {/* @ts-ignore */}
                <Entrypoint key={key} children={children} />
              </ProvideLoaderData>
            );
          }, undefined)}
        </Router>
      </Suspense>
    </StrictMode>
  );
}
