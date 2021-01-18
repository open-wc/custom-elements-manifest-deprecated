import parse from 'comment-parser';
import ts from 'typescript';



function extractImportType(jsDoc) {
  if(jsDoc.type && jsDoc.type.match(/import(.*)\./)) {
    jsDoc.type = jsDoc.type.replace(/import(.*)\./, '');
  }
  return jsDoc;
}

export function computeLeadingComment(node, element) {
  const leadingComments = ts.getLeadingCommentRanges(node.getFullText(), element.getFullStart());
  if(leadingComments) {
    return node.getFullText().substring((leadingComments)[0].pos, (leadingComments)[0].end);
  }
  return '';
}

export function extractJsDocCommentFromText(text) {
  const result = [];
  const res = parse(text)[0];
  if(res) {
    res && res.tags && res.tags.forEach((tag) => {
      tag = extractImportType(tag);
      result.push(tag);
    });

    if(res.description) {
      result.push({ description: res.description });
    }

    return result;
  }
  return [];
}

export function extractJsDoc(node) {
  const result = [];
  if (Array.isArray(node.jsDoc) && node.jsDoc.length > 0) {
    // only get the jsdoc thats directly above the node
    const jsDoc = node.jsDoc[node.jsDoc.length - 1];

    const res = parse(jsDoc.getText())[0];
    if(res) {
      res.tags.forEach((tag) => {
        tag = extractImportType(tag);
        result.push(tag);
      });

      if(res.description) {
        result.push({ description: res.description });
      }
    }
    return result;
  }
  return [];
}
