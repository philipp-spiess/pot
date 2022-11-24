defmodule PotWeb.ItemsPot do
  use Pot.Controller

  # alias Pot.Todo
  # alias Pot.Todo.Item

  def loader_data(_conn, _params) do
    Process.sleep(2000)

    items =
      Pot.Todo.list_items()
      |> Enum.map(fn item ->
        %{
          "id" => item.id,
          "done" => item.done,
          "text" => item.text
          # "insertedAt" => item.inserted_at,
          # "updatedAt" => item.updated_at
        }
      end)

    json(%{"items" => items})
  end

  def entrypoint(_conn, _params) do
    ~j"item"
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
