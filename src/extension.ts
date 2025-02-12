import * as vscode from 'vscode';
import { UITestManagerProvider } from './providers/UITestManagerProvider';
import { TestUtils } from './providers/TestUtils';
import { BuildProvider } from './providers/BuildProvider';
import { AllTestsRunnerProvider } from './providers/AllTestsRunnerProvider';
import { OpenTestFilesProvider } from './providers/OpenTestFilesProvider';
import { SingleTestRunnerProvider } from './providers/SingleTestRunnerProvider';
import { MultipleTestsRunnerProvider } from './providers/MultipleTestsRunnerProvider';
import { TestRunnerViewProvider } from './providers/TestRunnerViewProvider';

const outputChannel = vscode.window.createOutputChannel('vstest-runner');

/**
 * Activates the extension.
 * @param context - The extension context.
 */
export function activate(context: vscode.ExtensionContext) {
	console.log('Extension is activating...');

	const uiTestManagerProvider = new UITestManagerProvider();
	vscode.window.registerTreeDataProvider('testListView', uiTestManagerProvider);

	const testRunnerViewProvider = new TestRunnerViewProvider();
	vscode.window.registerTreeDataProvider("vstestBuildView", new TestRunnerViewProvider());

	// Cria um botao no status bar
    // (() => {
    //     let statusBarButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    //     statusBarButton.command = "vstest-runner.buildSolution";  // Ensure this command is registered
    //     statusBarButton.text = "$(gear) Build Solution";
    //     statusBarButton.tooltip = "Run MSBuild on the solution";
    //     statusBarButton.show();

    //     context.subscriptions.push(statusBarButton);
    // })();

	// Refreshs the test list when loading the extension
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.refreshTests', async () => {
			outputChannel.show();
			const csprojPath = await TestUtils.getCsprojPath();
			if (!csprojPath) {
				vscode.window.showErrorMessage('Test project (.csproj) not found.');
				return;
			}
	
			await uiTestManagerProvider.refresh(csprojPath);
			vscode.window.showInformationMessage('Unit tests are loaded.');
		})
	);

	// Build the application. Clean, Restore nuget packages and rebuild.
	// Clean and restore is needed due some issues with the build process in VS Code.
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.buildApp', async () => {
			const buildProvider = new BuildProvider(outputChannel);
			await buildProvider.buildApp();
		})
	);

	//Filter the tests by filename or method name. This is used when a user clicks on the "Filter" button.
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.enterFilterText', async () => {
			const searchText = await vscode.window.showInputBox({ prompt: 'Filter tests by name' });
			uiTestManagerProvider.setFilter(searchText || "");
		})
	);

	//Open a file. This is used when a user right-click on a specific file test in the tree view.
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.openTestFile', async (item: any) => {
			const openFile = new OpenTestFilesProvider(item);
			openFile.openTestFile();
		})
	);

	//Open in a specific method in a file. This is used when the user clicks on a specific method test in the tree view.
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.openTestMethod', async (item: any) => {
			const openFile = new OpenTestFilesProvider(item);
			openFile.openTestMethod();
		})
	);

	//Run one test by name. This is used when a user right-click on a specific test in the tree view.
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.runTest', async (item: any) => {
			uiTestManagerProvider.updateTestStatus(item.label, 'pending');
			const runner = new SingleTestRunnerProvider(item.label, uiTestManagerProvider, outputChannel);
			runner.runTest();
		})
	);

	//Run all tests. This is used when a user clicks on the "Run All" button.
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.runAll', () => {
			const runner = new AllTestsRunnerProvider();
			runner.runAllTests(uiTestManagerProvider, outputChannel);
		})
	);

	//Run all tests in a specific file. This is used when a user right-clicks in a specific file in the tree view.
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.runAllTestsInFile', async (item) => {
			const runner = new MultipleTestsRunnerProvider();
			await runner.runAllTestsInFile(item.filePath, uiTestManagerProvider);
		})
	);

	//Debug a specific test method. This is used when a user right-clicks on a specific test in the tree view.
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.debugTestMethod', async (item) => {
			
		})
	);

	//Debug multiple tests. This is used when a user right-clicks on the root node for a project in the tree view.
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.debugTests', async (item) => {
			
		})
	);

	//Debug multiple tests. This is used when a user right-clicks on the file node in the tree view.
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.debugTestFile', async (item) => {
			
		})
	);

	//Build solution
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.buildComplete', async (item) => {
			const buildProvider = new BuildProvider(outputChannel);
			await buildProvider.buildApp();
		})
	);

	//Build solution
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.buildSolution', async (item) => {
			const buildProvider = new BuildProvider(outputChannel);
			await buildProvider.build();
		})
	);

	//Rebuild solution
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.rebuildSolution', async (item) => {
			const buildProvider = new BuildProvider(outputChannel);
			await buildProvider.rebuild();
		})
	);

	//Clean solution
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.cleanSolution', async (item) => {
			const buildProvider = new BuildProvider(outputChannel);
			await buildProvider.clean();
		})
	);

	//Restore solution
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.restoreSolution', async (item) => {
			const buildProvider = new BuildProvider(outputChannel);
			await buildProvider.restore();
		})
	);

	//Restore solution
	context.subscriptions.push(
		vscode.commands.registerCommand('vstest-runner.launchOnIssExpress', async (item) => {
			//TO DO: Launch on ISS Express
		})
	);

	vscode.commands.executeCommand('vstest-runner.refreshTests');
	vscode.commands.executeCommand('testListView.focus');
}

export function deactivate() { }