import * as vscode from "vscode";
import { cursorStart, cursorEnd, getEnd, escape } from "./utils";
import {
  commands,
  TextEditor,
  Selection,
  TextEditorEdit,
  Range,
  ExtensionContext,
  Disposable,
} from "vscode";

const pasteMultilineString = async (
  editor: TextEditor | undefined
): Promise<void> => {
  if (editor === undefined) {
    return;
  }

  const document = editor.document;

  const start = cursorStart(editor.selection);

  await commands.executeCommand("editor.action.clipboardPasteAction");

  const end = cursorEnd(editor.selection);
  const range: Range = new Range(start, end);

  let replace: string;
  let text = document.getText(range);

  try {
    replace = escape(text);
    if (replace.slice(-3) === '+ "') {
      replace = '"' + replace.slice(0, -3);
    } else {
      throw new Error("no new line");
    }
  } catch (e) {
    replace = text;
    console.log("Error encountered", e);
  }

  if (replace) {
    await editor.edit((edit: TextEditorEdit): void => {
      edit.replace(range, replace);
    });

    const replacementEnd = getEnd(replace, start);

    editor.selection = new Selection(
      start.line,
      start.character,
      replacementEnd.line,
      replacementEnd.character
    );
  }

  await commands.executeCommand("editor.action.formatSelection");
};

export function activate(context: ExtensionContext) {
  console.log("Multi-line string activated");
  const disposables: Disposable[] = [];

  disposables.push(
    commands.registerCommand("multi-line-string.action", (): void => {
      pasteMultilineString(vscode.window.activeTextEditor)
        .then((): void => {
          console.log("multiline string paste");
        })
        .catch((reason): void => {
          console.log(`error in paste: ${reason}`);
        });
    })
  );

  context.subscriptions.concat(disposables);
}

export function deactivate() {}
