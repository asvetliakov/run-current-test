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

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const configuration = vscode.workspace.getConfiguration("runCurrentTest");
    
    const runTestComamnd = (editor: vscode.TextEditor, command: string) => {
        // Do nothing for non real file editor
        if (!editor.document.fileName || !vscode.workspace.rootPath) {
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
            const sourceFile = createSourceFile("test.tsx", editor.document.getText(), ScriptTarget.ES2015, true, ScriptKind.TSX);
            const blocks = getTestBlocks(sourceFile, configuration.get("testBlockIdentifiers", defaultBlockIdentifiers));
            const block = findTestBlockForLineAndCharacter(sourceFile, blocks, editor.selection.active.line, editor.selection.active.character);
            const finalCommand = resolveCommand(runCurrentTestCommand, {
                testBlock: block,
                testFilePath: editor.document.fileName,
                testNameSeparator: configuration.get("testNameSeparator", "\\s"),
                unknownTestNameLiteral: configuration.get("unknownTestNameLiteral", ".*"),
                workspaceRoot: vscode.workspace.rootPath
            });
            
            if (!terminal) {
                terminal = vscode.window.createTerminal("Current test run");
                context.subscriptions.push(terminal);
            }
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
}