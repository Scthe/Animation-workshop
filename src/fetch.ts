// polyfill, cause ehh..
//
// based on https://github.com/developit/unfetch
// Licence: https://github.com/developit/unfetch/blob/master/LICENSE.md

type HeadersMap = {[name: string]: any};
type Credentials = 'omit' | 'same-origin' | 'include';

interface FetchOpts {
  method?: string;
  headers?: HeadersMap; // ?
  credentials?: Credentials;
  body: any;
}

const createResponseHandler = (request: XMLHttpRequest) => () => {
  let keys = [],
    all = [],
    headers = {};

  request.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, (m, key, value) => {
    keys.push(key = key.toLowerCase());
    all.push([key, value]);
    const header = headers[key];
    headers[key] = header ? `${header},${value}` : value;
  });

  return {
    ok: (request.status/100|0) === 2,		// 200-299
    status: request.status,
    statusText: request.statusText,
    url: request.responseURL,
    clone: response,
    text: () => Promise.resolve(request.responseText),
    json: () => Promise.resolve(request.responseText).then(JSON.parse),
    blob: () => Promise.resolve(new Blob([request.response])),
    headers: {
      keys: () => keys,
      entries: () => all,
      get: (n: string) => headers[n.toLowerCase()],
      has: (n: string) => n.toLowerCase() in headers
    }
  };
}

export const fetch = (url: string, options?: FetchOpts) => {
	options = options || {};

  const doFetch = (resolve: Function, reject: Function) => {
		let request = new XMLHttpRequest();
		request.open(options.method || 'get', url, true);
		for (let key in options.headers) {
			request.setRequestHeader(key, options.headers[key]);
		}
		request.withCredentials = options.credentials === 'include';
		request.onload = createResponseHandler(request);
		request.onerror = reject;
		request.send(options.body);
	};

  return new Promise(doFetch);
}
