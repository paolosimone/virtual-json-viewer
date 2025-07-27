[![mentioned in awesome jq](https://awesome.re/mentioned-badge.svg)](https://github.com/fiatjaf/awesome-jq)

# ![logo](assets/logo_48.png) Virtual Json Viewer

Browser plugin that uses [virtual DOM](https://github.com/bvaughn/react-window) to render JSONs with built-in search, JQ filtering and many other [features](#features).

![preview](assets/preview.png)

## Browser Store

[![chrome](assets/badge-chrome.png)](https://chrome.google.com/webstore/detail/virtual-json-viewer/cipnpfcceoapeahdgomheoecidglopld) [![firefox](assets/badge-firefox.png)](https://addons.mozilla.org/en-GB/firefox/addon/virtual-json-viewer/)

## Why?

> "Oh my! There are plenty of json viewers, why making a new one?"

Rightful question, and the answer is quite simple: the others weren't good enough [for my needs]: I often have to debug large json payloads, so large that every other plugin for chrome I tried freezed without showing any content.

## Features

- [X] [Blazing fast](#performance) JSON rendering using virtual DOM
    - [X] Color-encoded value types
    - [X] Collapse/expand all nodes
    - [X] Preview nested item count for closed nodes
    - [X] Clickable URLs
    - [X] Option to sort JSON keys alphabetically
- [X] Full text search
    - [X] Highlight search results
    - [ ] Navigate to next/previous search match
    - [X] Option to completely hide subtrees without any search match
    - [X] Option to enable case sensitive search
- [X] JQ filtering
- [X] Raw JSON viewer
    - [X] Prettify/minify 
- [X] Support [JSON Lines](https://jsonlines.org/)
- [X] Download JSON
- [X] [Keyboard shortcuts](#keyboard-shortcuts)
- [X] Appearance
    - [X] Light/dark mode
    - [X] Custom theme
    - [X] Internationalization

### Keyboard shortcuts

🍏 On MacOS `Ctrl` is replaced by the command key (`⌘`)

##### Navigate UI

| Action                       | Primary              | Secondary         |
|------------------------------|:--------------------:|:-----------------:|
| Focus Next element           | `Tab`                |                   |
| Focus Previous element       | `Shift + Tab`        |                   |
| Trigger button               | `Enter`              |                   |
| Focus Search                 | `Ctrl + f`           | `/`               |
| Focus JQ                     | `Ctrl + Shift + f`   |                   |
| Focus Viewer                 | `Ctrl + 0`           |                   |

##### Toolbar

| Action                       | Primary              | Secondary         |
|------------------------------|:--------------------:|:-----------------:|
| Toggle Tree/Raw viewer       | `Ctrl + i`           |                   |
| Expand                       | `Ctrl + e`           |                   |
| Collapse                     | `Ctrl + Shift + e`   |                   |
| Save                         | `Ctrl + s`           |                   |
| Go to next search match      | `Ctrl + g`           | `n`               |
| Go to previous search match  | `Ctrl + Shift + g`   | `Shift + n`       |

##### Tree viewer

| Action                       | Primary              | Secondary         |
|------------------------------|:--------------------:|:-----------------:|
| Start navigation             | `Enter`              |                   |
| End navigation               | `Escape`             |                   |
| Go to next                   | `ArrowDown`          | `j`               |
| Go to previous               | `ArrowUp`            | `k`               |
| Go to next page              | `PageDown`           | `Shift + j`       |
| Go to previous page          | `PageUp`             | `Shift + k`       |
| Go to first                  | `Home`               | `gg`              |
| Go to last                   | `End`                | `Shift + g`       |
| Open node                    | `ArrowRight`         | `l`               |
| Close node                   | `ArrowLeft`          | `h`               |
| Toggle node open/close       | `Spacebar`           |                   |
| Select key text              | `Shift + ArrowLeft`  | `Shift + h`       |
| Select value text            | `Shift + ArrowRight` | `Shift + l`       |
| Select node text             | `Ctrl + a`           |                   |

##### Raw viewer

| Action                       | Primary              | Secondary         |
|------------------------------|:--------------------:|:-----------------:|
| Select all text              | `Ctrl + a`           |                   |
| Deselect text                | `Escape`             |                   |

## FAQ

### Why the extension doesn't work when opening a file from filesystem?

On Chrome

1. go to `chrome://extensions/`
1. select "Virtual Json Viewer" 
1. enable the toggle "Allow access to file URLs"

If this doesn't solve the issue make sure you are using the latest version of both Chrome and Virtual Json Viewer, or manually install the [correct build for your version](#manual-installation).

### Why JQ is not available?

[JQ](https://stedolan.github.io/jq) has been [compiled to WebAssembly](https://github.com/paolosimone/jq-wasm) and included in this plugin, but some website's Content Security Policy doesn't allow WASM execution. In those cases the JQ command bar is not shown.

_Example:_ https://api.github.com/users/paolosimone/repos

See also [Issue #15](https://github.com/paolosimone/virtual-json-viewer/issues/15)

### Why this valid JQ command doesn't work?

[JQ](https://stedolan.github.io/jq) commands in Virtual Json Viewer must return (a list of) valid json, otherwise the parsing of the result will fail with an error e.g.

> Unexpected token { in JSON at position 337

Why? The core feature of Virtual Json Viewer is the navigation of (possibly large) json thanks to virtual DOM that allows on-demand rendering. JQ filtering has been added on top of that, just as handy utilities to further improve the user experience.

### Why the content shown by the extension is different from the actual JSON?

The json content is parsed using Javascript's [JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) in order to be rendered both in Tree and Raw view, and even from Download button. For the vast majority of cases this shouldn't be a problem but if you find yourself in need of debugging the original json text I'd suggest you to ~~start praying~~ turn to more suitable tools like API clients and text editors.

Here are some well-known Javascript behaviour that could lead to differences between the original json and its javascript parsed object.  

#### Large numbers are truncated

Integers outside the range `Number.MIN_SAFE_INTEGER` and `Number.MAX_SAFE_INTEGER` are rounded ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER))

```javascript
JSON.parse('{"wrong": 10000000000000099}')
{wrong: 10000000000000100}
```

Floating point numbers are rounded to 16 digits

```javascript
JSON.parse('{"wrong": 1.12345678901234567890}')
{wrong: 1.1234567890123457}
```

#### Keys order is not preserved 

Even disabling the alphabetical ordering feature flag there is no guarantee that the order of keys on screen will be the same as the original json. The actual order will be the output of `Object.keys(JSON.parse(json))`. For instance by ECMAScript specification integer-like keys will be iterated first ([MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in#:~:text=The%20traversal%20order,of%20property%20creation.))

```javascript
Object.keys(JSON.parse('{"ZZZ": "_", "AAA": "_", "42": "_"}'))
['42', 'ZZZ', 'AAA']
```

#### Unicode escapes are parsed

```javascript
JSON.parse('{"\u3053\u3093\u306B\u3061\u306F": "\u4E16\u754C"}')
{'こんにちは': '世界'}
```

## Manual Installation

#### From Release

Download the latest build from the [release page](https://github.com/paolosimone/virtual-json-viewer/releases) and extract the content

#### From source

```bash
cd extension
yarn install

yarn build:chrome   # -> dist/chrome
yarn build:firefox  # -> dist/firefox
```

### Install the extension

#### Chrome

1. Open the Extension Management page by navigating to `chrome://extensions`
1. Enable Developer Mode by clicking the toggle switch next to Developer mode
1. Click the load unpacked button and select the `dist/chrome` directory

#### Firefox

Disable native json viewer

1. Go to `about:config`
1. Search for `devtools.jsonview.enabled`
1. Set to false

Load extension

1. Go to `about:debugging`
1. Click "This Firefox"
1. Click "Load Temporary Add-on" and select the `manifest.json` file inside `dist/firefox` directory

*Note:* The extension is automatically removed when Firefox is closed and must be manually loaded on next start.

#### Others

The extension has not been tested on other browsers, but should work on any chromium browser.

## Contributing

### Bug fix

Ooops! Just [open an issue](https://github.com/paolosimone/virtual-json-viewer/issues/new) with detailed description of what happened and how to reproduce it... Or go for it and open a PR with the patch if you are brave enough!

### Feature request

In general I'd rather keep the feature set of Virtual Json Viewer small and well defined, but if you have a proposal feel free to [open an issue](https://github.com/paolosimone/virtual-json-viewer/issues/new) and we will discuss it.

### Translation

New languages are welcome, open a PR and follow these steps.

Translation files are in json format (yo dawg!) and are located in the translation folder `extension/src/viewer/localization/translations`.

To add a new language:

1. Make a copy of the `en.json` translation file and rename it with the [ISO 639-1](https://en.wikipedia.org/wiki/ISO_639-1) two-letter code of the new language (e.g. `es.json` for Spanish)
1. Translate all the values in the new translation file
1. Register the new language by adding it to the enum (and other structures) inside `extension/src/viewer/localization/Localization.ts`

## Local development

Run `yarn dev` to serve the extension as a web app with hot reload.

Always `yarn format` before creating a commit.

## Performance

*Disclaimer*: this is NOT a formal benchmark, just a few tests with syntethic data to give an idea of loading performance time.

**Setup**
- Virtual Json Viewer v1.0.0 
- Macbook Pro 16 (2019) 2,6 GHz 16 GB
- Chrome 106.0.5249.119 
- Jsons are randomly generated using [this script](https://gist.github.com/paolosimone/437ba2e9675bafcc914b587d53fab0b3) (fixed dept: 10)
- Files are loaded from disk
- Load time recorded with Chrome DevTool
    1. Open file in chrome
    1. From "Performance insights" tab click "Measure page load"
    1. Take the "Largest Contentful Paint" (LCP)

**Results**

| Siblings per level | File Size      | Load time       |
|--------------------|----------------|-----------------|
| 110                | ~100 KB        | ~300 ms         |
| 1100               | ~1 MB          | ~350 ms         |
| 11000              | ~10 MB         | ~900 ms         |
| 110000             | ~100 MB        | ~8000 ms        |

## References

|Tool                                                                           |Usage                                          |
|-------------------------------------------------------------------------------|-----------------------------------------------|
|[anchorme](https://github.com/alexcorvi/anchorme.js)                           |Convert URLs to clickable HTML links|
|[jq-wasm](https://github.com/paolosimone/jq-wasm)                              |JQ in the browser|
|[json-stable-stringify](https://github.com/ljharb/json-stable-stringify)       |Sort keys on JSON serialization apparently is rocket science|
|[React](https://reactjs.org/)                                                  |Learn how to write a frontend application without jQuery and bootstrap|
|[react-color](https://github.com/casesandberg/react-color)                     |Easily edit the custom theme and, more importantly, looking professional while doing it|
|[react-window](https://github.com/bvaughn/react-window)                        |Put the virtual in Virtual Json Viewer|
|[TailwindCSS](https://tailwindcss.com/)                                        |Prevent me from touching CSS files|
|[Typescript](https://www.typescriptlang.org/)                                  |Try to forget I'm actually writing JS 🤢|
|[uid](https://github.com/lukeed/uid)                                           |Fast generation of unique keys for [React lists](https://reactjs.org/docs/lists-and-keys.html#keys) |
|[vite](https://vite.dev/)                                                      |Because Webpack is sooo 2023|
|[vscode-icons](https://github.com/microsoft/vscode-icons)                      |Keep UI buttons clean and intuitive|

## License

MIT License. See also [LICENSE](LICENSE) file.
