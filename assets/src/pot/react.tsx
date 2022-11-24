import { createContext, useContext, useLayoutEffect, useRef } from "react";

interface LoaderDataContextType<T> {
  isLoading: boolean;
  data: T;
  subscribers: Array<(data: T) => void>;
}
export const LoaderDataContext = createContext<LoaderDataContextType<any>>({
  isLoading: true,
  data: null,
  subscribers: [],
});
export function useLoaderData<T>(): T {
  const ref = useRef<null | Promise<T>>(null);
  const data = useContext(LoaderDataContext);
  if (!data.isLoading) {
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
  isLoading: boolean;
  data: T;
  children: React.ReactNode;
}) {
  const data = useRef<LoaderDataContextType<T>>({
    isLoading: false,
    data: props.data,
    subscribers: [],
  });

  // 😈
  if (
    data.current.isLoading !== props.isLoading ||
    data.current.data !== props.data
  ) {
    data.current.subscribers.forEach((resolve) => resolve(props.data));
    data.current = {
      isLoading: props.isLoading,
      data: props.data,
      subscribers: [],
    };
  }

  return (
    <LoaderDataContext.Provider value={data.current}>
      {props.children}
    </LoaderDataContext.Provider>
  );
}
