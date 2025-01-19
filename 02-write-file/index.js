const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> ',
});

const commands = {
  exit() {
    rl.close();
  },
};

const writeDataToFile = (fileName) => {
  const filePath = path.join(__dirname, fileName);

  // data array for tracking user input, one entry == one line of input
  const data = [];

  console.clear();
  console.log('Hi, dear user! Please enter some data below.\n');
  rl.prompt();

  rl.on('line', (userInput) => {
    userInput = userInput.trim();
    const command = commands[userInput];
    if (command) command();
    else {
      data.push(userInput);
      // if input == null => create new file and start writing data inside, line by line.
      // else => append last inputed line to the file buffer
      const wStream = fs.createWriteStream(filePath, {
        encoding: 'utf-8',
        flags: 'a+',
      });
      wStream.write(data[data.length - 1] + '\n');

      wStream.end();
      rl.prompt();
    }
  });

  rl.on('close', () => {
    if (!data.length) console.log('There is nothing to save!');
    else
      console.log(
        `\n\nThank you. Your data has been saved in file:\n${filePath}\n`,
      );
  });
};

writeDataToFile('data.txt');
