defmodule Pot.Repo do
  use Ecto.Repo,
    otp_app: :pot,
    adapter: Ecto.Adapters.Postgres
end
