const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'project-dist');
const stylesDir = path.join(__dirname, 'styles');

const mergeFiles = async (mergeFromPath, distPath, fileExt) => {
  const destPath = path.join(
    __dirname,
    `${path.basename(distPath)}`,
    `bundle${fileExt}`,
  );

  //get rid off old bundle if exists
  fs.readdir(distPath, { withFileTypes: true }, (err, files) => {
    if (!files) return;
    files.forEach((file) => {
      if ((file.name = `bundle${fileExt}`))
        fs.unlink(destPath, (err) => {
          if (err) return;
        });
    });
  });

  // merge all files with fileExt into one bundle.fileExt
  fs.readdir(mergeFromPath, { withFileTypes: true }, (err, files) => {
    if (err) throw err;
    files.forEach((file) => {
      const filePath = path.join(
        __dirname,
        `${path.basename(mergeFromPath)}`,
        file.name,
      );
      if (path.extname(filePath) == fileExt) {
        let readStream = fs.createReadStream(filePath, 'utf-8');
        let writeStream = fs.createWriteStream(destPath, {
          encoding: 'utf-8',
          flags: 'a',
        });

        readStream.pipe(writeStream);
      }
    });
  });
};

mergeFiles(stylesDir, distDir, '.css');
