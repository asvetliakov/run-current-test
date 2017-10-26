import * as assert from 'assert';
import { createSourceFile, SourceFile, SyntaxKind, ScriptTarget } from "typescript";
import { findTestBlockForLineAndCharacter, getTestBlocks } from "../src/parser";

describe("getTestBlocks()", () => {
    it("Should return empty test blocks if file doesn't have matched identifiers", () => {
        const source = `
        describe("daf", () => {

        });
        `;
        const file = createSourceFile("test.ts", source, ScriptTarget.ES2015, true);
        const result = getTestBlocks(file, ["it"]);
        assert.equal(result.length, 0);
    });

    it("Should return test blocks matched to identifiers", () => {
        const source = `
        describe("test", () => {
            beforeEach(() => {});
            context("test context", () => {
                it("test test", () => {});

                shouldNotMatch("should not match" , () => {

                });
            });
        });

        suite("suite", () => {});

        describe.only("desc only", () => {
            describe("only context", () => {

            });
        });

        it("Without suite", () => {

        });

        shouldNotMatch("should not match", () => {

        });

        describe("Inner describe", () => {
            const test = () => {
                it("test in arrow function", () => {

                });
            }
        });

        test("ava test", t => {

        });

        test.only("another ava-like test", t => {

        });

        test.cb.beforeEach("something strange", () => {})
        `
        const file = createSourceFile("test.ts", source, ScriptTarget.ES2015, true);
        const result = getTestBlocks(file, ["describe", "context", "it", "suite", "test"]);
        assert.equal(result.length, 12);
        assert.deepEqual(result, [
            {
                name: "test",
                parentBlockNames: [],
                startPos: 9,
                endPos: 263
            },
            {
                name: "test context",
                parentBlockNames: ["test"],
                startPos: 80,
                endPos: 251
            },
            {
                name: "test test",
                parentBlockNames: ["test", "test context"],
                startPos: 128,
                endPos: 153
            },
            {
                name: "suite",
                parentBlockNames: [],
                startPos: 274,
                endPos: 298
            },
            {
                name: "desc only",
                parentBlockNames: [],
                startPos: 309,
                endPos: 416
            },
            {
                name: "only context",
                parentBlockNames: ["desc only"],
                startPos: 356,
                endPos: 404
            },
            {
                name: "Without suite",
                parentBlockNames: [],
                startPos: 427,
                endPos: 466
            },
            {
                name: "Inner describe",
                parentBlockNames: [],
                startPos: 542,
                endPos: 708
            },
            {
                name: "test in arrow function",
                parentBlockNames: ["Inner describe"],
                startPos: 626,
                endPos: 682
            },
            {
                name: "ava test",
                parentBlockNames: [],
                startPos: 719,
                endPos: 754
            },
            {
                name: "another ava-like test",
                parentBlockNames: [],
                startPos: 765,
                endPos: 818
            },
            {
                name: "something strange",
                parentBlockNames: [],
                startPos: 829,
                endPos: 878
            }
        ]);
    });

    it("Should pass undefined as test block name if coudln't be determined", () => {
        const source = `
        describe("test1", () => {
            it(name, () => {

            });
        });

        describe("test2", () => {
            it(\`interpolated string \${name}\`, () => {
            });
        });

        describe(descName, () => {
            it(testName, () => {

            });
        });

        test(() => {

        });

        test(function () {

        });
        `
        const file = createSourceFile("test.ts", source, ScriptTarget.ES2015, true);
        const result = getTestBlocks(file, ["describe", "context", "it", "suite", "test"]);
        assert.equal(result.length, 8);
        assert.deepEqual(result, [
            {
                name: "test1",
                parentBlockNames: [],
                startPos: 9,
                endPos: 91
            },
            {
                name: undefined,
                parentBlockNames: ["test1"],
                startPos: 47,
                endPos: 79
            },
            {
                name: "test2",
                parentBlockNames: [],
                startPos: 102,
                endPos: 208
            },
            {
                name: undefined,
                parentBlockNames: ["test2"],
                startPos: 140,
                endPos: 196
            },
            {
                name: undefined,
                parentBlockNames: [],
                startPos: 219,
                endPos: 306
            },
            {
                name: undefined,
                parentBlockNames: [undefined],
                startPos: 258,
                endPos: 294
            },
            {
                name: undefined,
                parentBlockNames: [],
                startPos: 317,
                endPos: 341
            },
            {
                name: undefined,
                parentBlockNames: [],
                startPos: 352,
                endPos: 382
            }
        ]);
    });
});

describe("findTestBlockForLineAndCharacter()", () => {
    let file: SourceFile;
    beforeEach(() => {
        const source = `
            describe("suite 1", () => {
                describe("context 1", () => {
                    it("test 1", () => {

                    });

                    it("test 2", () => {

                    });
                });

                describe("context 2", () => {

                });
            });

            describe("suite 2", () => {

            });
        `;

        file = createSourceFile("test.ts", source, ScriptTarget.ES2015, true);
    });

    it("Should return undefined for position not in any test block", () => {
        const blocks = getTestBlocks(file, ["describe", "it"]);
        const result = findTestBlockForLineAndCharacter(file, blocks, 16, 0);
        assert.equal(result, undefined);
    });

    it("Should return test block", () => {
        const blocks = getTestBlocks(file, ["describe", "it"]);
        let result = findTestBlockForLineAndCharacter(file, blocks, 4, 0);
        assert.notEqual(result, undefined);
        assert.equal(result!.name, "test 1");

        result = findTestBlockForLineAndCharacter(file, blocks, 5, 0);
        assert.notEqual(result, undefined);
        assert.equal(result!.name, "test 1");

        result = findTestBlockForLineAndCharacter(file, blocks, 6, 0);
        assert.notEqual(result, undefined);
        assert.equal(result!.name, "context 1");

        result = findTestBlockForLineAndCharacter(file, blocks, 11, 0);
        assert.notEqual(result, undefined);
        assert.equal(result!.name, "suite 1");

        result = findTestBlockForLineAndCharacter(file, blocks, 19, 4);
        assert.notEqual(result, undefined);
        assert.equal(result!.name, "suite 2");
    });
});