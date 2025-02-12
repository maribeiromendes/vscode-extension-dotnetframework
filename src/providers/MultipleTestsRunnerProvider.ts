import * as vscode from 'vscode';
import { UITestManagerProvider } from './UITestManagerProvider';
import { TestUtils } from './TestUtils';
import { spawn } from 'child_process';

export class MultipleTestsRunnerProvider {

    async runAllTestsInFile(filePath: string, uiTestManagerProvider: UITestManagerProvider) {
        if (!filePath) {
            vscode.window.showErrorMessage("❌ No test file selected.");
            return;
        }
    
        console.log(`🚀 Running all tests in file: ${filePath}`);
    
        // ✅ Retrieve test methods for this file
        const testMethods = await TestUtils.getTestMethodsFromFile(filePath);
        if (testMethods.length === 0) {
            vscode.window.showErrorMessage(`⚠️ No test methods found in file: ${filePath}`);
            return;
        }
    
        const testNames = testMethods.map(method => method.name);
        console.log(`✅ Test Methods Found: ${testNames}`);
    
        // ✅ Run all test methods
        await this.runTestsInFile(filePath, testNames, uiTestManagerProvider);
    }

    private async runTestsInFile(filePath: string, testNames: string[], uiTestManagerProvider: UITestManagerProvider) {
        const testDllPath = await TestUtils.getDllPath();
        if (!testDllPath) {
            throw new Error('Test DLL path not found in config.');
        }
    
        const outputChannel = vscode.window.createOutputChannel('vstest-runner');
        outputChannel.show(true);
    
        console.log(`🚀 Running tests in file: ${filePath}`);
        testNames.forEach(name => uiTestManagerProvider.updateTestStatus(name, 'pending'));
    
        for (const testName of testNames) {
            console.log(`🔄 Running test: ${testName}`);
            uiTestManagerProvider.updateTestStatus(testName, 'pending');
    
            try {
                await this.runSingleTest(testDllPath, testName, uiTestManagerProvider, outputChannel);
            } catch (error) {
                console.error(`❌ Error running test ${testName}:`, error);
                uiTestManagerProvider.updateTestStatus(testName, 'fail');
            }
        }
    }
    
    private async runSingleTest(testDllPath: string, testName: string, uiTestManagerProvider: UITestManagerProvider, outputChannel: vscode.OutputChannel) {
        return new Promise<void>((resolve, reject) => {
            const process = spawn('vstest.console', [testDllPath, `/Tests:${testName}`], { shell: true });
    
            process.stdout.on('data', (data) => {
                outputChannel.appendLine(data.toString());
            });
    
            process.stderr.on('data', (data) => {
                outputChannel.appendLine(`Error: ${data.toString()}`);
            });
    
            process.on('close', (code) => {
                if (code === 0) {
                    outputChannel.appendLine(`✅ Test "${testName}" PASSED`);
                    uiTestManagerProvider.updateTestStatus(testName, 'pass');
                } else {
                    outputChannel.appendLine(`❌ Test "${testName}" FAILED`);
                    uiTestManagerProvider.updateTestStatus(testName, 'fail');
                }
                resolve();
            });
    
            process.on('error', (error) => {
                console.error(`❌ Failed to start process for test: ${testName}`, error);
                reject(error);
            });
        });
    }
}