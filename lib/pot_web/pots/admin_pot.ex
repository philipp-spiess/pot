defmodule PotWeb.AdminPot do
  use Pot.Controller

  def loader_data(_conn, _params) do
    Process.sleep(2000)

    json(%{"topSecretPassword" => "s3cr3t"})
  end

  def entrypoint(_conn, _params) do
    ~j"admin"
  end
end
