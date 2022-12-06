defmodule Pot.Router do
  defmacro __using__(_opts \\ []) do
    quote do
      import Pot.Router

      Module.register_attribute(__MODULE__, :pot_layouts, accumulate: true)
    end
  end

  defmacro pot(path, pot_view, opts \\ []) do
    quote bind_quoted: binding() do
      pot_view = Phoenix.Router.scoped_alias(__MODULE__, pot_view)
      full_path = Phoenix.Router.scoped_path(__MODULE__, path)

      args = [
        view: pot_view,
        full_path: full_path,
        layouts: @pot_layouts |> Enum.reverse()
      ]

      Phoenix.Router.get(path, Pot.Plug, args, alias: false)

      if Keyword.has_key?(pot_view.__info__(:functions), :action) do
        Phoenix.Router.post(path, Pot.Plug, args, alias: false)
      end
    end
  end

  defmacro pot_layout(pot_view) do
    quote bind_quoted: binding() do
      pot_view = Phoenix.Router.scoped_alias(__MODULE__, pot_view)
      full_path = Phoenix.Router.scoped_path(__MODULE__, "")

      @pot_layouts %{view: pot_view, full_path: full_path}
    end
  end
end
