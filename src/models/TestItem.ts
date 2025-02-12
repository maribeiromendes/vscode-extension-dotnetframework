import * as vscode from 'vscode';

export class TestItem extends vscode.TreeItem {
    private status: 'pass' | 'fail' | 'pending' | 'default';

    constructor(label: string, status: 'pass' | 'fail' | 'pending' | 'default', public lineNumber: number, filePath: string) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.status = status;
        this.tooltip = `Test Method`;
        this.contextValue = "testMethod";
        this.command = {
            command: 'vstest-runner.openTestMethod',
            title: "Open Test Method",
            arguments: [this, filePath, label, lineNumber]
        };
        this.updateIcon();
    }

    getStatus() : string {
        return this.status;
    }

    setStatus(status: 'pass' | 'fail' | 'pending' | 'default') {
        this.status = status;
        this.updateIcon();
    }

    private updateIcon() {
        const icons = {
            pending: new vscode.ThemeIcon('loading~spin'),
            pass: new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed')),
            fail: new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed')),
            default: new vscode.ThemeIcon('circle-outline') // ⚙️
        };

        this.iconPath = icons[this.status];
    }
}