import Nav from "../Nav";
import { useLoaderData } from "../pot/react";

interface LoaderData {
  user: string;
}

export default function Items(props: { children: React.ReactNode }) {
  const data = useLoaderData<LoaderData>();
  return (
    <>
      {JSON.stringify(data, null, 2)}
      <Nav />
      {props.children}
    </>
  );
}
