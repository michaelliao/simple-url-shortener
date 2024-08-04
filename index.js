#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const util = require('node:util');

const helper = require('./helper.js');

const KEY_PATTERN = /^[a-zA-Z0-9]{1,6}$/;

function loadJson(jsonFile) {
    const s = fs.readFileSync(jsonFile, 'utf-8');
    return JSON.parse(s);
}

function loadTemplate(htmlFile) {
    try {
        return fs.readFileSync(htmlFile, 'utf-8');
    } catch (err) {
        return fs.readFileSync(path.join(__dirname, htmlFile,), 'utf-8');
    }
}

// process json:
function processURLs(jsonFile) {
    const s = fs.readFileSync(jsonFile, 'utf-8');
    const kv = helper.loadKV(s);
    const mapping = {};
    for (let key in kv) {
        let value = kv[key];
        if (!KEY_PATTERN.test(key)) {
            throw new Error(`Invalid key: "${key}". Key must be 1~6 characters by 0~9, a~z, A~Z.`);
        }
        let url = helper.normalizeURL(value);
        mapping[key] = url.toString();
        console.log(`Mapping "${key}" to "${mapping[key]}".`);
    }
    return mapping;
}

function render(html, model) {
    let s = html;
    for (let key in model) {
        let value = model[key];
        s = s.replaceAll(new RegExp('\\$\\{' + key + '\\}', 'g'), value);
    }
    return s;
}

function mkdirIfNeeded(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

function parseArgv() {
    const opts = {
        'file': {
            type: 'string',
            short: 'f'
        },
        'output': {
            type: 'string',
            short: 'o'
        }
    };
    const { values, positionals } = util.parseArgs({ args: process.argv, options: opts, allowPositionals: true });
    return values;
}

function loadConfig() {
    let config = {};
    if (fs.existsSync(path.resolve('config.json'))) {
        console.log('Load config.json.');
        config = loadJson('config.json');
    }
    // set default if not set:
    config.wait = parseInt(config.wait || '0');
    config.generate404 = config.generate404 || true;
    config.generateIndex = config.generateIndex || true;
    return config;
}

function main() {
    const argv = parseArgv();
    const file = path.resolve(argv.file || 'urls.json');
    const outputDir = path.resolve(argv.output || '_site');
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true });
    }
    mkdirIfNeeded(outputDir);
    console.log(`Set output dir: ${outputDir}`);
    const config = loadConfig();
    console.log(`Process json file: ${file}...`);
    const mapping = processURLs(file);
    const wait = config.wait || 0;
    const redirectHtml = loadTemplate('redirect.html');
    for (let key in mapping) {
        let url = mapping[key];
        let model = {
            wait: wait,
            short: key,
            url: url,
            meta: ''
        };
        if (wait === 0) {
            model.meta = `<meta http-equiv="refresh" content="0;URL='${url}'" />`;
        }
        let html = render(redirectHtml, model);
        let fileDir = path.join(outputDir, key);
        mkdirIfNeeded(fileDir);
        fs.writeFileSync(path.join(fileDir, 'index.html'), html);
    }
    if (config.generate404) {
        console.log('Generate 404 page...');
        const notFoundHtml = loadTemplate('404.html');
        fs.writeFileSync(path.join(outputDir, '404.html'), notFoundHtml);
    }
    if (config.generateIndex) {
        console.log('Generate index page...');
        const indexTemplate = loadTemplate('index.html');
        // extract <!-- BEGIN --> ... <!-- END -->
        const begin = '<!-- BEGIN -->';
        const end = '<!-- END -->';
        const n1 = indexTemplate.indexOf(begin);
        if (n1 < 0) {
            throw `Error: "${begin}" not found in index template.`;
        }
        const n2 = indexTemplate.indexOf(end);
        if (n2 < 0) {
            throw `Error: "${end}" not found in index template.`;
        }
        const loopTemplate = indexTemplate.substring(n1 + begin.length, n2);
        const keys = Object.keys(mapping);
        keys.sort((s1, s2) => {
            let l1 = s1.toLowerCase();
            let l2 = s2.toLowerCase();
            let cmp = l1 === l2 ? 0 : (l1 < l2 ? -1 : 1);
            if (cmp === 0) {
                cmp = s1 < s2;
            }
            return cmp;
        });
        const loopHtmls = keys.map(key => render(loopTemplate, { key: key, value: mapping[key] }));
        const indexHtml = indexTemplate.substring(0, n1) + loopHtmls.join('\n') + indexTemplate.substring(n2 + end.length);
        fs.writeFileSync(path.join(outputDir, 'index.html'), indexHtml);
    }
}

try {
    main();
} catch (err) {
    console.error(err.message || err);
    process.exit(1);
}
