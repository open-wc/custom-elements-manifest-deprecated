import ts from 'typescript';

export default {
  plugins: [
    function myPlugin() {
      let state = 0;

      return {
        // Runs for each module
        analyzePhase({node, moduleDoc}){
          switch (node.kind) {
            case ts.SyntaxKind.ClassDeclaration:
              const className = node.name.getText();

              node.members?.forEach(member => {
                const memberName = member.name.getText();

                member?.jsDoc.forEach(jsDoc => {
                  jsDoc.tags?.forEach(tag => {
                    if(tag.tagName.getText() === 'editvia') {
                      const description = tag.comment;

                      const classDeclaration = moduleDoc.declarations.find(declaration => declaration.name === className);
                      const messageField = classDeclaration.members.find(member => member.name === memberName);
                      
                      messageField.editvia = description
                    }
                  });
                });
              });
     
              break;
          }
        },
        // Runs for each module, after analyzing, all information about your module should now be available
        moduleLinkPhase({moduleDoc}){
          // console.log(moduleDoc);
        },
        // Runs after modules have been parsed
        packageLinkPhase(customElementsManifest){
          // console.log(customElementsManifest);
        },
      }
    }
  ]
}