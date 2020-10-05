import parse from 'comment-parser';
import ts from 'typescript';

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

export function computeLeadingComment(node: any, element: any): string {
  const leadingComments = ts.getLeadingCommentRanges(node.getFullText(), element.getFullStart());
  if(leadingComments) {
    return node.getFullText().substring((leadingComments as any)[0].pos, (leadingComments as any)[0].end);
  }
  return '';
}

export function extractJsDocCommentFromText(text: string): any {
  const result = [];
  const res: any = parse(text)[0];
  if(res) {
    res && res.tags && res.tags.forEach((tag: any) => {
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

export function extractJsDoc(node: any): any {
  const result: Array<JSDoc|Description> = [];
  if (Array.isArray(node.jsDoc) && node.jsDoc.length > 0) {
    // only get the jsdoc thats directly above the node
    const jsDoc = node.jsDoc[node.jsDoc.length - 1];

    const res: any = parse(jsDoc.getText())[0];
    if(res) {
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
  return [];
}
