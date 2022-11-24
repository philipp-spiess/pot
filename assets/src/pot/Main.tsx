import React, { StrictMode, Suspense } from "react";
import { ProvideLoaderData } from "./react";

interface Props {
  EntryPoint: React.ComponentType;
  isLoading: boolean;
  data: any;
}
export default function Main({ EntryPoint, isLoading, data }: Props) {
  return (
    <StrictMode>
      <Suspense fallback={"Loading..."}>
        <ProvideLoaderData isLoading={isLoading} data={data}>
          <EntryPoint />
        </ProvideLoaderData>
      </Suspense>
    </StrictMode>
  );
}
