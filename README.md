# Simple URL Shortener

![NPM Version](https://img.shields.io/npm/v/simple-url-shortener)

simple-url-shortener is a simple tool that build shorten urls for GitHub page without magic.

Here are steps:

1. Create shorten url mapping [urls.json](https://github.com/michaelliao/redirect.liaoxuefeng.com/blob/main/urls.json):

```json
{
  "home": "https://liaoxuefeng.com",
  "BTC": "https://bitcoin.org"
}
```

The case-sensitive key is composed by 1 ~ 6 characters of a ~ z, A ~ Z and 0 ~ 9.

2. Create GitHub action [build.yml](https://github.com/michaelliao/redirect.liaoxuefeng.com/blob/main/.github/workflows/build.yml) (just copy the content and change the branch name if neccessary).

3. Set GitHub pages:

- Settings - Pages - Build and deployment - Source: GitHub Actions;
- Custom domain: fill your custom domain and enable "Enforce HTTPS".

You can then access shorten URL like [https://redirect.liaoxuefeng.com/BTC](https://redirect.liaoxuefeng.com/BTC) after build.

You can find the [example repo](https://github.com/michaelliao/redirect.liaoxuefeng.com).

## Shorten URL

The `urls.json` contains key - url mapping. simple-url-shortener will generate HTML files for each shorten URL. The generated GitHub pages structure:

```
_site/
├── 404.html
├── index.html
├── BTC
│   └── index.html
└── home
    └── index.html
```

The HTML file uses `<meta http-equiv="refresh" content="0;URL=xxx"/>` for redirect:

```plain
$ curl https://redirect.liaoxuefeng.com/BTC/index.html
<html>
<head>
    <meta http-equiv="refresh" content="0;URL='https://bitcoin.org/'" />
    ...
```

## Configuration

You can also set a [config.json](https://github.com/michaelliao/redirect.liaoxuefeng.com/blob/main/config.json) for configuration:

```json
{
  "wait": 0, // auto redirect in seconds, 0 = immediately, n = display link and wait for n seconds, -1 = display link only.
  "generate404": true, // generate a 404 page, default to true.
  "generateIndex": true // generate an index page, default to true.
}
```

## Customize

If you want to use your own designed template to generate pages, copy the following template files to your repo's root dir and make some change:

- [redirect.html](https://github.com/michaelliao/simple-url-shortener/blob/main/redirect.html)
- [index.html](https://github.com/michaelliao/simple-url-shortener/blob/main/index.html)
- [404.html](https://github.com/michaelliao/simple-url-shortener/blob/main/404.html)
