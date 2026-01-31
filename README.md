# Late Night Vibes 🌙

[![Netlify Status](https://api.netlify.com/api/v1/badges/b8fb1b50-780c-47aa-b373-ad78933b4a98/deploy-status)](https://app.netlify.com/sites/late-night-vibes/deploys)

Let's play 👉 [▶️](https://late-night-vibes.vuongvu.xyz/)

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

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT
