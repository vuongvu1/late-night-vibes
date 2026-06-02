# Late Night Vibes 🌙

Let's play 👉 [▶️](https://late-night-vibes.vuongvu.workers.dev/)

Enjoy a variety of live lofi radio channels through an exquisite online player.

## Installation

This is a React and TypeScript project created with Vite.

First, install the project dependencies:

```sh
pnpm install
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
