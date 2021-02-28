import ts, { CompilerOptions, ModuleKind, ModuleResolutionKind, ScriptTarget } from 'typescript';

/**
 * The most general and safe version of the TypeScript compiler options.
 */
const defaultCompilerOptions: CompilerOptions = {
  noEmitOnError: false,
  allowJs: true,
  experimentalDecorators: true,
  target: ScriptTarget.Latest,
  downlevelIteration: true,
  module: ModuleKind.ESNext,
  strictNullChecks: true,
  moduleResolution: ModuleResolutionKind.NodeJs,
  esModuleInterop: true,
  noEmit: true,
  pretty: true,
  allowSyntheticDefaultImports: true,
  allowUnreachableCode: true,
  allowUnusedLabels: true,
  skipLibCheck: true,
};

/**
 * Attempst to find, parse and return the TypeScript configuration file (`tsconfig.json`). If it
 * can't be found this function will return `undefined`.
 */
export function readTypeScriptConfigFile(configName?: string): CompilerOptions | undefined {
  const configPath = ts.findConfigFile(
    process.cwd(),
    ts.sys.fileExists,
    configName ?? 'tsconfig.json',
  );

  if (!configPath) return undefined;

  return ts.readConfigFile(configPath!, ts.sys.readFile).config;
}

/**
 * Create a new 'Program' instance. A Program is an immutable collection of 'SourceFile's and a
 * 'CompilerOptions' that represent a compilation unit.
 *
 * Creating a program proceeds from a set of root files, expanding the set of inputs by following
 * imports and triple-slash-reference-path directives transitively. '@types' and
 * triple-slash-reference-types are also pulled in.
 *
 * @param rootNames - A set of root files.
 * @param configName - The name of the `tsconfig.json` file.
 */
export function createTypeScriptProgram(rootFiles: string[], configName?: string) {
  const config = configName ? readTypeScriptConfigFile(configName) : defaultCompilerOptions;
  return ts.createProgram(rootFiles, config ?? defaultCompilerOptions);
}
