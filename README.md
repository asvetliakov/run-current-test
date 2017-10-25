# Run currest test

## Features
* Run current test at cursor position
* AST parser, no regex checks
* Configurable
* Supports Jest, Mocha, Ava

![features](/images/action.gif)

## Requirements

You must set *run* or *runAndUpdateSnapshots* command:

*Way 1 (preferred)*:
Define your test command in ```package.json```, for example:
```json
    "scripts": {
        "test": "jest"
    }
```
Then define commands in .vscode/settings.json similar to these (example for jest):
```js
    "runCurrentTest.run": "npm run test -- ${relativeTestPath} --runTestsByPath \"^${fullTestName}$\"",
    "runCurrentTest.runAndUpdateSnapshots": "npm run test -- -u ${relativeTestPath} --runTestsByPath \"^${fullTestName}$\""
```

*Way 2*:
Use full path without involing npm scripts, similar to these:

For Jest:
```js
    "runCurrentTest.run": "${workspaceRoot}/node_modules/.bin/jest ${relativeTestPath} --testNamePattern \"${fullTestName}\"",
    "runCurrentTest.runAndUpdateSnapshots": "${workspaceRoot}/node_modules/.bin/jest -u ${relativeTestPath} --testNamePattern \"${fullTestName}\""
    // windows
    "runCurrentTest.run": "${workspaceRoot}\\node_modules\\.bin\\jest.cmd ${relativeTestPath} --testNamePattern \"${fullTestName}\"",
    "runCurrentTest.runAndUpdateSnapshots": "${workspaceRoot}\\node_modules\\.bin\\jest.cmd -u ${relativeTestPath} --testNamePattern \"${fullTestName}\""
```
For ava:
```js
    "runCurrentTest.run": "${workspaceRoot}/node_modules/.bin/ava ${relativeTestPath} --match \"${fullTestName}\"",
    "runCurrentTest.runAndUpdateSnapshots": "${workspaceRoot}/node_modules/.bin/ava -u ${relativeTestPath} --match \"${fullTestName}\""
    // windows
    "runCurrentTest.run": "${workspaceRoot}\\node_modules\\.bin\\ava.cmd ${relativeTestPath} --match \"${fullTestName}\"",
    "runCurrentTest.runAndUpdateSnapshots": "${workspaceRoot}\\node_modules\\.bin\\ava.cmd -u ${relativeTestPath} --match \"${fullTestName}\""
```
For mocha:
```js
    "runCurrentTest.run": "${workspaceRoot}/node_modules/.bin/mocha ${relativeTestPath} --grep \"${fullTestName}\"",
    // windows
    "runCurrentTest.run": "${workspaceRoot}\\node_modules\\.bin\\mocha.cmd ${relativeTestPath} --grep \"${fullTestName}\"",
```

*You can pass any command here, for example if you need to additionally set ```NODE_ENV=test```*:
```js
    "runCurrentTest.run": "NODE_ENV=test ${workspaceRoot}/node_modules/.bin/jest ${relativeTestPath} --testNamePattern \"${fullTestName}\"",
```
I'd recommend to use test setup file instead though.


You can use following templates for substitution in run commands:
* ```${workspaceRoot}``` - Will be replaced with absolute path to workspace root
* ```${testFilePath}``` - Will be replaced with absolute path to current test file
* ```${relativeTestPath}``` - Will be replaced with relative current test file to workspace root
* ```${testName}``` - Will be replaced with single current test name block
* ```${fullTestName}``` - Will be replaced with full path to current test name block. Full path is the all parent block paths + the current one, i.e "describe innerdescribe test"

## Extension Settings

* ```runCurrentTest.run``` - See above
* ```runCurrentTest.runAndUpdateSnapshots``` - See above
* ```runCurrentTest.autoSave``` - Auto-save dirty editor when running run command. Default is true
* ```runCurrentTest.usePreviousTestCommand``` - Use previous test command if no test blocks (```it(), describe(), etc```) were found in the file. Useful when have opened test & source side-by-side and keep forgetting to switch to test side to run command
* ```runCurrentTest.testBlockIdentifiers``` - Set to the name of test block identifiers (i.e. describe, it, etc...). The default ones provide good match
* ```runCurrentTest.testNameSeparator``` - Separator between block names used in ```${fullTestName}```. Default is ```\\s``` which is space
* ```runCurrentTest.unknownTestNameLiteral``` - Identifier used as block name if block name couldn't be determined. Default is ```.*```

## TODO

Debug current test


## Release Notes

## [0.1.0]
- Support multi-root workspaces
- Added license (MIT)
- Run previous test command if no test blocks were found (configurable, default true)

## 0.0.2

Added few more identifiers to default test blocks
Test block titles are now being escaped properly
Close previous opened terminal when running command again

### 0.0.1

Initial release of 'Run current test'


