# now-dev-router

A bandaid router for using
[Now v2 routes](https://zeit.co/docs/v2/deployments/routes) in a custom server,
stolen wholesale from [zeit/now-cli/.../dev-router.ts](https://github.com/zeit/now-cli/blob/40be8ef688516482bc4cf61d630b60c876a3c722/src/commands/dev/lib/dev-router.ts).

## Usage

````js
const { createServer } = require('http');
const router = require('now-dev-router');

createServer((req, res) => {
  const route = router(req.url, routes);
  if (route.found) {
    // Do something the route
  } else {
    // Do something else
  }
});
````

## Next.js Custom Server
````js
const { createServer } = require('http');
const next = require('next');
const parse = require('url-parse');
const router = require('now-dev-router');
const { routes } = require('./now.json');

const dev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 4000;

const app = next({ dev });
const requestHandler = app.getRequestHandler();

app.prepare().then(
  createServer((req, res) => {
    const router = devRouter(req.url, routes);
    const parsedUrl = parse(req.url, true);
    if (route.found) {
      app.render(req, res, route.dest, { ...route.uri_args, ...parsedUrl.query });
    } else {
      requestHandler(req, res, parsedUrl);
    }
  }).listen(PORT, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  })
);

````
