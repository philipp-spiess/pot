import { useLoaderData } from "../pot/react";
interface LoaderData {
  items: Array<{ id: number; done: boolean; text: string }>;
}

export default function Item() {
  const data = useLoaderData<LoaderData>();
  return (
    <div style={{ fontFamily: "monospace" }}>
      <input type="text" style={{ fontFamily: "monospace", width: 300 }} />
      <pre>
        {data.items.map((item) => (
          <div key={item.id}>
            {` ${item.id}. `}
            <a href="#">[{item.done ? "x" : ""}]</a>
            {` ${item.text}\n`}
          </div>
        ))}
      </pre>
    </div>
  );
}
