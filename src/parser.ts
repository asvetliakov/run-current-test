import {
    SourceFile,
    Node,
    SyntaxKind,
    forEachChild,
    CallExpression,
    PropertyAccessExpression,
    Identifier,
    StringLiteral,
    getPositionOfLineAndCharacter
} from "typescript";

/**
 * Test or suite block
 * 
 * @export
 * @interface TestBlock
 */
export interface TestBlock {
    /**
     * Test/Suite block name. Will be undefined if couldn't be determined
     * 
     * @type {string}
     * @memberOf TestBlock
     */
    name?: string;
    /**
     * Parent test/suite block names
     * 
     * @type {(Array<string | undefined>)}
     * @memberOf TestBlock
     */
    parentBlockNames: Array<string | undefined>;
    /**
     * Block start position
     * 
     * @type {number}
     * @memberOf TestBlock
     */
    startPos: number;
    /**
     * Block end position
     * 
     * @type {number}
     * @memberOf TestBlock
     */
    endPos: number;
}

/**
 * Return all test blocks matched by given identifiers in file AST
 * 
 * @export
 * @param {SourceFile} source
 * @param {string[]} testBlockIdentifiers
 * @returns {TestBlock[]}
 */
export function getTestBlocks(source: SourceFile, testBlockIdentifiers: string[]): TestBlock[] {
    const firstNode = source.getChildAt(0);
    const blocks: TestBlock[] = [];
    
    const parseNode = (node: Node, parentBlockNames: Array<string | undefined>): void => {
        let nodeIsTestBlock = false;
        let blockName: string | undefined;
        if (node.kind === SyntaxKind.CallExpression && isCallExpressionMatchIdentifiers(node as CallExpression, testBlockIdentifiers)) {
            blockName = getFirstStringLiteralInFunctionArguments(node as CallExpression);
            nodeIsTestBlock = true;
            blocks.push({
                name: blockName,
                parentBlockNames: [...parentBlockNames],
                startPos: node.getStart(),
                endPos: node.getEnd()
            });
        }
        forEachChild(node, child => parseNode(child, nodeIsTestBlock ? [...parentBlockNames, blockName] : parentBlockNames));
    }
    
    firstNode.getChildren().forEach(node => parseNode(node, []));
    return blocks;
}

/**
 * Find the most accurate test block for given line and character or undefined if not found
 * 
 * @export
 * @param {SourceFile} source
 * @param {TestBlock[]} blocks
 * @param {number} line
 * @param {number} character
 * @returns {(TestBlock | undefined)}
 */
export function findTestBlockForLineAndCharacter(source: SourceFile, blocks: TestBlock[], line: number, character: number): TestBlock | undefined {
    const position = getPositionOfLineAndCharacter(source, line, character);
    let findBlock: TestBlock | undefined;
    for (const block of blocks) {
        if (position >= block.startPos && position <= block.endPos) {
            if (!findBlock) {
                // first block we found
                findBlock = block;
            } else if (block.startPos >= findBlock.startPos && block.endPos <= findBlock.endPos) {
                // Block is more accurate that we found previously
                findBlock = block;
            }
        }
    }
    return findBlock;
}

/**
 * Check if call expression matches the given identifiers.
 * If it's property access call expression, like a.b.c() then the function checks the most left identifier in the expression
 * 
 * @param {CallExpression} exp
 * @param {string[]} identifiers
 * @returns {boolean}
 */
function isCallExpressionMatchIdentifiers(exp: CallExpression, identifiers: string[]): boolean {
    if (exp.expression.kind === SyntaxKind.Identifier) {
        // it()/test()/describe()
        return identifiers.indexOf((exp.expression as Identifier).text) !== -1;
    } else if (exp.expression.kind === SyntaxKind.PropertyAccessExpression) {
        // it.only()/describe.skip()/etc...
        const checkPropertyAccess = (exp: PropertyAccessExpression): boolean => {
            if (exp.expression.kind === SyntaxKind.Identifier) {
                // we have only 1 access expression
                return identifiers.indexOf((exp.expression as Identifier).text) !== -1;
            } else if (exp.expression.kind === SyntaxKind.PropertyAccessExpression) {
                // we have more than 1 property access, shouldn't happen with test block though
                return checkPropertyAccess(exp.expression as PropertyAccessExpression);
            } else {
                return false;
            }
        }
        return checkPropertyAccess(exp.expression as PropertyAccessExpression);
    } else {
        return false;
    }
}

/**
 * Return first string literal in function call arguments
 * 
 * @param {CallExpression} node
 * @returns {(string | undefined)}
 */
function getFirstStringLiteralInFunctionArguments(node: CallExpression): string | undefined {
    for (const arg of node.arguments) {
        if (arg.kind === SyntaxKind.StringLiteral || arg.kind === SyntaxKind.NoSubstitutionTemplateLiteral) {
            return (arg as StringLiteral).text;
        }
    }
    return;
}