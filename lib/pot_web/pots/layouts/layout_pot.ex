defmodule PotWeb.Layout do
  use Pot.Layout

  def loader_data(_conn) do
    json(%{"whoami" => "root"})
  end

  def entrypoint(_conn) do
    ~j"layout"
  end
end
