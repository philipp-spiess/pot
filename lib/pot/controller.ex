defmodule Pot.Controller do
  defmacro __using__(opts) do
    quote bind_quoted: [opts: opts] do
      import Pot.Controller
    end
  end

  def json(data) do
    Phoenix.json_library().encode!(data)
  end

  def sigil_j(string, []) do
    string
  end
end
