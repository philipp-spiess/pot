defmodule Pot.Plug do
  import Plug.Conn

  @spec init(full_path: String.t(), view: any) :: [full_path: String.t(), view: any]
  def init(args), do: args

  def call(%Plug.Conn{method: "POST"} = conn, args), do: handle_action(conn, args)

  def call(%Plug.Conn{params: %{"_route" => route}} = conn, args),
    do: handle_navigation(conn, args, route)

  def call(conn, args) do
    case get_req_header(conn, "x-pot-route") do
      [route] -> handle_navigation(conn, args, route)
      _ -> handle_initial_load(conn, args)
    end
  end

  defp handle_action(conn, args) do
    # Actions run their data loaders eagerly
    loader_data = apply(args[:view], :action, [conn, conn.params])

    case get_req_header(conn, "x-pot-route") do
      # We deliberately do not pass the route data forward. The route data is
      # used to find out which layouts to reload wne when an action is
      # processed, all of them should be reloaded
      [_route] -> handle_navigation(conn, args, "", fn -> loader_data end)
      _ -> handle_initial_load(conn, args, fn -> loader_data end)
    end
  end

  defp handle_initial_load(conn, args),
    do: handle_initial_load(conn, args, fn -> get_loader_data(args[:view], conn) end)

  defp handle_initial_load(conn, args, route_loader) do
    layouts = route_layouts(args)

    entrypoints = prepare_entrypoints(args, layouts)

    {:ok, conn} =
      conn
      |> put_resp_content_type("text/html")
      |> send_chunked(200)
      |> chunk(initial_load_preamble(entrypoints))

    loader_data = prepare_loader_data(args[:full_path], route_loader, layouts, conn)
    {:ok, conn} = conn |> chunk("#{js_payload("window.__provideLoaderData(#{loader_data});")}")

    {:ok, conn} = conn |> chunk("</html>")
    conn
  end

  defp handle_navigation(conn, args, previous_route),
    do:
      handle_navigation(conn, args, previous_route, fn -> get_loader_data(args[:view], conn) end)

  defp handle_navigation(conn, args, previous_route, route_loader) do
    layouts = route_layouts(args, previous_route)

    entrypoints = prepare_entrypoints(args, layouts)

    navigation_preamble = Phoenix.json_library().encode!(entrypoints)

    conn =
      conn
      |> put_resp_header("x-pot-preamble", navigation_preamble)
      |> put_resp_content_type("application/json")
      |> send_chunked(200)

    loader_data = prepare_loader_data(args[:full_path], route_loader, layouts, conn)
    {:ok, conn} = conn |> chunk(loader_data)

    conn
  end

  defp initial_load_preamble(entrypoints) do
    layouts_json = Phoenix.json_library().encode!(entrypoints)

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
      <script type="module" src="#{Vite.Dev.url()}@vite/client" async></script>
      <script type="module" src="#{Vite.Dev.url()}src/pot/init.tsx" async></script>
      """
    end}

    #{Enum.map(entrypoints, fn entrypoint -> ~s"""
        <link rel="modulepreload" href="#{entrypoint[:module]}" />
      """ end)}

    </head>
    <body>
    <div id="app"></div>
    #{js_payload("window.__loadEntrypoints(#{layouts_json})")}
    """
  end

  defp module_path_for_entrypoint(entrypoint) do
    if is_prod() do
      raise "Must be different in production (need to look into the Vite manifest)"
    else
      "#{Vite.Dev.url()}src/entrypoints/#{entrypoint}.tsx"
    end
  end

  defp js_payload(javascript) do
    ~s"""
    <script type="module" async>
    function init() {
      #{javascript}
    }

    if (window.__loadEntrypoints) { init(); }
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

  # Computes the layouts that are needed to render the page. Based on the
  # previous_path, it will decide which layouts need to have their data reloaded.
  defp route_layouts(args, previous_path \\ "") do
    all_layouts =
      args[:layouts]
      |> Enum.map(fn layout ->
        Map.put(layout, :path, layout[:full_path] |> String.split("/") |> Enum.drop(1))
      end)

    previous_path = previous_path |> String.split("/") |> Enum.drop(1)
    current_path = args[:full_path] |> String.split("/") |> Enum.drop(1)

    all_layouts
    |> Enum.flat_map(fn layout ->
      if List.starts_with?(current_path, layout.path) do
        # TODO: Remix reloads layout data in those cases:
        #
        # - if the url.search changes (while the url.pathname is the same)
        # - after actions are called
        # - "refresh" link clicks (click link to same URL)
        #
        # https://remix.run/docs/en/v1/api/conventions#unstable_shouldreload
        reload = !List.starts_with?(previous_path, layout.path) or length(previous_path) == 0
        [Map.put(layout, :reload, reload)]
      else
        []
      end
    end)
    |> Enum.reverse()
  end

  defp prepare_entrypoints(args, layouts) do
    entrypoint = apply(args[:view], :entrypoint, [])

    route_entrypoint = %{
      path: args[:full_path],
      entrypoint: entrypoint,
      module: module_path_for_entrypoint(entrypoint),
      reload: true,
      current: true
    }

    layout_entrypoints =
      layouts
      |> Enum.map(fn layout ->
        entrypoint = apply(layout[:view], :entrypoint, [])

        %{
          path: layout[:full_path],
          entrypoint: entrypoint,
          module: module_path_for_entrypoint(entrypoint),
          reload: layout[:reload]
        }
      end)

    [route_entrypoint | layout_entrypoints]
  end

  # TODO: How can we make it so that the loaders run in parallel?
  defp prepare_loader_data(route_path, route_loader, layouts, conn) do
    layout_loader_data =
      layouts
      |> Enum.map(fn layout ->
        if layout.reload do
          %{path: layout[:full_path], data: get_loader_data(layout[:view], conn)}
        else
          %{path: layout[:full_path]}
        end
      end)

    route_loader_data = %{path: route_path, current: true, data: route_loader.()}

    Phoenix.json_library().encode!([route_loader_data | layout_loader_data])
  end
end
