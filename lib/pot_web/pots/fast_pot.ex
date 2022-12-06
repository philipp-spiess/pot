defmodule PotWeb.FastPot do
  use Pot.Controller

  def loader_data(_conn, _params) do
  end

  def entrypoint() do
    ~j"fast"
  end
end
