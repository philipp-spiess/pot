import "vite/modulepreload-polyfill";

import ReactDOM from "react-dom/client";
import React from "react";
import Main from "./Main";
import { createEntrypoint as createEntrypoint } from "./entrypoint";

import "../../css/app.css";

declare global {
  interface Window {
    __runMe?: Array<() => void>;

    __loadEntrypoint?: (name: string) => void;
    __provideLoaderData?: (data: any) => void;
    __rerender?: (
      Entrypoint: React.ComponentType,
      isLoading: boolean,
      data: any
    ) => void;
  }
}

let root: null | ReactDOM.Root = null;
window.__loadEntrypoint = (name: string) => {
  const Entrypoint = createEntrypoint(name);
  root = ReactDOM.createRoot(document.getElementById("app")!);

  React.startTransition(() =>
    root!.render(<Main Entrypoint={Entrypoint} isLoading={true} data={null} />)
  );
  window.__provideLoaderData = (data: any) => {
    React.startTransition(() =>
      root!.render(
        <Main Entrypoint={Entrypoint} isLoading={false} data={data} />
      )
    );
  };
  window.__rerender = (
    Entrypoint: React.ComponentType,
    isLoading: boolean,
    data: any
  ) => {
    root!.render(
      <Main Entrypoint={Entrypoint} isLoading={isLoading} data={data} />
    );
  };
};

if (window.__runMe) {
  window.__runMe.forEach((run) => run());
}
