import * as vscode from 'vscode';

export class TestRunnerViewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): vscode.TreeItem[] {
        let buildButtonComplete = new vscode.TreeItem("Clean, Restore, Rebuild", vscode.TreeItemCollapsibleState.None);
        buildButtonComplete.command = { command: "vstest-runner.buildComplete", title: "Clean, Restore, Rebuild" };

        let cleanButton = new vscode.TreeItem("Clean Solution", vscode.TreeItemCollapsibleState.None);
        cleanButton.command = { command: "vstest-runner.cleanSolution", title: "Clean Solution" };

        let restoreButton = new vscode.TreeItem("Restore Solution", vscode.TreeItemCollapsibleState.None);
        restoreButton.command = { command: "vstest-runner.restoreSolution", title: "Restore Solution" };

        let buildButton = new vscode.TreeItem("Build Solution", vscode.TreeItemCollapsibleState.None);
        buildButton.command = { command: "vstest-runner.buildSolution", title: "Build Solution" };

        let rebuildButton  = new vscode.TreeItem("Rebuild Solution", vscode.TreeItemCollapsibleState.None);
        rebuildButton.command = { command: "vstest-runner.rebuildSolution", title: "Rebuild Solution" };

        let launchButton  = new vscode.TreeItem("Launch on IIS Express", vscode.TreeItemCollapsibleState.None);
        launchButton.command = { command: "vstest-runner.launchOnIssExpress", title: "Launch on IIS Express" };


        return [buildButtonComplete, cleanButton, restoreButton, buildButton, rebuildButton ];

    }
}