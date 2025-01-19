const path = require('path');
const fs = require('fs');

const copyFromPath = path.join(__dirname, 'files');
const copyToPath = path.join(__dirname, 'files-copy');

const makeDirectory = async (dirPath) => {
  fs.access(dirPath, function (error) {
    if (error) {
      return new Promise(() => {
        fs.mkdir(dirPath, { recursive: true }, (err) => {});
      });
    } else {
      emptyDirectory(dirPath).then(() => {
        return new Promise(() => {
          fs.mkdir(dirPath, { recursive: true }, (err) => {});
        });
      });
    }
  });
};

const emptyDirectory = async (dirPath) => {
  return new Promise(() => {
    fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
      if (!files) return;
      for (const file of files) {
        fs.unlink(path.join(dirPath, file.name), (err) => {
          if (err) return;
        });
      }
    });
  });
};

const copyFilesFromDirToDir = async (copyFrom, copyTo) => {
  fs.readdir(copyFrom, { withFileTypes: true }, (err, files) => {
    if (err) throw err;
    else {
      files.forEach((file) => {
        const filePathFrom = path.join(copyFrom, file.name);
        const filePathTo = path.join(copyTo, file.name);
        if (file.isFile()) {
          fs.access(path.join(copyTo, file.name), function (error) {
            if (error) {
              fs.copyFile(filePathFrom, filePathTo, (err) => {
                if (err) return;
              });
            } else {
              fs.unlink(filePathTo, (err) => {
                if (err) return;
              });
              fs.copyFile(filePathFrom, filePathTo, (err) => {
                if (err) return;
              });
            }
          });
        }
      });
    }
  });
};

makeDirectory(copyToPath).then(copyFilesFromDirToDir(copyFromPath, copyToPath));
