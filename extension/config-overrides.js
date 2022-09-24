const { override, addPostcssPlugins } = require("customize-cra");
const paths = require("react-scripts/config/paths");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

// Make the build output compatible with chrome extension structure
function convertToChromeExtension(config) {
  const isEnvProduction = process.env.NODE_ENV === "production";
  const manifestVersion = process.env.MANIFEST_VERSION ?? "3";
  const appVersion = process.env.npm_package_version;

  // Replace single entry point in the config with multiple ones
  // Note: you may remove any property below except "popup" to exclude respective entry point from compilation
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

  // Extra HtmlWebpackPlugin instance for options page
  const optionsHtmlPlugin = new HtmlWebpackPlugin({
    inject: true,
    chunks: ["options"],
    template: paths.appPublic + "/options.html",
    filename: "options.html",
    minify: isEnvProduction && minifyOpts,
  });
  // Add the above HtmlWebpackPlugin instance into config.plugins
  // Note: you may remove/comment the next line if you don't need an options page
  config.plugins.push(optionsHtmlPlugin);

  // Custom entry instance for index (development) page
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
  const manifestPlugin = new ManifestPlugin({
    fileName: "asset-manifest.json",
  });
  // Replace original ManifestPlugin instance in config.plugins with the above one
  config.plugins = replacePlugin(
    config.plugins,
    (name) => /ManifestPlugin/i.test(name),
    manifestPlugin
  );

  // Custom MiniCssExtractPlugin instance to get rid of hash in filename template
  const miniCssExtractPlugin = new MiniCssExtractPlugin({
    filename: "static/css/[name].css",
  });
  // Replace original MiniCssExtractPlugin instance in config.plugins with the above one
  config.plugins = replacePlugin(
    config.plugins,
    (name) => /MiniCssExtractPlugin/i.test(name),
    miniCssExtractPlugin
  );

  // Remove GenerateSW plugin from config.plugins to disable service worker generation
  config.plugins = replacePlugin(config.plugins, (name) =>
    /GenerateSW/i.test(name)
  );

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

// Utility function to replace/remove specific plugin in a webpack config
function replacePlugin(plugins, nameMatcher, newPlugin) {
  const i = plugins.findIndex((plugin) => {
    return (
      plugin.constructor &&
      plugin.constructor.name &&
      nameMatcher(plugin.constructor.name)
    );
  });
  return i > -1
    ? plugins
        .slice(0, i)
        .concat(newPlugin || [])
        .concat(plugins.slice(i + 1))
    : plugins;
}

// See: https://tailwindcss.com/docs/installation
function addTailwindCss() {
  return addPostcssPlugins([require("tailwindcss"), require("autoprefixer")]);
}

// See customize-cra and react-app-rewired
module.exports = override(addTailwindCss(), convertToChromeExtension);
