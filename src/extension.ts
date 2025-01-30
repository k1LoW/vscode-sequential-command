import * as vscode from 'vscode';

class Controllor {
  private _index: number = 0;
  private _line: number = 0;
  private _character: number = 0;
  private _activeKey: string = '';
  private _defs: any;
  private _timeout: number = 0;
  private _timer: NodeJS.Timeout | null = null;

  public constructor() {
    this.reload();
  }
  get index(): number {
    return this._index;
  }
  get line(): number {
    return this._line;
  }
  get character(): number {
    return this._character;
  }

  private clear() {
    this._index = 0;
    this._line = 0;
    this._character = 0;
    this._activeKey = "";
    if (this._timer) {
      clearTimeout(this._timer);
    }
    this._timer = null;
  }

  public reload() {
    const seqcConfig = vscode.workspace.getConfiguration("sequential-command");
    const timeout = seqcConfig.get("sequenceTimeout");
    if (!timeout) {
      return;
    }
    if (typeof timeout === "number") {
      this._timeout = timeout;
    }
    const defs: any = seqcConfig.get("definitions");
    if (!defs) {
      return;
    }
    this._defs = defs;
  }

  public command(key: string): string {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      this.clear();
      throw new Error("No active editor");
    }
    if (!this._defs[key]) {
      this.clear();
      throw new Error("No definition for key: " + key);
    }
    if (this._activeKey !== key) {
      this.clear();
      this._activeKey = key;
    }
    const commands = this._defs[key];
    if (commands.length < this._index) {
      this.clear();
    }
    if (commands.length === this._index) {
      this._index = 0;
    }
    if (this._index === 0) {
      const selection = editor.selection;
      this._line = selection.active.line;
      this._character = selection.active.character;
    }
    const command = commands[this._index];
    this._index++;
    this._timer = setTimeout(() => {
      this.clear();
    }, this._timeout);
    return command;
  }
}

export function activate(context: vscode.ExtensionContext) {
  const ctrl = new Controllor();

  const keys: string[] = [];
  // A-Z
  for (let i = 65; i <= 90; i++) {
    keys.push(String.fromCharCode(i));
  }

  const cursorReturn = vscode.commands.registerCommand('sequential-command.seqReturn', () => {
    const editor = vscode.window.activeTextEditor;
    const newPosition = new vscode.Position(ctrl.line, ctrl.character);
    const newSelection = new vscode.Selection(newPosition, newPosition);
    if (editor) {
      editor.selection = newSelection;
      editor.revealRange(newSelection);
    }
  });

  context.subscriptions.push(cursorReturn);

  for (const key of keys) {
    const commandId = 'sequential-command.executeDefinedAs' + key;
    const disposable = vscode.commands.registerCommand(commandId, () => {
      try {
        const command = ctrl.command(key);
        vscode.commands.executeCommand(command);
      } catch (e) {
        return;
      }
    });

    context.subscriptions.push(disposable);
  }

  vscode.workspace.onDidChangeConfiguration(event => {
		let affected = event.affectsConfiguration("sequential-command.definitions");
		if (affected) {
			ctrl.reload();
		}
	});
}

export function deactivate() { }
