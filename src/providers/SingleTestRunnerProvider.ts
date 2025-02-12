import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { TestUtils } from "./TestUtils";
import { UITestManagerProvider } from "./UITestManagerProvider";

export class SingleTestRunnerProvider {

    private testName: string;
    private uiTestManagerProvider: UITestManagerProvider;
    private outputChannel: vscode.OutputChannel;  


    constructor(testName: string, uiTestManagerProvider: UITestManagerProvider, outputChannel: vscode.OutputChannel) {
        this.testName = testName;
        this.uiTestManagerProvider = uiTestManagerProvider;     
        this.outputChannel = outputChannel;
    }

    async runTest() {
        const testDllPath = await TestUtils.getDllPath(); // Change dynamically if needed
        if (!testDllPath) {
            throw new Error('Test DLL path not found in config.');
        }
    
        this.outputChannel.show(true);
    
        await new Promise<void>((resolve) => {
            const process = spawn('vstest.console', [testDllPath, `/Tests:${this.testName}`], { shell: true });
    
            process.stdout.on('data', (data) => {
                this.outputChannel.appendLine(data.toString());
            });
    
            process.stderr.on('data', (data) => {
                this.outputChannel.appendLine(`Error: ${data.toString()}`);
            });
    
            process.on('close', (code) => {
                if (code === 0) {
                    this.outputChannel.appendLine(`✅ Test "${this.testName}" PASSED`);
                    this.uiTestManagerProvider.updateTestStatus(this.testName, 'pass'); // ✅ Only updates when test completes
                } else {
                    this.outputChannel.appendLine(`❌ Test "${this.testName}" FAILED`);
                    this.uiTestManagerProvider.updateTestStatus(this.testName, 'fail'); // ✅ Only updates when test completes
                }
                resolve(); // ✅ Ensure the function only finishes AFTER the test runs
            });
        });
    }
}