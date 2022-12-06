import { useLoaderData } from "../pot/react";
interface LoaderData {
  topSecretPassword: string;
}

export default function Admin() {
  const data = useLoaderData<LoaderData>();
  return (
    <div style={{ fontFamily: "monospace" }}>
      <div>
        Top secret admin interface! The password is:{" "}
        <span style={{ color: "red" }}>{data.topSecretPassword}</span>
      </div>
    </div>
  );
}
