defmodule Pot.Router do
  defmacro pot(path, pot_view, opts \\ []) do
    quote bind_quoted: binding() do
      pot_view = Phoenix.Router.scoped_alias(__MODULE__, pot_view)
      Phoenix.Router.get(path, Pot.Plug, pot_view, alias: false)

      if Keyword.has_key?(pot_view.__info__(:functions), :post) do
        Phoenix.Router.post(path, Pot.Plug, pot_view, alias: false)
      end

      if Keyword.has_key?(pot_view.__info__(:functions), :put) do
        Phoenix.Router.put(path, Pot.Plug, pot_view, alias: false)
      end

      if Keyword.has_key?(pot_view.__info__(:functions), :delete) do
        Phoenix.Router.delete(path, Pot.Plug, pot_view, alias: false)
      end
    end
  end
end
