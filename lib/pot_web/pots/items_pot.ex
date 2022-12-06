defmodule PotWeb.ItemsPot do
  use Pot.Controller

  alias Pot.Todo

  def action(_conn, %{"intent" => "delete", "id" => id}) do
    item = Todo.get_item!(id)
    {:ok, _item} = Todo.delete_item(item)
    json(%{"items" => list_items()})
  end

  def action(_conn, %{"text" => text}) do
    case Todo.create_item(%{"text" => text, "done" => false}) do
      {:ok, _item} ->
        json(%{"items" => list_items()})

      {:error, %Ecto.Changeset{} = changeset} ->
        json(%{
          "errors" =>
            changeset.errors
            |> Enum.map(fn {field, {error, _rest}} -> %{field: field, error: error} end),
          "items" => list_items()
        })
    end
  end

  def loader_data(_conn, _params) do
    json(%{"items" => list_items()})
  end

  defp list_items do
    Pot.Todo.list_items()
    |> Enum.map(fn item ->
      %{
        "id" => item.id,
        "done" => item.done,
        "text" => item.text
      }
    end)
  end

  def entrypoint() do
    ~j"items"
  end
end
