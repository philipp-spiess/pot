defmodule PotWeb.ItemPot do
  use Pot.Controller

  def loader_data(_conn, params) do
    item = Pot.Todo.get_item!(params["id"])

    json(%{
      "item" => %{
        "id" => item.id,
        "done" => item.done,
        "text" => item.text
      }
    })
  end

  def entrypoint() do
    ~j"item"
  end
end
