# Run currest test

## Features
* Run current test at cursor position
* AST parser, no regex checks
* Configurable
* Supports Jest, Mocha, Ava

![features](/images/action.gif)

## Requirements

You must set *run* or *runAndUpdateSnapshots* command

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
* ```runCurrentTest.testBlockIdentifiers``` - Set to the name of test block identifiers (i.e. describe, it, etc...). The default ones provide good match
* ```runCurrentTest.testNameSeparator``` - Separator between block names used in ```${fullTestName}```. Default is ```\\s``` which is space
* ```runCurrentTest.unknownTestNameLiteral``` - Identifier used as block name if block name couldn't be determined. Default is ```.*```

## TODO

Debug current test


## Release Notes

## 0.0.2

Added few more identifiers to default test blocks
Test block titles are now being escaped properly
Close previous opened terminal when running command again

### 0.0.1

Initial release of 'Run current test'


