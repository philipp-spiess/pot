import { startTransition } from "react";
import { createEntrypoint, preloadEntrypointModule } from "./entrypoint";
import { getUrl, RouterContextType } from "./Router";

interface Submission {
  method: string;
  formData: FormData;
}

interface NavigationPreamble {
  entrypointModule: string;
  entrypoint: string;
}

export async function navigate(
  to: string,
  { history, mutableState }: RouterContextType,
  submission?: Submission
): Promise<void> {
  const url = new URL(to, window.location.href);

  // Tag the request so the backend knows this comes from a pot client. We use
  // a search param for easier caching and a custom header so redirects work
  // even if they are handled outside of pot routes.
  //
  // We include information about the current route so that the backend can
  // figure out if we can reuse layouts later
  const currentRoute = history.location.pathname;
  url.searchParams.set("_route", currentRoute);
  const headers = {
    "x-pot-route": currentRoute,
  };

  // We need to abort the previous request if another navigation is happening
  // while the data for the previous one was not fully loaded yet. We later
  // use isCurrentRequest() after every async boundary to make sure we don't
  // process data for the wrong route.
  if (mutableState.abort !== null) {
    history.replace(to);
    mutableState.abort.abort();
  } else {
    history.push(to);
  }
  mutableState.abort = new AbortController();
  mutableState.lastTo = to;
  function isCurrentRequest() {
    return mutableState.lastTo === to;
  }

  try {
    let request: RequestInit = {
      credentials: "same-origin",
      signal: mutableState.abort.signal,
      redirect: "follow",
      headers,
    };
    if (submission) {
      request = setSubmissionRequest(submission, request);
    }
    const response = await fetch(url.toString(), request);
    if (!isCurrentRequest) {
      return;
    }

    // We follow redirects in the fetch call but if the call was redirected, we
    // need to rewrite the history to the new location.
    if (response.redirected) {
      history.replace(response.url);
      const url = new URL(response.url);
      to = getUrl(url);
      mutableState.lastTo = to;
    }

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
      window.__rerender && window.__rerender(entrypoint, true, null);
    });

    const json = await response.json();
    if (!isCurrentRequest) {
      return;
    }

    startTransition(() => {
      window.__rerender && window.__rerender(entrypoint, false, json);
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      // We aborted this navigation, so we don't need to do anything.
      return;
    }
    throw error;
  } finally {
    if (mutableState.lastTo !== to) {
      return;
    }
    mutableState.abort = null;
  }
}

function setSubmissionRequest(
  submission: Submission,
  request: RequestInit
): RequestInit {
  let { method, formData } = submission;

  const body = new URLSearchParams();
  for (let [key, value] of formData) {
    if (typeof value !== "string") {
      throw new Error("File inputs are not supported yet");
    }
    body.append(key, value);
  }

  return {
    ...request,
    method,
    body,
    credentials: "same-origin",
    headers: {
      ...request.headers,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
}
