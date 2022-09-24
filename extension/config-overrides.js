const { override, addPostcssPlugins } = require("customize-cra");
const paths = require("react-scripts/config/paths");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

// Make the build output compatible with chrome extension structure
function convertToChromeExtension(config) {
  const isEnvProduction = process.env.NODE_ENV === "production";
  const manifestVersion = process.env.MANIFEST_VERSION ?? "3";
  const appVersion = process.env.npm_package_version;

  // Remove CRA default index.html page
  replacePlugin(config.plugins, (name) => /HtmlWebpackPlugin/i.test(name));

  // Replace single entry point in the config with multiple ones
  config.entry = {
    options: paths.appSrc + "/options",
    background: paths.appSrc + "/background",
    content: paths.appSrc + "/content",
  };

  // Change output filename template to get rid of hash there
  config.output.filename = "static/js/[name].js";

  // Disable built-in SplitChunksPlugin
  config.optimization.splitChunks = {
    cacheGroups: { default: false },
  };

  // Disable runtime chunk addition for each entry point
  config.optimization.runtimeChunk = false;

  // Disable polyfill for node.js core modules (referenced in jq.wasm)
  config.resolve.fallback = { path: false, fs: false, crypto: false };

  // Shared minify options to be used in HtmlWebpackPlugin constructor
  const minifyOpts = {
    removeComments: true,
    collapseWhitespace: true,
    removeRedundantAttributes: true,
    useShortDoctype: true,
    removeEmptyAttributes: true,
    removeStyleLinkTypeAttributes: true,
    keepClosingSlash: true,
    minifyJS: true,
    minifyCSS: true,
    minifyURLs: true,
  };

  // Options page
  const optionsHtmlPlugin = new HtmlWebpackPlugin({
    inject: true,
    chunks: ["options"],
    template: paths.appPublic + "/options.html",
    filename: "options.html",
    minify: isEnvProduction && minifyOpts,
  });
  config.plugins.push(optionsHtmlPlugin);

  // If development build include the launcher page
  if (!isEnvProduction) {
    config.entry = { ...config.entry, dev: paths.appIndexJs };

    const indexHtmlPlugin = new HtmlWebpackPlugin({
      inject: true,
      chunks: ["dev"],
      template: paths.appHtml,
      favicon: paths.appPublic + "/logo/16.png",
    });
    config.plugins.push(indexHtmlPlugin);
  }

  // Custom ManifestPlugin instance to cast asset-manifest.json back to old plain format
  const manifestPlugin = new WebpackManifestPlugin({
    fileName: "asset-manifest.json",
  });
  replacePlugin(
    config.plugins,
    (name) => /ManifestPlugin/i.test(name),
    manifestPlugin
  );

  // Custom MiniCssExtractPlugin instance to get rid of hash in filename template
  const miniCssExtractPlugin = new MiniCssExtractPlugin({
    filename: "static/css/[name].css",
  });
  replacePlugin(
    config.plugins,
    (name) => /MiniCssExtractPlugin/i.test(name),
    miniCssExtractPlugin
  );

  // Remove GenerateSW plugin from config.plugins to disable service worker generation
  replacePlugin(config.plugins, (name) => /GenerateSW/i.test(name));

  // Include correct manifest version
  const copyManifest = new CopyPlugin({
    patterns: [
      {
        from: paths.appPath + `/manifest-v${manifestVersion}.json`,
        to: "manifest.json",
        transform: (content) =>
          content.toString().replace("${version}", appVersion),
      },
    ],
  });
  config.plugins.push(copyManifest);

  return config;
}

// Utility function to replace/remove inplace specific plugin in a webpack config
function replacePlugin(plugins, nameMatcher, newPlugin) {
  const i = plugins.findIndex(
    (plugin) =>
      plugin.constructor &&
      plugin.constructor.name &&
      nameMatcher(plugin.constructor.name)
  );

  if (i > -1) {
    plugins.splice(i, 1, ...[newPlugin].filter(Boolean));
  }
}

// See: https://tailwindcss.com/docs/installation
function addTailwindCss() {
  return addPostcssPlugins([require("tailwindcss"), require("autoprefixer")]);
}

// See customize-cra and react-app-rewired
module.exports = override(addTailwindCss(), convertToChromeExtension);
