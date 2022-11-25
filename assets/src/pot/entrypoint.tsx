import React from "react";

export function createEntrypoint(name: string): React.ComponentType {
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

export function preloadEntrypointModule(entrypointModule: string) {
  const link = document.createElement("link");
  link.rel = "modulepreload";
  link.href = entrypointModule;
  document.head.appendChild(link);
}
