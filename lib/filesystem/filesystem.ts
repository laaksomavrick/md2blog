import fs from "fs-extra";
import mkdirp from "mkdirp";
import path from "path";
import { ITemplatedFile } from "../templates";

// TODO: comments
// TODO: tests (may not be necessary, fns are simple or used implicitly in other tests)

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

export function writeTemplates(dirname: string, templates: ITemplatedFile[]): void {
    console.log(`Writing html to ${dirname}`);

    fs.removeSync(dirname);
    mkdirp.sync(dirname);

    for (const template of templates) {
        const rendered = template.rendered;
        // TODO: this shouldn't be happening here
        const filename = `${template.href}.html`;
        const subpath = template.subpath;

        if (subpath) {
            mkdirp.sync(`${dirname}/${subpath}`);
        }

        const filepath = path.join(dirname, filename);
        fs.writeFileSync(filepath, rendered);
    }
}

export function upsertDirectory(src: string, dest: string): void {
    console.log(`Upserting ${src} to ${dest}`);
    mkdirp.sync(dest);
    fs.copySync(src, dest);
}

export function upsertFile(outPath: string, file: any): void {
    console.log(`Upserting ${outPath}`);
    fs.writeFileSync(outPath, file);
}

export function directoryExists(directoryPath: string): boolean {
    console.log(`Checking if ${directoryPath} exists`);
    return fs.existsSync(directoryPath);
}
