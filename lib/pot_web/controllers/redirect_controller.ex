defmodule PotWeb.RedirectController do
  use PotWeb, :controller

  @spec index(Plug.Conn.t(), any) :: Plug.Conn.t()
  def index(conn, _params) do
    redirect(conn, to: ~p"/admin")
  end
end
