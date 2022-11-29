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

  def entrypoint(_conn, _params) do
    ~j"items"
  end

  # @impl true
  # def mount(_params, _session, socket) do
  #   {:ok, assign(socket, :items, list_items())}
  # end

  # @impl true
  # def handle_params(params, _url, socket) do
  #   {:noreply, apply_action(socket, socket.assigns.live_action, params)}
  # end

  # defp apply_action(socket, :edit, %{"id" => id}) do
  #   socket
  #   |> assign(:page_title, "Edit Item")
  #   |> assign(:item, Todo.get_item!(id))
  # end

  # defp apply_action(socket, :new, _params) do
  #   socket
  #   |> assign(:page_title, "New Item")
  #   |> assign(:item, %Item{})
  # end

  # defp apply_action(socket, :index, _params) do
  #   socket
  #   |> assign(:page_title, "Listing Items")
  #   |> assign(:item, nil)
  # end

  # @impl true
  # def handle_event("delete", %{"id" => id}, socket) do
  #   item = Todo.get_item!(id)
  #   {:ok, _} = Todo.delete_item(item)

  #   {:noreply, assign(socket, :items, list_items())}
  # end

  # defp list_items do
  #   Todo.list_items()
  # end
end
