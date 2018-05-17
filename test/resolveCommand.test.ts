import * as assert from "assert";
import * as path from "path";
import { resolveCommand, ResolveCommandOptions } from "../src/resolveCommand";

describe("resolveCommand()", () => {
    let options: ResolveCommandOptions;
    beforeEach(() => {
        options = {
            workspaceRoot: "/home/test",
            testFilePath: "/home/test/src/test.tsx",
            testNameSeparator: "\\s",
            unknownTestNameLiteral: ".*",
            unixPaths: false,
            testBlock: {
                name: "test block",
                parentBlockNames: ["describe", "context"],
                endPos: 0,
                startPos: 0
            }
        };
    });
    it("Should resolve command and substitute template literals", () => {
        const expectedRelativePath = path.relative(options.workspaceRoot, options.testFilePath);
        const result = resolveCommand("node ${workspaceRoot}/test ${testFilePath} ${relativeTestPath} \"${testName}\" \"${fullTestName}\"", options);
        assert.equal(result, `node /home/test/test /home/test/src/test.tsx ${expectedRelativePath} "test block" "describe\\scontext\\stest block"`);
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

    it("Should escape test block names", () => {
        options.testBlock = {
            name: "test[] ${name} block()^+?",
            parentBlockNames: ["describe(${name})[]", "context?+"],
            endPos: 0,
            startPos: 0
        };

        const result = resolveCommand("${fullTestName}", options);
        assert.equal(result, "describe\\(\\$\\{name\\}\\)\\[\\]\\scontext\\?\\+\\stest\\[\\] \\$\\{name\\} block\\(\\)\\^\\+\\?");
    });

    it("Should replace test paths with unix separator", () => {
        options.unixPaths = false;
        options.testFilePath = "C:\\home\\test\\src\\test.tsx";
        options.workspaceRoot = "C:\\home\\test";
        let result = resolveCommand("${workspaceRoot} ${testFilePath} ${relativeTestPath}", options);
        assert.equal(result, "C:\\home\\test C:\\home\\test\\src\\test.tsx src\\test.tsx");

        options.unixPaths = true;
        result = resolveCommand("${workspaceRoot} ${testFilePath} ${relativeTestPath}", options);
        assert.equal(result, "C:/home/test C:/home/test/src/test.tsx src/test.tsx");
    })
});