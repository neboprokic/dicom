const fs = require('fs');
const path = require('path');
const { dialog } = require('electron').remote;
const dicomParser = require('dicom-parser');
const glob = require('glob');

function writeData(dataSet, elementId, text) {
  const element = dataSet.elements[elementId];
  const x = ' '.charCodeAt(0);

  for (var i = 0; i < element.length; i++) {
    const char = text.charCodeAt(i) || x;

    dataSet.byteArray[element.dataOffset + i] = char;
  }
}

const name = document.getElementById('name');
const id = document.getElementById('id');
const birthday = document.getElementById('birthday');
const sex = document.getElementById('sex');
const notification = document.getElementById('notification');
const submitBtn = document.getElementById('submitBtn');
let selectedFiles = [];

document
  .getElementById('selectBtn')
  .addEventListener('click', async (event) => {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'], // "openFile", "multiSelections"
      defaultPath: __dirname, // path.join(__dirname, "images")
      // filters: [{ name: "DICOM images", extensions: ["dcm"] }],
    });

    glob(`${filePaths[0]}/**/*.dcm`, (err, files) => {
      if (err) return alert(`greska bri biranju fajlova ${err}`);

      if (files.length) {
        selectedFiles = files;
        notification.innerText = `izabrani fajlovi: ${files.join('\n')}`;
        submitBtn.style = 'display: block';
      }
    });
  });

submitBtn.addEventListener('click', (event) => {
  if (!selectedFiles.length) return;

  selectedFiles.forEach((filePath) => {
    const dicomFileAsBuffer = fs.readFileSync(filePath);
    const dataSet = dicomParser.parseDicom(dicomFileAsBuffer);

    // const patient = {
    //   name: dataSet.string('x00100010'),
    //   id: dataSet.string('x00100020'),
    //   birthdate: dataSet.string('x00100030'),
    //   sex: dataSet.string('x00100040'),
    // };

    writeData(dataSet, 'x00100010', name.value || 'xxxxxxxxx');
    writeData(dataSet, 'x00100020', id.value || 'xxxxxxx');
    writeData(dataSet, 'x00100030', birthday.value || 'xxxxxxxx');
    writeData(dataSet, 'x00100040', sex.value || 'x');

    fs.writeFileSync(filePath, dataSet.byteArray);
  });

  alert(`${selectedFiles.length} fajlova uspesno anonimizovano`);
  notification.innerText = `izaberite fajlove za anonimizaciju`;
  submitBtn.style = 'display: none';
  selectedFiles = [];
});
