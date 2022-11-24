import "vite/modulepreload-polyfill";

import ReactDOM from "react-dom/client";
import React from "react";
import Main from "./Main";

console.log("Hi, I'm a JS module");

declare global {
  interface Window {
    __runMe?: Array<() => void>;

    __loadEntrypoint?: (name: string, data: mixed) => void;
    __provideLoaderData?: (data: any) => void;
  }
}

let root: null | ReactDOM.Root = null;
window.__loadEntrypoint = (name: string) => {
  const EntryPoint = createEntryPoint(name);
  root = ReactDOM.createRoot(document.getElementById("app")!);

  React.startTransition(() =>
    root!.render(<Main EntryPoint={EntryPoint} isLoading={true} data={null} />)
  );
  window.__provideLoaderData = (data: any) => {
    React.startTransition(() =>
      root!.render(
        <Main EntryPoint={EntryPoint} isLoading={false} data={data} />
      )
    );
  };
};

if (window.__runMe) {
  window.__runMe.forEach((run) => run());
}

function createEntryPoint(name: string): React.ComponentType {
  const parts = name.split("/");
  let importPromise: any;
  // prettier-ignore
  switch (parts.length) {
    case 1: importPromise = import(`../entrypoints/${name}.tsx`); break;
    case 2: importPromise = import(`../entrypoints/${parts[0]}/${parts[1]}.tsx`); break;
    case 3: importPromise = import(`../entrypoints/${parts[0]}/${parts[1]}/${parts[2]}.tsx`); break;
    case 4: importPromise = import(`../entrypoints/${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}.tsx`); break;
    case 5: importPromise = import(`../entrypoints/${parts[0]}/${parts[1]}/${parts[2]}/${parts[3]}/${parts[4]}.tsx`); break;
    default: throw new Error(`Invalid entrypoint name: ${name}`);
  }
  return React.lazy(() => importPromise);
}
