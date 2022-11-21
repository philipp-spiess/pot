defmodule Pot.TodoFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Pot.Todo` context.
  """

  @doc """
  Generate a item.
  """
  def item_fixture(attrs \\ %{}) do
    {:ok, item} =
      attrs
      |> Enum.into(%{
        done: true,
        text: "some text"
      })
      |> Pot.Todo.create_item()

    item
  end
end
