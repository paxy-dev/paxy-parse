const {
  expect
} = require('chai');

function assertResultEqual(result, data) {
  const keys = Object.keys(data);
  const convertedResult = {};
  const convertedData = {};
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === 'id') {
      continue;
    } else if (typeof result[keys[i]] === 'object') {
      continue;
    } else {
      convertedResult[keys[i]] = result[keys[i]];
      convertedData[keys[i]] = data[keys[i]];
    }
  }
  expect(convertedResult).to.deep.equal(convertedData);
}


module.exports = {
  assertResultEqual
}