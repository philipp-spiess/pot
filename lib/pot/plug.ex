defmodule Pot.Plug do
  import Plug.Conn

  def init(pot), do: pot

  def call(%Plug.Conn{method: "POST"} = conn, pot), do: handle_action(conn, pot)

  def call(%Plug.Conn{params: %{"_route" => route}} = conn, pot),
    do: handle_navigation(conn, pot, route)

  def call(conn, pot) do
    case get_req_header(conn, "x-pot-route") do
      [route] -> handle_navigation(conn, pot, route)
      _ -> handle_initial_load(conn, pot)
    end
  end

  defp handle_action(conn, pot) do
    # Actions run their data loaders eagerly
    loader_data = apply(pot, :action, [conn, conn.params])

    case get_req_header(conn, "x-pot-route") do
      [route] -> handle_navigation(conn, pot, route, fn -> loader_data end)
      _ -> handle_initial_load(conn, pot, fn -> loader_data end)
    end
  end

  defp handle_initial_load(conn, pot),
    do: handle_initial_load(conn, pot, fn -> get_loader_data(pot, conn) end)

  defp handle_initial_load(conn, pot, loader) do
    entrypoint = apply(pot, :entrypoint, [conn, conn.params])

    {:ok, conn} =
      conn
      |> put_resp_content_type("text/html")
      |> send_chunked(200)
      |> chunk(preamble(entrypoint))

    loader_data = loader.()
    {:ok, conn} = conn |> chunk("#{js_payload("window.__provideLoaderData(#{loader_data});")}")
    {:ok, conn} = conn |> chunk("</html>")
    conn
  end

  defp handle_navigation(conn, pot, route),
    do: handle_navigation(conn, pot, route, fn -> get_loader_data(pot, conn) end)

  defp handle_navigation(conn, pot, _route, loader) do
    entrypoint = apply(pot, :entrypoint, [conn, conn.params])

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

    loader_data = loader.()
    {:ok, conn} = conn |> chunk(loader_data)

    conn
  end

  defp preamble(entrypoint) do
    ~s"""
    <html><head>
    <meta name="csrf-token" content="#{Plug.CSRFProtection.get_csrf_token()}" />
    #{if is_prod() do
      ~s"""
      <link phx-track-static rel="stylesheet" href="{Vite.Manifest.main_css()}" />
      <script type="module" crossorigin defer phx-track-static src="{Vite.Manifest.main_js()}"></script>
      <link rel="modulepreload" href="{Vite.Manifest.vendor_js()}" />
      """
    else
      ~s"""
      <script type="module" async>
        import RefreshRuntime from '#{Vite.Dev.url()}@react-refresh'
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
      </script>
      <link rel="modulepreload" href="#{Vite.Dev.url()}@vite/client" />
      <link rel="modulepreload" href="#{Vite.Dev.url()}src/pot/init.tsx" />
      <link rel="modulepreload" href="#{module_path_for_entrypoint(entrypoint)}" />
      <script type="module" src="#{Vite.Dev.url()}@vite/client" async></script>
      <script type="module" src="#{Vite.Dev.url()}src/pot/init.tsx" async></script>
      """
    end}
    </head>
    <body>
    <div id="app"></div>
    #{js_payload("window.__loadEntrypoint(\"#{entrypoint}\");")}
    """
  end

  defp module_path_for_entrypoint(entrypoint) do
    # TODO: Must be different in production (need to look into the Vite manifest)
    "#{Vite.Dev.url()}src/entrypoints/#{entrypoint}.tsx"
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

  defp env() do
    Application.get_env(:demo, :environment, :dev)
  end

  defp is_prod(), do: env() == :prod
end
