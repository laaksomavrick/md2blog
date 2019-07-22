import ejs from "ejs";
import fs from "fs-extra";
import mkdirp from "mkdirp";
import path from "path";
import * as filesystem from "../filesystem";
import * as markdown from "../markdown";

const EJS_EXT = ".ejs";

interface ITemplatedFile {
    fileName: string;
    rendered: any;
    subpath: string | null;
}

interface ITemplateMap {
    [key: string]: ejs.TemplateFunction;
}

export function parseFrom(dirname: string, parsedMarkdown: markdown.IParsedMarkdown[]): ITemplatedFile[] {
    const files = filesystem.readFilesFrom(EJS_EXT, dirname, null);
    const map = getTemplateFiles(files);
    const templated = renderHtmlFrom(map, parsedMarkdown);

    return templated;
}

function renderHtmlFrom(map: ITemplateMap, parsedMarkdown: markdown.IParsedMarkdown[]) {
    const acc: ITemplatedFile[] = [];

    for (const md of parsedMarkdown) {
        const mdTemplate = md.template;
        const templateFn = map[mdTemplate];

        if (!templateFn) {
            console.error(""); // TODO
            continue;
        }

        const title = md.title;
        const content = md.content;
        const required = md.populatedRequire;
        const fileName = md.fileName;
        const subpath = md.subpath;

        const rendered = templateFn({ title, content, required });

        const ret = {
            fileName,
            rendered,
            subpath,
        };

        acc.push(ret);
    }

    return acc;
}

function getTemplateFiles(files: filesystem.IReadFile[]): ITemplateMap {
    const map: ITemplateMap = {};

    for (const file of files) {
        const fileName = file.fileName;
        const fileContents = file.fileContents;
        const template = ejs.compile(fileContents, { filename: file.absolutePath });
        map[fileName] = template;
    }

    return map;
}

export function write(dirname: string, templates: ITemplatedFile[]): void {
    console.log(`Writing html to ${dirname}`);

    fs.removeSync(dirname);
    mkdirp.sync(dirname);

    for (const template of templates) {
        const subpath = template.subpath;
        const fileName = template.fileName;
        const rendered = template.rendered;

        let htmlFilepath;

        if (subpath) {
            const subdirpath = path.join(dirname, subpath);
            mkdirp.sync(subdirpath);
            htmlFilepath = `${subpath}/${fileName}.html`;
        } else {
            htmlFilepath = `${fileName}.html`;
        }

        const filepath = path.join(dirname, htmlFilepath);
        fs.writeFileSync(filepath, rendered);
    }
}
