const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'template.html');
const distDir = path.join(__dirname, 'project-dist');
const stylesDir = path.join(__dirname, 'styles');
const copyFromPath = path.join(__dirname, 'assets');
const copyToPath = path.join(__dirname, `${path.basename(distDir)}`, 'assets');

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
        fs.unlink(path.join(dirPath, file.name), () => {});
      }
    });
  });
};

const getTemplateDoc = async (templateFile) => {
  let content = '';
  return new Promise((resolve) => {
    const readStream = fs.createReadStream(templateFile, { encoding: 'utf-8' });
    readStream.on('readable', () => {
      let data = readStream.read();
      if (data != null) content += data;
    });
    readStream.on('end', function (err) {
      if (err) throw err;
      resolve(content);
    });
  });
};

const createHtmlFromTemplate = async () => {
  return new Promise(() => {
    const indexHtmlPath = path.join(
      __dirname,
      `${path.basename(distDir)}`,
      'index.html',
    );
    const componentsPath = path.join(__dirname, 'components');

    getTemplateDoc(templatePath).then((template) => {
      return new Promise((resolve) => {
        fs.readdir(componentsPath, { withFileTypes: true }, (err, files) => {
          let indexHtml = template;
          if (err) throw err;
          files.forEach(async (file, i, arr) => {
            const filePath = path.join(
              __dirname,
              `${path.basename(componentsPath)}`,
              file.name,
            );
            let componentContent = '';
            const componentName = `{{${file.name.replace(
              path.extname(filePath),
              '',
            )}}}`;
            if (path.extname(filePath) === '.html') {
              const readStream = fs.createReadStream(filePath, {
                encoding: 'utf-8',
              });
              readStream.on('readable', () => {
                let data = readStream.read();
                if (data != null) componentContent += data;
              });
              readStream.on('end', function (err) {
                if (err) throw err;
                indexHtml = indexHtml.replace(componentName, componentContent);
                if (i === arr.length - 1) {
                  resolve(indexHtml);
                }
              });
            }
          });
        });
      }).then((indexHtml) => {
        fs.access(indexHtmlPath, (err) => {
          const writeStream = fs.createWriteStream(indexHtmlPath, {
            encoding: 'utf-8',
            flags: 'a',
          });
          if (err) {
            writeStream.write(indexHtml);
            writeStream.end();
          } else {
            fs.unlink(indexHtmlPath, (err) => {
              if (err) throw err;
            });
            writeStream.write(indexHtml);
            writeStream.end();
          }
        });
      });
    });
  });
};

const mergeFiles = async (mergeFromPath, distPath, fileExt) => {
  let styleCss = '';
  const destPath = path.join(
    __dirname,
    `${path.basename(distPath)}`,
    `style${fileExt}`,
  );
  return new Promise((resolve) => {
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
          readStream.on('readable', () => {
            let data = readStream.read();
            if (data != null) styleCss += data + '\n\n';
          });
          readStream.on('end', function (err) {
            if (err) throw err;
            resolve(styleCss);
          });
        }
      });
    });
  }).then((styles) => {
    fs.access(destPath, (err) => {
      let writeStream = fs.createWriteStream(destPath, {
        encoding: 'utf-8',
        flags: 'a',
      });
      if (err) {
        writeStream.write(styles);
        writeStream.end();
      } else {
        fs.unlink(destPath, (err) => {
          if (err) throw err;
        });
        writeStream.write(styles);
        writeStream.end();
      }
    });
  });
};

const copyFolderWithSubfolders = async (subFolder, folderPath) => {
  return new Promise(() => {
    makeDirectory(folderPath).then(
      fs.readdir(subFolder, { withFileTypes: true }, (err, files) => {
        if (err) throw err;
        else {
          files.forEach((file) => {
            const filePath = path.join(folderPath, file.name);
            if (file.isDirectory()) {
              fs.mkdir(filePath, { recursive: true }, (err) => {});
            }
          });
        }
      }),
    );
  });
};

const copyFilesFromDirToDir = async (copyFrom, copyTo) => {
  fs.readdir(copyFrom, { withFileTypes: true }, (err, files) => {
    if (err) throw err;
    else {
      files.forEach((file) => {
        const filePath = path.join(
          __dirname,
          `${path.basename(copyFrom)}`,
          file.name,
        );

        if (file.isDirectory()) {
          copyFilesFromDirToDir(filePath, path.join(copyTo, file.name));
        } else if (file.isFile()) {
          const filePathFrom = path.join(copyFrom, file.name);
          const filePathTo = path.join(copyTo, file.name);

          fs.access(
            path.join(__dirname, `${path.basename(copyFrom)}`),
            function (error) {
              if (error) {
                fs.copyFile(filePathFrom, filePathTo, (err) => {
                  if (err) throw err;
                });
              } else {
                fs.unlink(filePathFrom, (err) => {
                  if (err) throw err;
                });
                fs.copyFile(filePathFrom, filePathTo, (err) => {
                  if (err) throw err;
                });
              }
            },
          );
        }
      });
    }
  });
};

// (1) create project-dist folder and generate index.html from template and components
makeDirectory(distDir)
  .then(createHtmlFromTemplate())
  // (2) merge styles into style.css file and put it into project-dist
  .then(mergeFiles(stylesDir, distDir, '.css'))
  // (3) create assets folder and all subfolders
  .then(copyFolderWithSubfolders(copyFromPath, copyToPath))
  // (4) copy all subfolders and files of assest folder into project-dist
  .then(copyFilesFromDirToDir(copyFromPath, copyToPath));
