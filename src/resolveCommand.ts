import * as path from "path";
import { TestBlock } from "./parser";

/**
 * Resolve options
 * 
 * @export
 * @interface ResolveCommandOptions
 */
export interface ResolveCommandOptions {
    /**
     * Workspace absolute root
     * 
     * @type {string}
     * @memberOf ResolveCommandOptions
     */
    workspaceRoot: string;
    /**
     * Current test file path
     * 
     * @type {string}
     * @memberOf ResolveCommandOptions
     */
    testFilePath: string;
    /**
     * Test/suite name separator.
     * When constructing full test name, the separator will be used between test block
     * 
     * @type {string}
     * @memberOf ResolveCommandOptions
     */
    testNameSeparator: string;
    /**
     * String to use when test/suite block name is undefined
     * 
     * @type {string}
     * @memberOf ResolveCommandOptions
     */
    unknownTestNameLiteral: string;
    /**
     * Matched test block
     * 
     * @type {TestBlock}
     * @memberOf ResolveCommandOptions
     */
    testBlock?: TestBlock;
}

/**
 * Resolve given command and replace template 
 * 
 * @export
 * @param {string} command
 * @param {ResolveCommandOptions} options
 * @returns {string}
 */
export function resolveCommand(command: string, options: ResolveCommandOptions): string {
    const testRelativePath = path.relative(options.workspaceRoot, options.testFilePath);
    // If no test block given then use unknown test name literal
    let fullTestName: string = options.unknownTestNameLiteral;
    let testName = options.unknownTestNameLiteral;
    if (options.testBlock && (options.testBlock.name || options.testBlock.parentBlockNames.length > 0)) {
        const parentBlockNames = options.testBlock.parentBlockNames.map(blockName => blockName || options.unknownTestNameLiteral);
        if (options.testBlock.name) {
            testName = options.testBlock.name;
        }
        fullTestName = [...parentBlockNames, testName].join(options.testNameSeparator);
    }
    return command
        .replace("${workspaceRoot}", options.workspaceRoot)
        .replace("${testFilePath}", options.testFilePath)
        .replace("${relativeTestPath}", testRelativePath)
        .replace("${testName}", testName)
        .replace("${fullTestName}", fullTestName);
}