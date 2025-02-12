import * as vscode from 'vscode';
import * as path from 'path';
import { TestItem } from '../models/TestItem';
import { TestGroupItem } from '../models/TestGroupItem';
import { FilterItem } from '../models/FilterItem';
import { RunAllItem } from '../models/RunAllItem';
import { TestUtils } from './TestUtils';
import { SummaryItem } from '../models/SummaryItem';


export class UITestManagerProvider implements vscode.TreeDataProvider<TestItem | TestGroupItem | FilterItem | SummaryItem | RunAllItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TestItem | undefined | void> = new vscode.EventEmitter<TestItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<TestItem | undefined | void> = this._onDidChangeTreeData.event;

    private testGroups: Map<string, TestGroupItem> = new Map(); // Stores grouped tests
    private testItems: Map<string, TestItem> = new Map();
    private testFilePaths: Map<string, string> = new Map();

    private filterText: string = "";
    private totalTests = 0;
    private passingTests = 0;
    private failingTests = 0;

    constructor() { }

    getTreeItem(element: TestItem | TestGroupItem | FilterItem | SummaryItem | RunAllItem): vscode.TreeItem {

        if (element instanceof TestItem) {

            // Set the correct icon depending on the test status
            switch (element.getStatus()) {
                case 'pass':
                    element.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'));
                    break;
                case 'fail':
                    element.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
                    break;
                case 'pending':
                    element.iconPath = new vscode.ThemeIcon('loading~spin'); // Animated spinner
                    break;
                default:
                    element.iconPath = new vscode.ThemeIcon('circle-outline'); // Default
            }

        }

        return element;
    }

    getChildren(element?: TestItem | TestGroupItem | FilterItem | SummaryItem | RunAllItem): Thenable<(TestItem | TestGroupItem | FilterItem | SummaryItem | RunAllItem)[]> {
        if (!element) {
            return Promise.resolve([
                new FilterItem(this.filterText, this), // Search bar input
                new SummaryItem(this.totalTests, this.passingTests, this.failingTests),
                new RunAllItem(""),
                ...Array.from(this.testGroups.values()).filter(group =>
                    group.children.some(test => this.getTestLabel(test).toLowerCase().includes(this.filterText.toLowerCase()))
                ).sort((a, b) => TestUtils.compareLabels(a.label, b.label)),
            ]);
        } else if (element instanceof TestGroupItem) {
            return Promise.resolve(
                element.children.filter(test =>
                    this.getTestLabel(test).toLowerCase().includes(this.filterText.toLowerCase())
                ).sort((a, b) => TestUtils.compareLabels(a.label, b.label)),
            );
        }
        return Promise.resolve([]);
    }

    private getTestLabel(test: TestItem): string {
        if (typeof test.label === "string") {
            return test.label;
        } else if (test.label && typeof test.label.label === "string") {
            return test.label.label;
        }
        return ""; // Return empty string if label is missing
    }

    async refresh(testProjectPath: string) {

        const testFiles = await TestUtils.getTestFilesFromCsproj(testProjectPath);

        // Clear old data
        this.testGroups.clear();
        this.testItems.clear();
        this.totalTests = 0;
        this.passingTests = 0;
        this.failingTests = 0;

        for (const filePath of testFiles) {
            const testFile = new TestGroupItem(path.basename(filePath), filePath);
            const testMethods = await TestUtils.getTestMethodsFromFile(filePath);

            for (const testMethod of testMethods) {
                const testItem = new TestItem(testMethod.name, "default", testMethod.lineNumber, filePath);
                testFile.children.push(testItem);
                this.testItems.set(testMethod.name, testItem);
                this.totalTests++;
            }

            this.testGroups.set(filePath, testFile);
        }

        this._onDidChangeTreeData.fire(); // Notify UI to refresh
    }

    updateTestStatus(testName: string, status: 'pass' | 'fail' | 'pending' | 'default') {
        const testItem = this.testItems.get(testName);
        if (testItem) {
            testItem.setStatus(status);

            // ✅ Update test summary counts
            if (status === 'pass') {
                this.passingTests++;
            } else if (status === 'fail') {
                this.failingTests++;
            }

            this._onDidChangeTreeData.fire(testItem); // Refresh only this test
        }
    }

    setFilter(filterText: string) {
        this.filterText = filterText;
        this._onDidChangeTreeData.fire();
    }
}