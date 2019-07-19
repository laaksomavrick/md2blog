import fs from "fs";
import path from "path";

export const FILE_ENCODING = "utf8";

export interface IReadFile {
    // The absolute filepath of the file
    absolutePath: string;

    // Whether the file is a directory or not
    isDirectory: boolean;

    // The file extension of the file
    extension: string;

    // The name of the file
    fileName: string;

    // The file contents
    fileContents: string;

    // The directory name of the file's immediate parent
    parentDirectoryName: string;
}

export function readFilesFrom(dirname: string): IReadFile[] {
    console.log(`Reading markdown files from ${dirname}`);

    const filenames = fs.readdirSync(dirname);

    let files: IReadFile[] = [];

    for (const filename of filenames) {
        const absolutePath = path.join(dirname, filename);
        const isDirectory = fs.existsSync(absolutePath) && fs.lstatSync(absolutePath).isDirectory();

        if (isDirectory) {
            const subdirectoryFiles = readFilesFrom(absolutePath);
            files = [...files, ...subdirectoryFiles];
        } else {
            const fileContents = fs.readFileSync(absolutePath, FILE_ENCODING);
            const parentDirectoryName = path.basename(path.dirname(absolutePath));
            const parsed = path.parse(absolutePath);
            const extension = parsed.ext;
            const fileName = parsed.name;

            const readFile = {
                absolutePath,
                extension,
                fileContents,
                fileName,
                isDirectory,
                parentDirectoryName,
            };

            files.push(readFile);
        }
    }

    return files;
}
