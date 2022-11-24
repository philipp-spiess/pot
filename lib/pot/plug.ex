defmodule Pot.Plug do
  import Plug.Conn

  def init(options), do: options

  def call(conn, _opts) do
    {:ok, conn} =
      conn
      |> put_resp_content_type("text/html")
      |> send_chunked(200)
      |> chunk(~s"""
      <html><head>
      <!-- <%= if is_prod() do %> -->
      <!-- prod -->
      <!-- <link phx-track-static rel="stylesheet" href="{Vite.Manifest.main_css()}" /> -->
      <!-- <script type="module" crossorigin defer phx-track-static src="{Vite.Manifest.main_js()}"></script> -->
      <!-- <link rel="modulepreload" href="{Vite.Manifest.vendor_js()}" /> -->
      <!-- end prod -->
      <!-- <% else %> -->
      <script type="module" async>
        import RefreshRuntime from 'http://localhost:5173/@react-refresh'
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
      </script>
      <!-- dev/test -->
      <link rel="modulepreload" href="http://localhost:5173/@vite/client" />
      <link rel="modulepreload" href="http://localhost:5173/src/pot/init.tsx" />
      <link rel="modulepreload" href="http://localhost:5173/src/entrypoints/item.tsx" />
      <script type="module" src="http://localhost:5173/@vite/client" async></script>
      <script type="module" src="http://localhost:5173/src/pot/init.tsx" async></script>
      <!-- end dev -->
      <!-- <% end %> -->
      </head>
      <body>
      <div id="app"></div>
      #{js_payload("window.__loadEntrypoint(\"item\");")}
      </script>
      """)

    loader_data = data()
    {:ok, conn} = conn |> chunk("#{js_payload("window.__provideLoaderData(#{loader_data});")}")

    {:ok, conn} = conn |> chunk("</html>")

    conn
  end

  def data() do
    Process.sleep(2000)

    items =
      Pot.Todo.list_items()
      |> Enum.map(fn item ->
        %{
          "id" => item.id,
          "done" => item.done,
          "text" => item.text
          # "insertedAt" => item.inserted_at,
          # "updatedAt" => item.updated_at
        }
      end)

    json(%{"items" => items})
  end

  def json(data) do
    Phoenix.json_library().encode!(data)
  end

  defp js_payload(javascript) do
    ~s"""
    <script type="module" async>
    function init() {
      #{javascript}
    }

    if (window.__loadEntrypoint) { init(); }
    else { window.__runMe.push(init); }
    </script>
    """
  end
end
