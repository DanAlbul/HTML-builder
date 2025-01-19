const path = require('path');
const fs = require('fs');

const makeDirectory = async (dirPath) => {
  const empty = await emptyDirectory(dirPath);
  return new Promise(() => fs.mkdir(dirPath, { recursive: true }, (err) => {}));
};

const emptyDirectory = async (dirPath) => {
  fs.readdir(dirPath, { withFileTypes: true }, (err, files) => {
    if (!files) return;
    for (const file of files) {
      fs.unlink(path.join(dirPath, file.name), (err) => {
        if (err) return;
      });
    }
  });
};

const copyFilesFromDirToDir = async (dirNameFrom, dirNameTo) => {
  const copyFrom = path.join(__dirname, dirNameFrom);
  const copyTo = path.join(__dirname, dirNameTo);

  await makeDirectory(copyTo).then(
    fs.readdir(copyFrom, { withFileTypes: true }, (err, files) => {
      if (err) throw err;
      else {
        const fileNames = [];
        files.forEach((file) => {
          const filePath = path.join(
            __dirname,
            `${path.basename(copyFrom)}`,
            file.name,
          );
          if (file.isFile()) {
            fileNames.push(file.name);
            fs.copyFile(filePath, path.join(copyTo, file.name), (err) => {
              if (err) throw err;
            });
          }
        });
        //fileNames.forEach((f, i) => console.log(`${i + 1} - ${f}`));
        /* console.log(
					`\nall files were copied/overwritten successfully\n\nfrom dir "${copyFrom}"\nto dir "${copyTo}"`
				); */
      }
    }),
  );
};

copyFilesFromDirToDir('files', 'files-copy');
