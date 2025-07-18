# Distill Template (Vite + TypeScript)

A modern rewrite of the original [Distill pub](/) template using a modern stack.  The code base has been updated to use **TypeScript** and **Vite** for fast development and modern tooling.

<img width="1443" height="1001" alt="image" src="https://github.com/user-attachments/assets/fcfc026b-22a4-4996-be60-20c7a1d89690" />


## Overview

The project bundles Distill components, transforms, and helpers written in TypeScript. Vite handles building to the `public` directory and Vitest runs the tests. A command line tool (`distill-render`) is provided to render articles statically using JSDOM. Another utility (`distill-archive`) reads the front matter of existing HTML articles and generates a styled archive page.

### Repository Structure

- **src/** – TypeScript source for components, transforms and utilities
- **public/** – output HTML and assets
- **bin/** – command line tools (`distill-render` to transform HTML, `distill-archive` to generate a styled archive page from article metadata)
- **test/** – unit tests executed by Vitest
- **vite.config.ts** – build configuration targeting ES2020 modules

## Development

1. Install dependencies with `npm install`.
2. Run `npm run dev` for a watch build.
3. Execute `npm run serve` to preview the `public` directory.
4. Use `npm run build` for a production build.
5. Run `npm test` to execute the Vitest suite.
6. Generate an archive page from existing articles with `npx distill-archive`.

## License

This project is research code and not an official Google product.  It is licensed under the [Apache 2.0 License](LICENSE).
