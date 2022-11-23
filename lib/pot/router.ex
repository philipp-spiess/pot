defmodule Pot.Router do
  defmacro pot(path, pot_view, action \\ nil, opts \\ []) do
    quote bind_quoted: binding() do
      Phoenix.Router.get(path, Pot.Plug, action, [])
    end
  end
end
