# Virtual Json Viewer

Browser plugin that uses [virtual DOM](https://github.com/Lodin/react-vtree) to render JSONs with built-in search, [JQ filtering](https://stedolan.github.io/jq) and many other [features](#features).

## Why?

> "Oh my! There are plenty of json viewers, why making a new one?"

Rightful question, and the answer is quite simple: the others weren't good enough [for my needs].  

I am a backend developer and in my everyday job I have to debug large json payloads, 
so large that every other plugin for chrome I tried freezed without showing any content.

> "Good for you, but **my** payloads are small, pretty and strawberry flavoured"

That's ok, if you are happy with your current plugin, no need to change.  

And if you want to come back later don't worry, we'll still be here, with blazing fast loading time, 
built-in search, JQ filtering and many other features... but no strawberries, sorry

## Installation

_Note:_ This add-on has been developed and tested on Google Chrome 94

### Get the build

__From Release__

1. Download the latest build from the [release page](https://github.com/paolosimone/virtual-json-viewer/releases)
1. Extract the content

__From Source__

1. Clone or download this repository
1. `cd virtual-json-viewer/extension`
1. `yarn install`
1. `yarn build`

### Install the plugin

1. Open the Extension Management page by navigating to `chrome://extensions`
1. Enable Developer Mode by clicking the toggle switch next to Developer mode
1. Click the load unpacked button and select the `build` directory

## Features

- [X] JSON rendering using virtual DOM and collapsable nodes
    - [X] Sort JSON keys alphabetically
    - [X] Preview nested item count for closed nodes
    - [X] Color-encoded value types
    - [X] Collapse/expand all nodes
- [X] Full text search
    - [X] Highlight search results
    - [X] Option to completely hide subtrees without any search match
    - [X] Option to enable case sensitive search
- [X] JQ filtering
- [X] Raw JSON viewer
    - [X] Prettify/minify 
- [X] Download JSON
- [X] Dark mode
- [X] Internationalization
- [X] Customizable settings

## Contributing

Sorry, I am not accepting contributions at the moment...
But feel free to open an issue in case of bug, feature request or suggestion!

### Local development

Run `yarn start` to serve the extension as a web app with hot reload.

Always `yarn format` before creating a commit.

## Performance

*Disclaimer*: this is NOT a formal benchmark, just a few tests with syntethic data to give an idea of loading performance time.

**Setup**
- Macbook Pro 16 (2019) 2,6 GHz 16 GB
- Chrome 95.0.4638.69
- Jsons are randomly generated using [this script](https://gist.github.com/paolosimone/437ba2e9675bafcc914b587d53fab0b3) (fixed dept: 10)
- Files are loaded from disk
- Load time recorded with Chrome DevTool
    1. Open file in chrome
    1. Click "Start profiling and reload page" 
    1. Take the end of the last frame 

**Results**

| Siblings per level | File Size      | Load time       |
|--------------------|----------------|-----------------|
| 110                | ~100 KB        | ~250 ms         |
| 1100               | ~1 MB          | ~350 ms         |
| 11000              | ~10 MB         | ~1200 ms        |
| 110000             | ~100 MB        | ~10 s           |

## References

|Tool                                                                                                                       |Usage                                          |
|---------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
|[cra-template-complex-browserext-typescript](https://github.com/hindmost/cra-template-complex-browserext-typescript)       |Project scaffolding, huge help!                |
|[customize-cra](https://github.com/arackaf/customize-cra)                                                                  |Break webpack config, then fix it              |
|[jq-wasm](https://github.com/paolosimone/jq-wasm)                                                                          |JQ in the browser                              |
|[json-stable-stringify](https://github.com/substack/json-stable-stringify)                                                 |Sort keys on JSON serialization apparently is rocket science|
|[React](https://reactjs.org/)                                                                                              |Learn how to write a frontend application without jQuery and bootstrap|
|[react-vtree](https://github.com/Lodin/react-vtree)                                                                        |Render the JSON. I'd say it's a pretty important role|
|[TailwindCSS](https://tailwindcss.com/)                                                                                    |Prevent me from touching CSS files|
|[Typescript](https://www.typescriptlang.org/)                                                                              |Try to forget I'm actually writing JS 🤢|
|[uid](https://github.com/lukeed/uid)                                                                                       |Fast generation of unique keys for [React lists](https://reactjs.org/docs/lists-and-keys.html#keys) |
|[vscode-icons](https://github.com/microsoft/vscode-icons)                                                                  |Keep UI buttons clean and intuitive|


## License

MIT License