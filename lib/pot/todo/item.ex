defmodule Pot.Todo.Item do
  use Ecto.Schema
  import Ecto.Changeset

  schema "items" do
    field :done, :boolean, default: false
    field :text, :string

    timestamps()
  end

  @doc false
  def changeset(item, attrs) do
    item
    |> cast(attrs, [:text, :done])
    |> validate_required([:text, :done])
  end
end
