import * as vscode from 'vscode';
import { TestItem } from './TestItem';

export class TestGroupItem extends vscode.TreeItem {
    public children: TestItem[] = [];

    constructor(label: string, public filePath: string) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.tooltip = `Test Class`;
        this.command = {
            command: 'vstest-runner.openTestFile',
            title: "Open Test File",
            arguments: [filePath]
        };
        this.contextValue = "testFile";
        this.iconPath = new vscode.ThemeIcon('beaker');
    }
}