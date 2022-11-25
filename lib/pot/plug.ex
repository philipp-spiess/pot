defmodule Pot.Plug do
  import Plug.Conn

  def init(options), do: options

  def call(%Plug.Conn{params: %{"_navigation" => _navigation}} = conn, opts) do
    entrypoint = apply(opts, :entrypoint, [conn, conn.params])

    navigation_preamble =
      Phoenix.json_library().encode!(%{
        entrypoint: entrypoint,
        entrypointModule: module_path_for_entrypoint(entrypoint)
      })

    conn =
      conn
      |> put_resp_header("x-pot-preamble", navigation_preamble)
      |> put_resp_content_type("application/json")
      |> send_chunked(200)

    loader_data = get_loader_data(opts, conn)
    {:ok, conn} = conn |> chunk(loader_data)

    conn
  end

  def call(conn, opts) do
    entrypoint = apply(opts, :entrypoint, [conn, conn.params])

    {:ok, conn} =
      conn
      |> put_resp_content_type("text/html")
      |> send_chunked(200)
      |> chunk(preamble(entrypoint))

    loader_data = get_loader_data(opts, conn)
    {:ok, conn} = conn |> chunk("#{js_payload("window.__provideLoaderData(#{loader_data});")}")

    {:ok, conn} = conn |> chunk("</html>")

    conn
  end

  defp preamble(entrypoint) do
    ~s"""
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
    <link rel="modulepreload" href="#{module_path_for_entrypoint(entrypoint)}" />
    <script type="module" src="http://localhost:5173/@vite/client" async></script>
    <script type="module" src="http://localhost:5173/src/pot/init.tsx" async></script>
    <!-- end dev -->
    <!-- <% end %> -->
    </head>
    <body>
    <div id="app"></div>
    #{js_payload("window.__loadEntrypoint(\"#{entrypoint}\");")}
    </script>
    """
  end

  defp module_path_for_entrypoint(entrypoint) do
    # TODO: Must be different in production (need to look into the Vite manifest)
    "http://localhost:5173/src/entrypoints/#{entrypoint}.tsx"
  end

  defp js_payload(javascript) do
    ~s"""
    <script type="module" async>
    function init() {
      #{javascript}
    }

    if (window.__loadEntrypoint) { init(); }
    else { window.__runMe ? window.__runMe.push(init) : window.__runMe = [init]; }
    </script>
    """
  end

  defp get_loader_data(view, conn) do
    loader_data = apply(view, :loader_data, [conn, conn.params])

    if loader_data == nil do
      "{}"
    else
      loader_data
    end
  end
end
