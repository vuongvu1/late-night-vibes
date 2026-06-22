# Late Night Vibes 🌙

Let's play 👉 [▶️](https://late-night-vibes.com/)

Lofi radio for late nights — study, chill, sleep.

## Features

- **Live lofi channels** — stream a curated set of YouTube live radio channels, with
  shuffle, next/previous, and auto-switching when a channel goes down.
- **Ambient sound mixer** — layer up to 5 looping ambient sounds (rain, crickets, café,
  etc.) over the music, each with its own volume. The mixer button shows a small badge
  with the number of currently active sounds, plus reset and randomize controls.
- **Live chat** — a single global, anonymous chatroom backed by Supabase realtime,
  with an online-listener counter.
- **Keyboard shortcuts** — `Space` play/pause, `R` random channel, `←`/`→` previous/next
  channel, `↑`/`↓` volume, `F` fullscreen, `C` chat, `M` sound mixer.
- **Deep links** — append `#<n>` to the URL (e.g. `#3`) to open a specific channel.
- **Animated backgrounds** on a deterministic, shared rotation, with a static-frame
  fallback when paused. Installable as a PWA.

## Installation

This is a React and TypeScript project created with Vite.

First, install the project dependencies:

```sh
pnpm install
```

### Environment variables

The live chat and online-listener counter talk to Supabase. Create a `.env` file in the
project root with your project's credentials (both are exposed to the client, so use the
**anon** key, never the service-role key):

```sh
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## Development

To start the development server, run:

```
pnpm dev
```

## Building

To build the project, run:

```
pnpm build
```

## Deployment

The app is served as a static SPA on **Cloudflare Workers** via Wrangler. Preview a
production build locally, or deploy:

```sh
pnpm preview   # build + run locally with wrangler dev
pnpm deploy    # build + wrangler deploy
```

Worker configuration lives in `wrangler.jsonc`.

## Background Assets

The app uses animated GIFs/WebPs for backgrounds when playing and static JPGs when stopped. To generate static frames from your animated assets, ensure you have [ImageMagick](https://imagemagick.org/) installed, then run:

```sh
pnpm generate-static
```

This will extract the first frame of every asset in `src/assets/gifs` and save it to `src/assets/static`.

## Chat History Retention

The live chat stores messages in a Supabase `messages` table. To keep the database within free-tier size limits, a Postgres trigger automatically trims the table to the **newest 500 messages** on every insert.

The trigger lives in `supabase/migrations/20260602_trim_messages_to_500.sql`. It is **not** applied automatically from this repo — apply it once to your Supabase project, either by pasting the file's contents into the **Supabase SQL editor**, or with the Supabase CLI:

```sh
supabase db push
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
