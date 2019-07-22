import ejs from "ejs";
import fs from "fs-extra";
import mkdirp from "mkdirp";
import path from "path";
import * as filesystem from "../filesystem";
import * as markdown from "../markdown";

const EJS_EXT = ".ejs";

interface ITemplatedFile {
    rendered: any;
    subpath: string | null;
    href: string;
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
        const href = md.href;
        const subpath = md.subpath;

        const rendered = templateFn({ title, content, required, href });

        const ret = {
            href,
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

// If something else ever needs this, move to filesystem with it's own type
// Otherwise, leave for now
export function write(dirname: string, templates: ITemplatedFile[]): void {
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
