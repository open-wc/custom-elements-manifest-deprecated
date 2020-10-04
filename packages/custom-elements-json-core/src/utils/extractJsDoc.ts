import parse from 'comment-parser';

/**
 * @attr {boolean} disabled - description
 * tag type name description
 */

export interface JSDoc {
  tag: string,
  type: string,
  name: string,
  optional: boolean,
  description: string,
  line: number,
  source: string
}

export function extractJsDoc(node: any): JSDoc[] {
  const result: JSDoc[] = [];
  if (Array.isArray(node.jsDoc) && node.jsDoc.length > 0 ) {
    // only get the jsdoc thats directly above the class
    const jsDoc = node.jsDoc[node.jsDoc.length - 1];

    const res: any = parse(jsDoc.getText())[0];

    res.tags.forEach((tag: any) => {
      result.push(tag);
    });
  }
  return result;
}