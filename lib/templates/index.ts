import ejs from "ejs";
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
        const template = ejs.compile(fileContents, {});
        map[fileName] = template;
    }

    return map;
}

// export function write(dirname: string, tree: HtmlTree): void {
//     console.log(`Writing html to ${dirname}`);

//     fs.removeSync(dirname);
//     mkdirp.sync(dirname);

//     for (const [key, value] of Object.entries(tree)) {
//         // if the value of this entry is an object, we need to create a new directory
//         // and write the files of that subtree in that directory
//         if (typeof value === "object") {
//             const subdirname = path.join(dirname, key);
//             write(subdirname, value);
//         } else {
//             const filename = `${key}.html`;
//             const filepath = path.join(dirname, filename);
//             fs.writeFileSync(filepath, value);
//         }
//     }
// }
