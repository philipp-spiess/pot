defmodule Pot.Router do
  defmacro pot(path, pot_view, opts \\ []) do
    quote bind_quoted: binding() do
      pot_view = Phoenix.Router.scoped_alias(__MODULE__, pot_view)
      Phoenix.Router.match(:*, path, Pot.Plug, pot_view, alias: false)
    end
  end
end
