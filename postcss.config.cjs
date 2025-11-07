// Support both the new `tailwindcss/postcss` entry (newer Tailwind) and the
// older `tailwindcss` package entrypoint. This keeps the config working
// across different Tailwind versions.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
