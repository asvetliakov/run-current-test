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
                endPos: 279
            },
            {
                name: "test context",
                parentBlockNames: ["test"],
                startPos: 80,
                endPos: 267
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
                startPos: 290,
                endPos: 314
            },
            {
                name: "desc only",
                parentBlockNames: [],
                startPos: 325,
                endPos: 432
            },
            {
                name: "only context",
                parentBlockNames: ["desc only"],
                startPos: 372,
                endPos: 420
            },
            {
                name: "Without suite",
                parentBlockNames: [],
                startPos: 451,
                endPos: 490
            },
            {
                name: "Inner describe",
                parentBlockNames: [],
                startPos: 582,
                endPos: 748
            },
            {
                name: "test in arrow function",
                parentBlockNames: ["Inner describe"],
                startPos: 666,
                endPos: 722
            },
            {
                name: "ava test",
                parentBlockNames: [],
                startPos: 767,
                endPos: 802
            },
            {
                name: "another ava-like test",
                parentBlockNames: [],
                startPos: 821,
                endPos: 874
            },
            {
                name: "something strange",
                parentBlockNames: [],
                startPos: 893,
                endPos: 942
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
                startPos: 110,
                endPos: 216
            },
            {
                name: undefined,
                parentBlockNames: ["test2"],
                startPos: 148,
                endPos: 204
            },
            {
                name: undefined,
                parentBlockNames: [],
                startPos: 235,
                endPos: 322
            },
            {
                name: undefined,
                parentBlockNames: [undefined],
                startPos: 274,
                endPos: 310
            },
            {
                name: undefined,
                parentBlockNames: [],
                startPos: 341,
                endPos: 365
            },
            {
                name: undefined,
                parentBlockNames: [],
                startPos: 384,
                endPos: 414
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

        result = findTestBlockForLineAndCharacter(file, blocks, 18, 4);
        assert.notEqual(result, undefined);
        assert.equal(result!.name, "suite 2");
    });
});