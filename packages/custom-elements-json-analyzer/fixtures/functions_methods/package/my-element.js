export class MyElement extends HTMLElement {
  method1() {}
  method2(param1) {}
  method3(param1, param2) {}
  method4(param1, param2 = '') {}

  /** only description */
  tsMethod1(param: string): boolean {}

  /**
   * Method description
   * @param {string} foo - description
   * @return {boolean}
   */
  jsDocMethod1(foo){}

  /**
   * @param {string} foo
   * @param {string} [bar]
   * @returns {boolean}
   */
  jsDocMethod2(foo, bar){}

  /** @returns {boolean} */
  jsDocMethod3(foo){}

  /** only description */
  jsDocMethod4(foo){}
}

export function function1() {}
export function function2(param1) {}
export function function3(param1, param2) {}
export function function4(param1, param2 = '') {}

export function tsFunction1(param: string): boolean {}

/**
 * @param {string} foo
 * @return {boolean}
 */
export function jsDocFunction1(foo){}

/**
 * @param {string} foo
 * @param {string} [bar]
 * @returns {boolean}
 */
export function jsDocFunction2(foo, bar){}

/** @returns {boolean} */
export function jsDocFunction3(foo){}

/** only description */
export function jsDocFunction4(foo){}