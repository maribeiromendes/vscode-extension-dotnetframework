import * as vscode from 'vscode';
import { UITestManagerProvider } from '../providers/UITestManagerProvider';

export class FilterItem extends vscode.TreeItem {
    constructor(filterText: string, private provider: UITestManagerProvider) {
        super("🔍 Filter Tests", vscode.TreeItemCollapsibleState.None);
        this.description = filterText || "Type to search...";
        this.command = {
            command: 'vstest-runner.enterFilterText',
            title: "Enter Filter Text",
            arguments: [this]
        };
    }
}