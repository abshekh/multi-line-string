import { Selection, Position } from "vscode";

export const cursorStart = (selection: Selection): Position => {
  return selection.anchor.isBefore(selection.active)
    ? selection.anchor
    : selection.active;
};

export const cursorEnd = (selection: Selection): Position => {
  return selection.anchor.isAfter(selection.active)
    ? selection.anchor
    : selection.active;
};

export const getEnd = (appendedText: string, start: Position): Position => {
  if (!appendedText || appendedText.length === 0) {
    return start;
  }

  const lastLine = appendedText.lastIndexOf("\n");

  if (lastLine === -1) {
    return new Position(start.line, start.character + appendedText.length);
  }

  const lines: number = (appendedText.match(/[\n]/g) || []).length;

  return new Position(start.line + lines, appendedText.length - (lastLine + 1));
};

export const escape = (text: string): string => {
  return text.replace(/["\\\n\r]/g, (match: string): string => {
    switch (match) {
      case '"':
        return '\\"';
      case "\\":
        return "\\\\";
      case "\r":
        return "";
      case "\n":
        return '\\n"\r' + '+ "';
      default:
        throw new Error(`Unexpected match '${match}'`);
    }
  });
};