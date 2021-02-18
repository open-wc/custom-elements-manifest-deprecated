const ts = require('typescript');

const hasJSDoc = node => !!node?.jsDoc;

function extractSummary(jsDocArray) {
  let summary = '';
  jsDocArray.forEach(jsDoc => {
    const summaryDoc = jsDoc?.tags?.find(tag => tag?.tagName?.getText() === 'summary');
    if(!!summaryDoc) {
      summary = summaryDoc.comment;
    }
  })
  return summary;
}

function getSummaryAndName(node) {
  let summary;
  let name;

  if(hasJSDoc(node)) {
    summary = extractSummary(node.jsDoc);
    if(!!summary) {
      name = node?.name?.getText() || node?.declarationList?.declarations?.[0]?.name?.getText();
      return { name, summary }
    }
  }
  return false;
}

module.exports = function summary() {
  return {
    // Runs for each module
    analyzePhase({node, moduleDoc}){
      let nameAndSummary;
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
        case ts.SyntaxKind.VariableStatement:
        case ts.SyntaxKind.FunctionDeclaration:
          nameAndSummary = getSummaryAndName(node);
          if(nameAndSummary) {
            const klass = moduleDoc?.declarations?.find(dec => dec.name === nameAndSummary.name);
            klass.summary = nameAndSummary.summary;
          }

          break;
        case ts.SyntaxKind.PropertyDeclaration:
        case ts.SyntaxKind.MethodDeclaration:
          nameAndSummary = getSummaryAndName(node);
          if(nameAndSummary) {
            const klass = moduleDoc?.declarations?.find(dec => dec?.members?.some(member => member.name === nameAndSummary.name));
            const fieldOrMethod = klass?.members?.find(member => member.name === nameAndSummary.name);
            fieldOrMethod.summary = nameAndSummary.summary;
          }
          break;
      }
    },
    // Runs for each module, after analyzing, all information about your module should now be available
    moduleLinkPhase({moduleDoc}){},
    // Runs after modules have been parsed
    packageLinkPhase(customElementsManifest){},
  }
}