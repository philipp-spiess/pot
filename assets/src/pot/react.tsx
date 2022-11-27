export { ProvideLoaderData, useLoaderData } from "./loaderData";
export { Router, Link } from "./Router";
export { Form } from "./Form";

export const csrfToken = document
  .querySelector("meta[name=csrf-token]")
  ?.getAttribute("content");
