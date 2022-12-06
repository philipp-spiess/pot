import Nav from "../Nav";
import { useLoaderData } from "../pot/react";

interface LoaderData {
  user: string;
  serverTime: string;
}

export default function Layout(props: { children: React.ReactNode }) {
  const data = useLoaderData<LoaderData>();
  return (
    <div>
      <Nav user={data.user} serverTime={data.serverTime} />
      {props.children}
    </div>
  );
}
