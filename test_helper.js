const test = require('node:test');
const assert = require('node:assert').strict;

const helper = require('./helper.js');

test('loadKV: ok', () => {
    let kv = helper.loadKV('{"k1": "v1", "k2": "v2"}');
    assert.strictEqual(kv.k1, 'v1');
    assert.strictEqual(kv.k2, 'v2');
    assert.strictEqual(kv.k3, undefined);
});

test('loadKV: root is not object', () => {
    assert.throws(() => {
        helper.loadKV('["k1", "k2"]');
    }, {
        message: 'Invalid JSON format: must be object.'
    });
});

test('loadKV: nested object', () => {
    assert.throws(() => {
        helper.loadKV('{"k1": {"k2": "v2"}}');
    }, {
        message: 'Invalid JSON format: nested object is not supported.'
    });
});

test('loadKV: value is not string', () => {
    assert.throws(() => {
        helper.loadKV('{"k1":"v1","k2":12345}');
    }, {
        message: 'Invalid JSON format: value must be string but k2: 12345.'
    });
});

test('loadKV: duplicate key', () => {
    assert.throws(() => {
        helper.loadKV('{"k1": "v1", "k2": "v2", "k1": "dup"}');
    }, {
        message: 'Invalid JSON format: duplicate key: k1.'
    });
});

test('normalizeURL: invalid url', () => {
    assert.throws(() => {
        helper.normalizeURL('abcdefg');
    }, {
        message: 'Invalid URL: abcdefg.'
    });
    assert.throws(() => {
        helper.normalizeURL('http?');
    }, {
        message: 'Invalid URL: http?.'
    });
});

test('normalizeURL: invalid protocol', () => {
    assert.throws(() => {
        helper.normalizeURL('ftp://server/path');
    }, {
        message: 'Invalid protocol: ftp:.'
    });
    assert.throws(() => {
        helper.normalizeURL('mailto:xyz@example.com');
    }, {
        message: 'Invalid protocol: mailto:.'
    });
});
