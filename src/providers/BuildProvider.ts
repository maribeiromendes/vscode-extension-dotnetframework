import * as vscode from 'vscode';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import { TestUtils } from "./TestUtils";

const execAsync = promisify(execCb);

export class BuildProvider {
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;

    }

    async buildApp(): Promise<void> {
        
        const filePath = await this.getSolutionFiles();

        this.outputChannel.clear();
        vscode.window.showInformationMessage('Building sln...');

        try {

            await this.restore(filePath);
            await this.clean(filePath);
            await this.rebuild(filePath);

        } catch (error: unknown) {

            vscode.window.showErrorMessage(`Build failed. Please check the output channel for more details.`);
            if (error instanceof Error) {
                this.outputChannel.appendLine(`Error: ${error.message}`);
                this.outputChannel.appendLine(`Stack trace: ${error.stack}`);
            }
        }

        this.outputChannel.show();
    }

    async restore(filePath?: string): Promise<void> {

        if (!filePath) {
            filePath = await this.getSolutionFiles();
        }

        try {

            const restoreApp = `msbuild ${filePath} /t:restore`;
            this.outputChannel.appendLine(`Running ${restoreApp}`);
            const restoreOutput = await execAsync(restoreApp);
            this.outputChannel.appendLine(restoreOutput.stdout);
            this.outputChannel.appendLine(`Restore complete`);
            this.outputChannel.show();

        } catch (error: unknown) {

            vscode.window.showErrorMessage(`Restore failed. Please check the output channel for more details.`);
            if (error instanceof Error) {
                this.outputChannel.appendLine(`Error: ${error.message}`);
                this.outputChannel.appendLine(`Stack trace: ${error.stack}`);
            }
        }
    }

    async rebuild(filePath?: string): Promise<void> {

        if (!filePath) {
            filePath = await this.getSolutionFiles();
        }

        try {

            const rebuildApp = `msbuild /t:Rebuild /p:Configuration=Debug ${filePath}`;
            this.outputChannel.appendLine(`Running ${rebuildApp}`);
            const rebuildOutput = await execAsync(rebuildApp);
            this.outputChannel.appendLine(rebuildOutput.stdout);
            this.outputChannel.appendLine(`Rebuild complete`);
            this.outputChannel.show();

            this.outputChannel.appendLine(`Build process completed successfully.`);

        } catch (error: unknown) {

            vscode.window.showErrorMessage(`Rebuild failed. Please check the output channel for more details.`);
            if (error instanceof Error) {
                this.outputChannel.appendLine(`Error: ${error.message}`);
                this.outputChannel.appendLine(`Stack trace: ${error.stack}`);
            }
        }
    }

    async build(filePath?: string): Promise<void> {

        if (!filePath) {
            filePath = await this.getSolutionFiles();
        }

        try {

            const rebuildApp = `msbuild /t:Build /p:Configuration=Debug ${filePath}`;
            this.outputChannel.appendLine(`Running ${rebuildApp}`);
            const rebuildOutput = await execAsync(rebuildApp);
            this.outputChannel.appendLine(rebuildOutput.stdout);
            this.outputChannel.appendLine(`Rebuild complete`);
            this.outputChannel.show();

            this.outputChannel.appendLine(`Build process completed successfully.`);

        } catch (error: unknown) {

            vscode.window.showErrorMessage(`Build failed. Please check the output channel for more details.`);
            if (error instanceof Error) {
                this.outputChannel.appendLine(`Error: ${error.message}`);
                this.outputChannel.appendLine(`Stack trace: ${error.stack}`);
            }
        }
    }

    async clean(filePath?: string): Promise<void> {

        if (!filePath) {
            filePath = await this.getSolutionFiles();
        }

        try {

            const cleanApp = `msbuild /t:clean /p:Configuration=Debug ${filePath}`;
            this.outputChannel.appendLine(`Running ${cleanApp}`);
            const cleanOutput = await execAsync(cleanApp);
            this.outputChannel.appendLine(cleanOutput.stdout);
            this.outputChannel.appendLine(`Clean complete`);
            this.outputChannel.show();

        } catch (error: unknown) {

            vscode.window.showErrorMessage(`Clean failed. Please check the output channel for more details.`);
            if (error instanceof Error) {
                this.outputChannel.appendLine(`Error: ${error.message}`);
                this.outputChannel.appendLine(`Stack trace: ${error.stack}`);
            }
        }

    }

    private async getSolutionFiles(): Promise<string> {
        const solutionExtension = ["sln"];
        const files = await TestUtils.findFilesByExtensions(solutionExtension, false);
        const filePath = files[0].fsPath;

        if (!filePath) {
            vscode.window.showErrorMessage('No .sln path provided.');
                throw new Error("No solution file found.");
        }

        return filePath;
    }

}