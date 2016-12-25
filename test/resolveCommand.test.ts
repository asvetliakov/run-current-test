import { resolveCommand, ResolveCommandOptions } from "../src/resolveCommand";
import * as assert from "assert";

describe("resolveCommand()", () => {
    let options: ResolveCommandOptions;
    beforeEach(() => {
        options = {
            workspaceRoot: "/home/test",
            testFilePath: "/home/test/src/test.tsx",
            testNameSeparator: "\\s",
            unknownTestNameLiteral: ".*",
            testBlock: {
                name: "test block",
                parentBlockNames: ["describe", "context"],
                endPos: 0,
                startPos: 0
            }
        };
    });
    it("Should resolve command and substitute template literals", () => {
        const result = resolveCommand("node ${workspaceRoot}/test ${testFilePath} ${relativeTestPath} \"${testName}\" \"${fullTestName}\"", options);
        assert.equal(result, "node /home/test/test /home/test/src/test.tsx src/test.tsx \"test block\" \"describe\\scontext\\stest block\"");
    });
    
    it("Should return unknodwnTestName literal as testName or fullTestName if test block is undefined or doesn't have name and any parentBlockNames", () => {
        options.testBlock = undefined;
        let result = resolveCommand("${testName} ${fullTestName}", options);
        assert.equal(result, ".* .*");
        
        options.testBlock = {
            name: undefined,
            parentBlockNames: [],
            endPos: 0,
            startPos: 0
        };

        result = resolveCommand("${testName} ${fullTestName}", options);
        assert.equal(result, ".* .*");
    });
    
    it("Should replace test block name with unknownTestNameLiteral if block name is undefined", () => {
        options.testBlock!.name = undefined;
        let result = resolveCommand("${testName} ${fullTestName}", options);
        assert.equal(result, ".* describe\\scontext\\s.*");
        
        options.testBlock!.name = "test block";
        options.testBlock!.parentBlockNames = ["describe", undefined, "context"];
        result = resolveCommand("${testName} ${fullTestName}", options);
        assert.equal(result, "test block describe\\s.*\\scontext\\stest block");
        
        options.testBlock!.name = undefined;
        result = resolveCommand("${testName} ${fullTestName}", options);
        assert.equal(result, ".* describe\\s.*\\scontext\\s.*");
    });
});