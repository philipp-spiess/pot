import React, { StrictMode, Suspense } from "react";
import { ProvideLoaderData, Router } from "./react";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

interface Props {
  Entrypoint: React.ComponentType;
  isLoading: boolean;
  data: any;
}
export default function Main({ Entrypoint, isLoading, data }: Props) {
  return (
    <StrictMode>
      <Suspense fallback={"Loading..."}>
        <Router history={history}>
          <ProvideLoaderData isLoading={isLoading} data={data}>
            <Entrypoint />
          </ProvideLoaderData>
        </Router>
      </Suspense>
    </StrictMode>
  );
}
