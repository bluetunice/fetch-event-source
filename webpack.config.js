const path = require("path");
module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "fetch-event-source.js",
    library: "@buletu/fetch-event-source",
    libraryTarget: "umd"
  },
  mode: "production"
};
