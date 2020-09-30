const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

const { create } = require('../src/create');
const { customElementsJson } = require('../src/customElementsJson');

const fixturesDir = path.join(process.cwd(), 'fixtures');
const testCases = fs.readdirSync(fixturesDir);

describe('integration tests', () => {
  testCases.forEach(testCase => {
    it(`Testcase ${testCase}`, async () => {
      if (testCase.startsWith('_')) {
        expect(true);
        return;
      }
      customElementsJson.reset();

      const fixturePath = path.join(fixturesDir, `${testCase}/fixture/custom-elements.json`);
      const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

      const packagePath = path.join(fixturesDir, `${testCase}/package`);
      const outputPath = path.join(fixturesDir, `${testCase}/output.json`);
      const result = await create(packagePath);

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
