import * as vscode from 'vscode';
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import * as path from 'path';

export class TestUtils {
    static async getTestMethodsFromFile(filePath: string): Promise<{ name: string; lineNumber: number }[]> {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`❌ Failed to read test file: ${filePath}`, err);
                    return resolve([]);
                }

                const testMethods: { name: string; lineNumber: number }[] = [];

                // ✅ Improved regex to handle line breaks and Windows/Mac/Linux formatting
                const testRegex = /(\[TestMethod\]|\[Fact\]|\[Test\])[\r\n\s]*public\s+(async\s+)?void\s+([A-Za-z0-9_]+)\s*\(/g;

                // ✅ Reset regex state
                testRegex.lastIndex = 0;

                let match;
                while ((match = testRegex.exec(data)) !== null) {
                    const methodName = match[3]; // Extract test method name

                    const lineNumber = data.substring(0, match.index).split(/\r?\n/).length;

                    console.log(`🧪 Found test method: ${methodName} at line ${lineNumber}`);

                    testMethods.push({ name: methodName, lineNumber });
                }

                resolve(testMethods);
            });
        });
    }

    static async getTestFilesFromCsproj(csprojPath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            fs.readFile(csprojPath, 'utf8', async (err, data) => {
                if (err) {
                    console.error('❌ Failed to read .csproj file:', err);
                    vscode.window.showErrorMessage('Failed to read test project.');
                    return resolve([]);
                }

                try {
                    const parsedXml = await xml2js.parseStringPromise(data);
                    const testFiles: string[] = [];

                    const itemGroups = parsedXml?.Project?.ItemGroup || [];
                    for (const group of itemGroups) {
                        const compileItems = group.Compile || [];
                        for (const item of compileItems) {
                            if (item.$ && item.$.Include) {
                                const filePath = path.resolve(path.dirname(csprojPath), item.$.Include);
                                if (filePath.includes('Test') || filePath.includes('Tests')) {
                                    testFiles.push(filePath);
                                }
                            }
                        }
                    }

                    resolve(testFiles);
                } catch (parseError) {
                    vscode.window.showErrorMessage('Failed to parse .csproj file.');
                    console.error(parseError);
                    resolve([]);
                }
            });
        });
    }

    static compareLabels(a: string | vscode.TreeItemLabel | undefined,
        b: string | vscode.TreeItemLabel | undefined,
        order: 'asc' | 'desc' = 'asc'): number {
        const labelA = typeof a === 'string' ? a : a?.label ?? "";
        const labelB = typeof b === 'string' ? b : b?.label ?? "";

        return order === 'asc' ? labelA.localeCompare(labelB) : labelB.localeCompare(labelA);
    }

    static async getDllPath(): Promise<string | null> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open.');
            return null;
        }

        const configPath = path.join(workspaceFolders[0].uri.fsPath, '.vscode', 'config.json');

        try {
            const configFile = await fs.promises.readFile(configPath, 'utf8');
            const config = JSON.parse(configFile);
            return config.testDllPath || null;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to read config file`);
            return null;
        }
    }

    static async getCsprojPath(): Promise<string | null> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open.');
            return null;
        }

        const configPath = path.join(workspaceFolders[0].uri.fsPath, '.vscode', 'config.json');

        try {
            const configFile = await fs.promises.readFile(configPath, 'utf8');
            const config = JSON.parse(configFile);

            if (!config.csprojPath) {
                vscode.window.showErrorMessage('Test project (.csproj) not found.');
                return null;
            }

            return config.csprojPath;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to read config file`);
            return null;
        }
    }

    

    static async findFilesByExtensions(extensions: string[], returnTestsOnly: boolean): Promise<vscode.Uri[]> {
        const globPattern = `**/*.{${extensions.map(ext => ext.replace('.', '')).join(',')}}`;
    
        const files = await vscode.workspace.findFiles(globPattern);
    
        if (returnTestsOnly) {
            const commonTestReferences = [
                'Microsoft.VisualStudio.TestPlatform.TestFramework',  // MSTest
                'xunit',                                              // xUnit
                'nunit.framework'                                     // NUnit
            ];
    
            const testFiles: vscode.Uri[] = [];
    
            for (const fileUri of files) {
                try {
                    const fileContents = Buffer.from((await vscode.workspace.fs.readFile(fileUri))).toString('utf-8');
    
                    if (commonTestReferences.some(ref => fileContents.includes(ref))) {
                        testFiles.push(fileUri);
                    }
                } catch (err) {
                    console.error(`Error reading file ${fileUri.fsPath}:`, err);
                }
            }
    
            return testFiles;
        }
    
        return files;
    }
}