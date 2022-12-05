import Nav from "../Nav";
import { Form, Link, useLoaderData } from "../pot/react";
interface LoaderData {
  items: Array<{ id: number; done: boolean; text: string }>;
  errors?: Array<{ field: string; error: string }>;
}

export default function Items() {
  const data = useLoaderData<LoaderData>();
  return (
    <>
      <Nav />

      <div className="h-100 w-xl flex items-center justify-center bg-teal-lightest font-sans">
        <div className="bg-white rounded shadow p-6 m-4 w-full lg:w-3/4 lg:max-w-lg">
          {data.errors?.map((error) => (
            <div key={error.field} style={{ color: "red" }}>
              <strong>{error.field}: </strong>
              {error.error}
            </div>
          ))}

          <div className="mb-4">
            <h1 className="text-grey-darkest">Todo List</h1>
            <Form method="POST">
              <div className="flex mt-4">
                <input
                  type="text"
                  name="text"
                  autoFocus
                  className="shadow appearance-none border rounded w-full py-2 px-3 mr-4 text-grey-600"
                  placeholder="Add Todo"
                />
                <button className="flex-no-shrink p-2 border-2 rounded text-teal-500 border-teal-500 hover:text-white hover:bg-teal-500">
                  Add
                </button>
              </div>
            </Form>
          </div>
          <div>
            {data.items.map((item) => (
              <div key={item.id} className="flex mb-4 items-center">
                <p
                  className={`w-full text-grey-darkest ${
                    item.done ? "line-through" : ""
                  }`}
                >
                  <Link
                    to={`/pot/${item.id}`}
                    className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  >
                    {item.id}.{" "}
                  </Link>
                  {item.text}
                </p>

                <Form method="POST">
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    name="intent"
                    value="delete"
                    className="flex-no-shrink p-2 ml-2 border-2 rounded text-red-500 border-red-500 hover:text-white hover:bg-red-500"
                  >
                    Remove
                  </button>
                </Form>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
