# Jimmy's Health

Personal health dashboard. React + Tailwind + shadcn/ui. Data files live in `public/data/` and are fetched by the app at runtime, so lab values can be updated by editing JSON without rebuilding.

## Run locally

```
npm install
npm run dev
```

## Build

```
npm run build
bash scripts/post-build.sh
```

The build outputs to `dist/`, ready for static hosting (GitHub Pages, Cloudflare Pages, Netlify).

## Data

- `public/data/markers.json` - blood panel values
- `public/data/diagnostics.json` - marker explanations and actions
- `public/data/dates.json` - test dates and labs
- `public/data/other.json` - urinalysis, imaging, pathology, semen, sources

Update those files and push to redeploy.
