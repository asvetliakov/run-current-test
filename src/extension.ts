import * as vscode from 'vscode';
import { createSourceFile, ScriptTarget, ScriptKind } from "typescript";
import { resolveCommand } from "./resolveCommand";
import { findTestBlockForLineAndCharacter, getTestBlocks } from "./parser";

const defaultBlockIdentifiers = [
    "suite",
    "describe",
    "xdescribe",
    "fdescribe",
    "context",
    "test",
    "it",
    "fit",
    "xit"
]

let terminal: vscode.Terminal | undefined;

function getConfiguration(uri: vscode.Uri): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration("runCurrentTest", uri);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let previousCommand: string | undefined;

    const runTestComamnd = (editor: vscode.TextEditor, command: string) => {
        const document = editor.document;
        const configuration = getConfiguration(document.uri);

        const workspaceFoler = vscode.workspace.getWorkspaceFolder(document.uri);
        // We don't need root for all scenarios, relative paths work too
        const workspaceRoot = workspaceFoler ? workspaceFoler.uri.fsPath || "" : "";

        // Do nothing for non real file editor
        if (!document.fileName) {
            return;
        }

        if (editor.document.isDirty) {
            if (configuration.get("autoSave", true)) {
                editor.document.save();
            } else {
                vscode.window.showInformationMessage("Please save editor first");
                return;
            }
        }

        const runCurrentTestCommand = configuration.get(command, undefined);
        if (!runCurrentTestCommand) {
            vscode.window.showErrorMessage(`Please set runCurrentTest.${command} to your test command first`);
            return;
        }

        try {
            const sourceFile = createSourceFile("test.tsx", document.getText(), ScriptTarget.Latest, true, ScriptKind.TSX);
            const blocks = getTestBlocks(sourceFile, configuration.get("testBlockIdentifiers", defaultBlockIdentifiers));
            const block = findTestBlockForLineAndCharacter(sourceFile, blocks, editor.selection.active.line, editor.selection.active.character);

            let finalCommand = resolveCommand(runCurrentTestCommand, {
                testBlock: block,
                testFilePath: document.fileName,
                testNameSeparator: configuration.get("testNameSeparator", "\\s"),
                unknownTestNameLiteral: configuration.get("unknownTestNameLiteral", ".*"),
                workspaceRoot: workspaceRoot
            });

            const usePreviousCommand = configuration.get("usePreviousTestCommand", true);
            // use previous command if no test blocks found for the file, useful when have opened source & test side-by-side
            if (blocks.length === 0 && previousCommand && usePreviousCommand) {
                finalCommand = previousCommand;
            }

            // store command if has any test blocks
            if (blocks.length > 0) {
                previousCommand = finalCommand;
            }

            // dispose previous terminal instance
            if (terminal) {
                terminal.dispose();
            }

            terminal = vscode.window.createTerminal("Current test run");
            terminal.sendText(finalCommand, true);
            terminal.show(true);
        } catch (e) {
            vscode.window.showErrorMessage("Error parsing test file");
            return;
        }

    }

    const command1 = vscode.commands.registerTextEditorCommand("runCurrentTest.run", editor => {
        runTestComamnd(editor, "run");
    });

    const command2 = vscode.commands.registerTextEditorCommand("runCurrentTest.runAndUpdateSnapshots", editor => {
        runTestComamnd(editor, "runAndUpdateSnapshots");
    });

    context.subscriptions.push(command1);
    context.subscriptions.push(command2);
}

// this method is called when your extension is deactivated
export function deactivate() {
    // not managed by context.subscriptions
    if (terminal) {
        terminal.dispose();
        terminal = undefined;
    }
}