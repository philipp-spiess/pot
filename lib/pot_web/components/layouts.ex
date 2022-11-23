defmodule PotWeb.Layouts do
  use PotWeb, :html

  embed_templates "layouts/*"

  def env() do
    Application.get_env(:demo, :environment, :dev)
  end

  def is_prod(), do: env() == :prod
end
