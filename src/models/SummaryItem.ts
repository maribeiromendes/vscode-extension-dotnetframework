import * as vscode from 'vscode';

export class SummaryItem extends vscode.TreeItem {
    constructor(totalTests: number, passingTests: number, failingTests: number) {
        super(`📊 Test Summary: ${passingTests} ✅ | ${failingTests} ❌ | ${totalTests} Total`, vscode.TreeItemCollapsibleState.None);
        this.tooltip = `Total Tests: ${totalTests}\nPassed: ${passingTests}\nFailed: ${failingTests}`;
        this.contextValue = "summary";

        // ✅ Update icon based on test results
        if (failingTests > 0) {
            this.iconPath = new vscode.ThemeIcon('error');
        } else if (passingTests > 0) {
            this.iconPath = new vscode.ThemeIcon('check');
        } else {
            this.iconPath = new vscode.ThemeIcon('beaker');
        }
    }
}