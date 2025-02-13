import path from 'path';
import * as vscode from 'vscode';

export class ProjectItem extends vscode.TreeItem {
    constructor(
        public readonly label: string, 
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue: string,
        public readonly filePath: string,
        public readonly children: ProjectItem[] = []
    ) {
        super(label, collapsibleState);
        
        const iconPath = vscode.Uri.file(path.join(__dirname, '..', 'resources'));

        if (contextValue === 'folder') {
            this.iconPath = new vscode.ThemeIcon('folder');
        } else if (contextValue === 'file') {
            this.iconPath = new vscode.ThemeIcon('file-code');
        } else if (contextValue === 'solution') {
            this.iconPath = new vscode.ThemeIcon('notebook');
        } else if (contextValue === 'project') {
            this.iconPath = new vscode.ThemeIcon('project');
        }

        if (contextValue === 'file' && filePath) {
            this.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [vscode.Uri.file(filePath)]
            };
        }
    }
}