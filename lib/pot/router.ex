defmodule Pot.Router do
  defmacro pot(path, pot_view, opts \\ []) do
    quote bind_quoted: binding() do
      pot_view = Phoenix.Router.scoped_alias(__MODULE__, pot_view)

      args = [view: pot_view, full_path: Phoenix.Router.scoped_path(__MODULE__, path)]

      Phoenix.Router.get(path, Pot.Plug, args, alias: false)

      if Keyword.has_key?(pot_view.__info__(:functions), :action) do
        Phoenix.Router.post(path, Pot.Plug, args, alias: false)
      end
    end
  end
end
