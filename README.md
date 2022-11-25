# Pot

Render React components from Elixir. Remix but with an Elixir backend. I'll write more, one day...

## Todo

- [x] Data (`useLoaderData`)
- [x] <Link> and route transitions
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
  - How to only load layout data when you need it?
- [ ] SSR with a JS runtime
- [ ] Start vite with phx automatically
- [ ] [Move package.json to root](https://sourcegraph.com/search?q=context:global+type:path+file:package.json%24+repo:has.path%28mix.exs%29&patternType=standard&sm=1) and colocate js with ex?

- https://github.com/remix-run/remix/blob/main/packages/remix-react/index.tsx
- https://github.com/remix-run/remix/blob/main/packages/remix-react/components.tsx#L86-L222
