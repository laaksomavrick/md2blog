import fs from "fs-extra";
import mkdirp from "mkdirp";
import { homedir } from "os";
import path from "path";
import { ITemplatedFile } from "../templates";

export const FILE_ENCODING = "utf8";
export const DEFAULT_DIRECTORY = ".md2blog";

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

    // The subpath from the specified root
    subpath: string | undefined;
}

export function readFilesFrom(fileExtension: string, root: string, subpath: string | undefined): IReadFile[] {
    // TODO: graceful failure if folder doesn't exist + test case
    const pathToRead = subpath ? `${root}/${subpath}` : root;
    if (process.env.NODE_ENV !== "test") {
        console.log(`Reading ${fileExtension} files from ${pathToRead}`);
    }

    const filenames = fs.readdirSync(pathToRead);

    let files: IReadFile[] = [];

    for (const filename of filenames) {
        const absolutePath = subpath ? path.join(root, subpath, filename) : path.join(root, filename);
        const isDirectory = fs.existsSync(absolutePath) && fs.lstatSync(absolutePath).isDirectory();

        if (isDirectory) {
            const subDirPath = subpath ? `${subpath}/${path.basename(absolutePath)}` : path.basename(absolutePath);
            const subdirectoryFiles = readFilesFrom(fileExtension, root, subDirPath);
            files = [...files, ...subdirectoryFiles];
        } else {
            const parsed = path.parse(absolutePath);
            const extension = parsed.ext;
            const fileName = parsed.name;

            if (fileExtension && fileExtension !== extension) {
                continue;
            }

            const fileContents = fs.readFileSync(absolutePath, FILE_ENCODING);
            const parentDirectoryName = path.basename(path.dirname(absolutePath));

            const readFile = {
                absolutePath,
                extension,
                fileContents,
                fileName,
                isDirectory,
                parentDirectoryName,
                subpath,
            };

            files.push(readFile);
        }
    }

    return files;
}

// If something else ever needs this, move to filesystem with it's own type
// Otherwise, leave for now
export function writeTemplates(dirname: string, templates: ITemplatedFile[]): void {
    console.log(`Writing html to ${dirname}`);

    fs.removeSync(dirname);
    mkdirp.sync(dirname);

    for (const template of templates) {
        const rendered = template.rendered;
        const href = template.href;
        const subpath = template.subpath;

        if (subpath) {
            mkdirp.sync(`${dirname}/${subpath}`);
        }

        const filepath = path.join(dirname, href);
        fs.writeFileSync(filepath, rendered);
    }
}

export function writeStyles(src: string, dest: string): void {
    // TODO check if exists, err handling, etc
    mkdirp.sync(dest);
    fs.copySync(src, dest);
}

export function writeProgramFolder(): void {
    // Since example is included in the "build" folder, this will work
    const src = path.join(__dirname, "..", "..", "example");
    const dest = path.join(homedir(), DEFAULT_DIRECTORY);
    mkdirp.sync(dest);
    fs.copySync(src, dest);
}
