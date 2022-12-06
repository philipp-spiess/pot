defmodule PotWeb.Layout do
  use Pot.Layout

  def loader_data(_conn, _params) do
    {:ok, datetime} = DateTime.now("Etc/UTC")

    json(%{
      "user" => "Philipp",
      "serverTime" => Calendar.strftime(datetime, "%H:%M:%S")
    })
  end

  def entrypoint() do
    ~j"layout"
  end
end
