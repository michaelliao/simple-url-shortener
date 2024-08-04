// helper functions

function loadKV(str) {
    let kv = JSON.parse(str);
    // check object:
    if (Array.isArray(kv) || typeof (kv) !== 'object') {
        throw new Error('Invalid JSON format: must be object.');
    }
    for (let k in kv) {
        let v = kv[k];
        if (typeof (v) === 'object') {
            throw new Error('Invalid JSON format: nested object is not supported.');
        }
        if (typeof (v) !== 'string') {
            throw new Error(`Invalid JSON format: value must be string but ${k}: ${v}.`);
        }
    }
    // check duplicate key:
    for (let k in kv) {
        let sk = `"${k}":`;
        let n1 = str.indexOf(sk);
        let n2 = str.lastIndexOf(sk);
        if (n1 !== n2) {
            throw new Error(`Invalid JSON format: duplicate key: ${k}.`);
        }
    }
    return kv;
}

function normalizeURL(str) {
    let url;
    try {
        url = new URL(str);
    } catch (err) {
        throw new Error(`Invalid URL: ${str}.`);
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(`Invalid protocol: ${url.protocol}.`);
    }
    if (!url.hostname) {
        throw new Error(`Invalid hostname: ${url.hostname}.`);
    }
    return url.toString();
}

exports.loadKV = loadKV;
exports.normalizeURL = normalizeURL;
