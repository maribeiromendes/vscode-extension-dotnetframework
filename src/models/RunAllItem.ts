import * as vscode from 'vscode';

export class RunAllItem extends vscode.TreeItem {
    constructor(path: string) {
        super(`▶ Run All`, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `Run All Tests`;
        this.contextValue = "summary";
        this.command = {
            command: 'vstest-runner.runAll',
            title: "Run All Tests",
            arguments: [path]
        };
    }
}