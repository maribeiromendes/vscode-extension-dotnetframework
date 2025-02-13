import * as fs from 'fs';
import * as path from 'path';
import { XMLParser } from 'fast-xml-parser';

export function parseSolutionFile(solutionPath: string): string[] {
    const content = fs.readFileSync(solutionPath, 'utf-8');
    const projectPaths: string[] = [];

    const projectRegex = /Project\("\{[^}]+\}"\)\s=\s"([^"]+)",\s"([^"]+)",\s"\{[^}]+\}"/g;
    let match;

    while ((match = projectRegex.exec(content)) !== null) {
        projectPaths.push(match[2]); // Extracts the project file path
    }

    return projectPaths;
}


export function parseCsprojFile(csprojPath: string): { fileTree: Record<string, string[]> } {
    if (!fs.existsSync(csprojPath)) return { fileTree: {} };

    const content = fs.readFileSync(csprojPath, 'utf-8');
    const parser = new XMLParser({ ignoreAttributes: false });
    const xmlObj = parser.parse(content);

    const fileTree: Record<string, string[]> = {};
    const projectRoot = path.dirname(csprojPath); // Ensure it's a valid directory

    if (xmlObj.Project && xmlObj.Project.ItemGroup) {
        const itemGroups = Array.isArray(xmlObj.Project.ItemGroup) ? xmlObj.Project.ItemGroup : [xmlObj.Project.ItemGroup];

        itemGroups.forEach((group: any) => {
            if (group.Compile) {
                const compileItems = Array.isArray(group.Compile) ? group.Compile : [group.Compile];
                compileItems.forEach((file: any) => {
                    let relativeFilePath = file['@_Include'];

                     // Fix: Ensure relativeFilePath is not absolute to avoid double drive letters
                     let absolutePath = path.isAbsolute(relativeFilePath) 
                     ? relativeFilePath 
                     : path.resolve(projectRoot, relativeFilePath);
                    
                    // Normalize the folder path
                    let folderPath = path.dirname(absolutePath).replace(/\\/g, '/'); 
                    let fileName = path.basename(absolutePath);

                    if (!fileTree[folderPath]) {
                        fileTree[folderPath] = [];
                    }
                    fileTree[folderPath].push(fileName);
                });
            }
        });
    }

    return { fileTree };
}


export function findCsprojFiles(solutionPath: string): string[] {
    const solutionDir = path.dirname(solutionPath);
    let projectFiles: string[] = [];

    function findFiles(dir: string) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.resolve(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                findFiles(fullPath);
            } else if (file.endsWith('.csproj')) {
                projectFiles.push(fullPath);
            }
        }
    }

    findFiles(solutionDir);
    return projectFiles;
}
