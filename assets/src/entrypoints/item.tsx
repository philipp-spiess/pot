import { Link, useLoaderData } from "../pot/react";

interface LoaderData {
  item: { id: number; done: boolean; text: string };
}

export default function Items() {
  const data = useLoaderData<LoaderData>();
  return (
    <div className="h-100 w-xl flex items-center justify-center bg-teal-lightest font-sans">
      <div className="bg-white rounded shadow p-6 m-4 w-full lg:w-3/4 lg:max-w-lg">
        <div>
          <Link
            to={`/pot`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            ← Back
          </Link>
        </div>
        Single item view:
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
