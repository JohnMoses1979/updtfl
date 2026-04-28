// api/tokenStore.js  ← new tiny file
let _token = null;

export const tokenStore = {
    set: (t) => { _token = t; },
    get: () => _token,
    clear: () => { _token = null; },
};