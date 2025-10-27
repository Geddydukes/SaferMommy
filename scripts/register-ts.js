const fs = require('fs');
const Module = require('module');
const path = require('path');
const ts = require('typescript');

const defaultConfigPath = path.join(process.cwd(), 'tsconfig.json');
let compilerOptions = {
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.ES2019,
  esModuleInterop: true,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  resolveJsonModule: true,
  skipLibCheck: true,
};

if (fs.existsSync(defaultConfigPath)) {
  const configFile = ts.readConfigFile(defaultConfigPath, ts.sys.readFile);
  if (!configFile.error) {
    const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, path.dirname(defaultConfigPath));
    compilerOptions = { ...compilerOptions, ...parsed.options };
  }
}

require.extensions['.ts'] = function (module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions,
    fileName: filename,
    reportDiagnostics: true,
  });

  if (transpiled.diagnostics && transpiled.diagnostics.length > 0) {
    const formatted = ts.formatDiagnosticsWithColorAndContext(transpiled.diagnostics, {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: (f) => f,
      getNewLine: () => '\n',
    });
    throw new Error(`TypeScript compilation error in ${filename}:\n${formatted}`);
  }

  module._compile(transpiled.outputText, filename);
};

require.extensions['.tsx'] = require.extensions['.ts'];

const originalLoad = Module._load;
const builtinMocks = {
  'expo-file-system': {
    cacheDirectory: '/tmp/',
    EncodingType: {
      Base64: 'base64',
    },
    async downloadAsync(_uri, destination) {
      return { uri: destination, headers: {} };
    },
    async readAsStringAsync(_uri, _options) {
      return '';
    },
    async deleteAsync() {
      return undefined;
    },
  },
};

Module._load = function (request, parent, isMain) {
  if (Object.prototype.hasOwnProperty.call(builtinMocks, request)) {
    return builtinMocks[request];
  }

  return originalLoad.apply(this, arguments);
};
