import { createContext, useContext, useLayoutEffect, useRef } from "react";

interface LoaderDataContextType<T> {
  data: null | T;
  subscribers: Array<(data: T) => void>;
}
export const LoaderDataContext = createContext<LoaderDataContextType<any>>({
  data: null,
  subscribers: [],
});
export function useLoaderData<T>(): T {
  const ref = useRef<null | Promise<T>>(null);
  const data = useContext(LoaderDataContext);
  if (data.data !== null) {
    return data.data as T;
  } else if (ref.current) {
    throw ref.current;
  } else {
    ref.current = new Promise((resolve) => {
      data.subscribers.push(resolve);
    });
    throw ref.current;
  }
}
export function ProvideLoaderData<T>(props: {
  data: T;
  children: React.ReactNode;
}) {
  const data = useRef<LoaderDataContextType<T>>({
    data: props.data,
    subscribers: [],
  });

  // 😈
  if (data.current.data !== props.data) {
    if (props.data !== null) {
      data.current.subscribers.forEach((resolve) => resolve(props.data));
      data.current = {
        data: props.data,
        subscribers: [],
      };
    } else {
      // We need to re-suspend. All current subscribers can stay subscribed but
      // we have to create a new context value to trigger re-renders.
      const subscribers = data.current.subscribers;
      data.current = {
        data: null,
        subscribers,
      };
    }
  }

  return (
    <LoaderDataContext.Provider value={data.current}>
      {props.children}
    </LoaderDataContext.Provider>
  );
}
