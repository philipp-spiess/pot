defmodule Pot.Layout do
  defmacro __using__(opts) do
    quote bind_quoted: [opts: opts] do
      import Pot.Layout
    end
  end

  def json(data) do
    Phoenix.json_library().encode!(data)
  end

  def sigil_j(string, []) do
    string
  end
end
