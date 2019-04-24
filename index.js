/* eslint-disable camelcase, max-depth */

const parse = require('url-parse');
const pcreToRegex = require('pcre-to-regexp');

function isURL(str) {
  return typeof str === 'string' && /^https?:\/\//.test(str);
}

function resolveRouteParameters(str, match, keys) {
  return str.replace(/\$([1-9a-zA-Z]+)/g, (_, param) => {
    let matchIndex = keys.indexOf(param);
    if (matchIndex === -1) {
      // It's a number match, not a named capture
      matchIndex = parseInt(param, 10);
    } else {
      // For named captures, add one to the `keys` index to
      // match up with the RegExp group matches
      matchIndex++;
    }

    return match[matchIndex];
  });
}

module.exports = function(reqPath = '', routes) {
  let found;
  const { query, pathname: reqPathname = '/' } = parse(reqPath, true);

  // Try route match
  if (routes) {
    let idx = -1;
    for (const routeConfig of routes) {
      idx++;
      let { src, headers } = routeConfig;

      if (!src.startsWith('^')) {
        src = `^${src}`;
      }

      if (!src.endsWith('$')) {
        src = `${src}$`;
      }

      const keys = [];
      const matcher = pcreToRegex(`%${src}%i`, keys);
      const match = matcher.exec(reqPathname);

      if (match) {
        let destPath = reqPathname;

        if (routeConfig.dest) {
          destPath = resolveRouteParameters(routeConfig.dest, match, keys);
        }

        if (headers) {
          // Create a clone of the `headers` object to not mutate the original one
          headers = { ...headers };
          for (const key of Object.keys(headers)) {
            headers[key] = resolveRouteParameters(headers[key], match, keys);
          }
        }

        if (isURL(destPath)) {
          found = {
            found: true,
            dest: destPath,
            userDest: false,
            status: routeConfig.status,
            headers,
            uri_args: {},
            matched_route: routeConfig,
            matched_route_idx: idx
          };
          break;
        } else {
          const { pathname, query } = parse(destPath, true);
          found = {
            found: true,
            dest: pathname || '/',
            userDest: Boolean(routeConfig.dest),
            status: routeConfig.status,
            headers,
            uri_args: query,
            matched_route: routeConfig,
            matched_route_idx: idx
          };
          break;
        }
      }
    }
  }

  if (!found) {
    found = {
      found: false,
      dest: reqPathname,
      uri_args: query
    };
  }

  return found;
};
