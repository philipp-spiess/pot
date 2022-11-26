# Pot

Render React components from Elixir. Remix but with an Elixir backend. I'll write more, one day...

## Running the demo

- `asdf install`
- `pushd assets && pnpm install && popd`
- Ensure postgres is started
- `mix ecto.create`
- `mix ecto.migrate`
- `mix phx.server`

## Todo

- [x] Data (`useLoaderData`)
- [x] <Link> and route transitions
- [x] Start vite with phx automatically
- [ ] Actions (<Form>, `useSubmit`)
- [ ] Route params
- [ ] `useTransition`
- [ ] Styling
- [x] Add the concept of a controller (Pot?) that defines the React component, props, and stuff.
  - [ ] How to define custom headers
  - [ ] How to 404 (also done in loader in Remix)
- [ ] Layout components
- [ ] Robust error handling during navigations
- [ ] Render .heex layout
- [ ] Static string
- [ ] Make it deployable
- [ ] Layout nesting
  - [ ] How to only load layout data when you need it?
- [ ] SSR with a JS runtime
- [ ] [Move package.json to root](https://sourcegraph.com/search?q=context:global+type:path+file:package.json%24+repo:has.path%28mix.exs%29&patternType=standard&sm=1) and colocate js with ex?

## Long-term ideas

LiveView heex templates are statically analyzed: can we use that compile phase to extract a list of React component we need to preload? If this is possible, instead of returning an entrypoint we could allow for a special syntax to render React components inside heex:

```elixir
  def simple_form(assigns) do
    ~H"""
    <.form :let={f} for={@for} as={@as} {@rest}>
      <div class="space-y-8 bg-white mt-10">
        <%= render_slot(@inner_block, f) %>
        <div :for={action <- @actions} class="mt-2 flex items-center justify-between gap-6">
          <%= render_slot(action, f) %>
          <JS.MyComponent myProp={@myprop}>
            More Elixir server-side rendered content!
          </JS.MyComponent>
        </div>
      </div>
    </.form>
    """
  end
```

This, in turn, could allow us to serialize only those parts of the data to the frontend that we actually need for the React components. The rest could be manual DOM placement that uses LiveView to manage state.

There's going to be a conflict between how to update state from React vs. how to update state from heex that we'll need to figure out. Who knows, maybe this will never work 🤷.

## Links

- https://github.com/remix-run/remix/blob/main/packages/remix-react/index.tsx
- https://github.com/remix-run/remix/blob/main/packages/remix-react/components.tsx#L86-L222
