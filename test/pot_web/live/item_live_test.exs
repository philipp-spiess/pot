defmodule PotWeb.ItemLiveTest do
  use PotWeb.ConnCase

  import Phoenix.LiveViewTest
  import Pot.TodoFixtures

  @create_attrs %{done: true, text: "some text"}
  @update_attrs %{done: false, text: "some updated text"}
  @invalid_attrs %{done: false, text: nil}

  defp create_item(_) do
    item = item_fixture()
    %{item: item}
  end

  describe "Index" do
    setup [:create_item]

    test "lists all items", %{conn: conn, item: item} do
      {:ok, _index_live, html} = live(conn, ~p"/items")

      assert html =~ "Listing Items"
      assert html =~ item.text
    end

    test "saves new item", %{conn: conn} do
      {:ok, index_live, _html} = live(conn, ~p"/items")

      assert index_live |> element("a", "New Item") |> render_click() =~
               "New Item"

      assert_patch(index_live, ~p"/items/new")

      assert index_live
             |> form("#item-form", item: @invalid_attrs)
             |> render_change() =~ "can&#39;t be blank"

      {:ok, _, html} =
        index_live
        |> form("#item-form", item: @create_attrs)
        |> render_submit()
        |> follow_redirect(conn, ~p"/items")

      assert html =~ "Item created successfully"
      assert html =~ "some text"
    end

    test "updates item in listing", %{conn: conn, item: item} do
      {:ok, index_live, _html} = live(conn, ~p"/items")

      assert index_live |> element("#items-#{item.id} a", "Edit") |> render_click() =~
               "Edit Item"

      assert_patch(index_live, ~p"/items/#{item}/edit")

      assert index_live
             |> form("#item-form", item: @invalid_attrs)
             |> render_change() =~ "can&#39;t be blank"

      {:ok, _, html} =
        index_live
        |> form("#item-form", item: @update_attrs)
        |> render_submit()
        |> follow_redirect(conn, ~p"/items")

      assert html =~ "Item updated successfully"
      assert html =~ "some updated text"
    end

    test "deletes item in listing", %{conn: conn, item: item} do
      {:ok, index_live, _html} = live(conn, ~p"/items")

      assert index_live |> element("#items-#{item.id} a", "Delete") |> render_click()
      refute has_element?(index_live, "#item-#{item.id}")
    end
  end

  describe "Show" do
    setup [:create_item]

    test "displays item", %{conn: conn, item: item} do
      {:ok, _show_live, html} = live(conn, ~p"/items/#{item}")

      assert html =~ "Show Item"
      assert html =~ item.text
    end

    test "updates item within modal", %{conn: conn, item: item} do
      {:ok, show_live, _html} = live(conn, ~p"/items/#{item}")

      assert show_live |> element("a", "Edit") |> render_click() =~
               "Edit Item"

      assert_patch(show_live, ~p"/items/#{item}/show/edit")

      assert show_live
             |> form("#item-form", item: @invalid_attrs)
             |> render_change() =~ "can&#39;t be blank"

      {:ok, _, html} =
        show_live
        |> form("#item-form", item: @update_attrs)
        |> render_submit()
        |> follow_redirect(conn, ~p"/items/#{item}")

      assert html =~ "Item updated successfully"
      assert html =~ "some updated text"
    end
  end
end
