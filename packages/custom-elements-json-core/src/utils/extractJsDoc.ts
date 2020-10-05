import parse from 'comment-parser';

/**
 * @attr {boolean} disabled - description
 * tag type name description
 */

export interface JSDoc {
  tag: string;
  type: string;
  name: string;
  optional: boolean;
  description: string;
  line: number;
  source: string;
}

interface Description {
  description: string;
}

function extractImportType(jsDoc: any) {
  if(jsDoc.type && jsDoc.type.match(/import(.*)\./)) {
    jsDoc.type = jsDoc.type.replace(/import(.*)\./, '');
  }
  return jsDoc;
}

export function extractJsDoc(node: any): any {
  const result: Array<JSDoc|Description> = [];
  if (Array.isArray(node.jsDoc) && node.jsDoc.length > 0) {
    // only get the jsdoc thats directly above the class
    const jsDoc = node.jsDoc[node.jsDoc.length - 1];

    const res: any = parse(jsDoc.getText())[0];
    res.tags.forEach((tag: any) => {
      tag = extractImportType(tag);
      result.push(tag);
    });

    if(res.description) {
      result.push({ description: res.description });
    }
  }
  return result;
}
