# regvue

### Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run dev
```

### Compiles and minifies for production

```
npm run build
```

### Lints files

```
npm run lint
```

### Formats files

```
npm run format
```

### Run Cypress tests

```
# First ensure the app is running on http://localhost:5173
npx cypress run
```

Include `--config video=false` to prevent recording and saving videos of the tests

**Note:** in order to use the cypress testing GUI you can run `npx cypress open` outside of the dev container. This requires a local install of node.

### Run Playwright Tests

```
npx playwright test
```

Run subset of tests on Chromium only

```
npx playwright test --project chromium --grep html
```
