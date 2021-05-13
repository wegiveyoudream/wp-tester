const path = require("path");
const fs = require("fs");

// https://stackoverflow.com/a/22185855/2958717
/**
 * Look ma, it's cp -R.
 * @param {string} src  The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
function copyRecursiveSync(src, dest) {
  const existsSrc = fs.existsSync(src);
  const statsSrc = existsSrc && fs.statSync(src);
  const isDirectorySrc = existsSrc && statsSrc.isDirectory();

  const existsDest = fs.existsSync(dest);
  // const statsDest = existsDest && fs.statSync(dest);
  // const isDirectoryDest = existsDest && statsDest.isDirectory();

  if (isDirectorySrc) {
    if (!existsDest) {
      fs.mkdirSync(dest);
    }

    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function copyBuildTo(destPath) {
  const src = path.resolve(__dirname, "build");
  const dest = path.resolve(__dirname, destPath);

  fs.rmdirSync(dest, { recursive: true });

  copyRecursiveSync(src, dest);
}

module.exports = {
  copyBuildTo,
};
