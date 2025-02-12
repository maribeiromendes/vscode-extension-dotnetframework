import * as vscode from 'vscode';
import { TestUtils } from "./TestUtils";
import { UITestManagerProvider } from "./UITestManagerProvider";
import { spawn } from 'child_process';

export class AllTestsRunnerProvider {
 
    async runAllTests(uiTestManagerProvider: UITestManagerProvider, outputChannel : vscode.OutputChannel) {
        const testDllPath = await TestUtils.getDllPath();
        if (!testDllPath) {
            throw new Error('Test DLL path not found in config.');
        }
    
        outputChannel.show(true);
    
        try {
            await runAll(testDllPath, uiTestManagerProvider, outputChannel);
        } catch (error) {
            console.error(`❌ Error running tests:`, error);
        }
    }
    
}

async function runAll(testDllPath: string, uiTestManagerProvider: UITestManagerProvider, outputChannel: vscode.OutputChannel) {
    return new Promise<void>((resolve, reject) => {
        const process = spawn('vstest.console', [testDllPath], { shell: true });
    });
}