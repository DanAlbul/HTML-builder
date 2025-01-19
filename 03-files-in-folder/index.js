const fs = require('fs');
const path = require('path');

const readFolderFilesStats = (name) => {
  const folderPath = path.join(__dirname, name);

  fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
    if (err) throw err;
    else {
      files.forEach((file) => {
        const filePath = path.join(
          __dirname,
          `${path.basename(folderPath)}`,
          file.name,
        );
        if (file.isFile()) {
          const fileExt = path.extname(filePath);
          const fileName = file.name.replace(fileExt, '');
          fs.stat(filePath, (err, stats) => {
            if (err) throw err;
            console.log(
              `${fileName} - ${fileExt.slice(1)} - ${stats.size / 1024}kb`,
            );
          });
        }
      });
    }
  });
};

console.clear();
readFolderFilesStats('secret-folder');
