import "vite/modulepreload-polyfill";

import Router from "./router";

import ReactDOM from "react-dom/client";

console.log("Hi, I'm a JS module");

ReactDOM.createRoot(document.getElementById("app")!).render(<Router />);
