const path = require('path');
const fs = require('fs');

const targetFilePath = path.join(__dirname, 'text.txt');
let readStream = new fs.createReadStream(targetFilePath, { encoding: 'utf-8' });

const readFile = (stream = readStream) => {
  stream.on('readable', () => {
    let data = stream.read();
    if (data != null) console.log(data);
  });

  stream.on('error', function (err) {
    if (err.code == 'ENOENT') {
      console.log('File is missing');
    } else {
      console.error(err);
    }
  });
};

if (require.main === module) {
  console.clear();
  readFile(readStream);
} else {
  exports.readFile = readFile;
}
