# vstest-runner README

VSCode extension created to run unit tests from an .NET Framework application using VSCode.

## How to run
- nodejs installed
- run: npm install
- npm run watch
- F5 to build on VS Code

Install it locally:
npm install -g @vscode/vsce
npm run compile
vsce package

code --install-extension your-path\generated-extension.vsix

## Features

- List test files from one specific .dll
- Open test files
- Open methods on test files
- Run all unit tests in a file
- Run one specific unit test
- Clean, build, restore, rebuild solutions

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

You need to add your test .dll to the config.json file and also your .csproj file.
{
  "testDllPath": "",
  "csprojPath" : ""
}

Add this file to your .vscode folder in your workspace.

It is expected also that you have vstest.console, issexpress and msbuild on your env path.

## Known Issues

This extension is in construction. Feel free to work on any improvements or open request for erros.

## Next steps ##
Create a package for the marketplace, but for this we need first finish the following:

- Work in a .NET Framework debugger so we can debug tests.
- Get tests from all tests .dll automatically (so we can skip the config file).
- Launch multiple .csproj with debug.
- Organize the solution files in a structured way.

Other smaller are on the issues list.

**Enjoy!**
