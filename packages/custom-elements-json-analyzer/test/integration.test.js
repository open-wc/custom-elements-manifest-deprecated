const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

const { create } = require('../src/create');
const { customElementsJson } = require('../src/customElementsJson');

const fixturesDir = path.join(process.cwd(), 'fixtures');
let testCases = fs.readdirSync(fixturesDir);

const runSingle = testCases.find(_case => _case.startsWith('+'));
if (runSingle) {
  testCases = [runSingle];
}

describe('integration tests', () => {
  testCases.forEach(testCase => {
    it(`Testcase ${testCase}`, async () => {
      // skips tests
      if (testCase.startsWith('-')) {
        expect(true);
        return;
      }
      customElementsJson.reset();

      const fixturePath = path.join(fixturesDir, `${testCase}/fixture/custom-elements.json`);
      const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

      const packagePath = path.join(fixturesDir, `${testCase}/package`);
      const outputPath = path.join(fixturesDir, `${testCase}/output.json`);
      console.log('########', packagePath);
      const result = await create({ glob: packagePath });

      fs.writeFileSync(
        outputPath,
        JSON.stringify(
          result,
          (key, val) => {
            if (key !== 'currentModule') {
              return val;
            }
          },
          2,
        ),
      );

      expect(result).to.deep.equal(fixture);
    });
  });
});
