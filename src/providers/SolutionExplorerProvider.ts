import * as vscode from 'vscode';
import { ProjectItem } from '../models/ProjectItem';
import { TestUtils } from './TestUtils';
import { parseCsprojFile, findCsprojFiles } from './FileParser';
import path from 'path';


export class SolutionExplorerProvider implements vscode.TreeDataProvider<ProjectItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ProjectItem | undefined> = new vscode.EventEmitter<ProjectItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<ProjectItem | undefined> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string) { }

    getTreeItem(element: ProjectItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ProjectItem): Promise<ProjectItem[]> {
        if (!element) {
            // Show solution files
            const solutionFiles = await TestUtils.findFilesByExtensions(['sln'], false);
            return solutionFiles.map((file: any) =>
                new ProjectItem(path.basename(file.fsPath), vscode.TreeItemCollapsibleState.Collapsed, 'solution', file.fsPath)
            );
        }

        else if (element.contextValue === 'solution') {

            if (!element.filePath || typeof element.filePath !== 'string') {
                vscode.window.showInformationMessage("Could not find a .sln file. Please check your workspace settings.");
                return [];
            }

            // Locate all .csproj files inside the solution
            const projects = findCsprojFiles(element.filePath);
            return projects.map((proj: any) =>
                new ProjectItem(path.basename(proj), vscode.TreeItemCollapsibleState.Collapsed, 'project', proj)
            );
        }

        else if (element.contextValue === 'project') {
            // Parse the .csproj file to retrieve folder structure
            const { fileTree } = parseCsprojFile(element.filePath);

            const folderNodes: ProjectItem[] = [];
            for (const folder in fileTree) {
                const files = fileTree[folder].map(fileName =>
                    new ProjectItem(fileName, vscode.TreeItemCollapsibleState.None, 'file', path.join(folder, fileName))
                );
                folderNodes.push(new ProjectItem(path.basename(folder), vscode.TreeItemCollapsibleState.Collapsed, 'folder', folder, files));
            }

            return folderNodes;
        }

        else if (element.contextValue === 'folder') {
            return element.children || [];
        }

        return [];
    }
}