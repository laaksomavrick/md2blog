import ejs from "ejs";
import fs from "fs-extra";
import mkdirp from "mkdirp";
import path from "path";
import * as console from "../console";
import * as markdown from "../markdown";

const EJS_EXT = ".ejs";
const FILE_ENCODING = "utf8";

export interface HtmlTree {
    [key: string]: string | HtmlTree;
}

// TODO: refactor common structure with other readFrom
// TODO: clean up post test writing, this is convoluted right now
export function parseTreeFrom(
    dirname: string,
    markdownTree: markdown.MarkdownTree,
    nameOverride: string | undefined = undefined,
): HtmlTree {
    if (nameOverride) {
        console.log(`Reading ${nameOverride} from ${dirname}`);
    } else {
        console.log(`Reading template files from ${dirname}`);
    }

    let htmlTree: HtmlTree = {};
    const filenames = fs.readdirSync(dirname);

    for (const filename of filenames) {
        const filepath = path.join(dirname, filename);
        const isDirectory = fs.existsSync(filepath) && fs.lstatSync(filepath).isDirectory();
        const parsed = path.parse(filepath);
        const ext = parsed.ext;
        const name = nameOverride ? nameOverride : parsed.name;

        if (isDirectory) {
            const subTree = markdownTree[name] as markdown.MarkdownTree;
            const subTreeNames = Object.keys(subTree);

            for (const subTreeName of subTreeNames) {
                htmlTree[name] = htmlTree[name] ? htmlTree[name] : {};

                const subHtmlTree: HtmlTree = htmlTree[name] as HtmlTree;
                const subTreeRenderedItem = parseTreeFrom(filepath, subTree, subTreeName);

                htmlTree[name] = { ...subHtmlTree, ...subTreeRenderedItem };
            }
        } else {
            if (ext !== EJS_EXT) {
                console.warn(`${filename} is not a .ejs file, skipping.`);
                continue;
            }

            const file = fs.readFileSync(filepath, FILE_ENCODING);

            const template = ejs.compile(file, {});
            const data = markdownTree[name];
            const rendered = template(data);

            htmlTree[name] = rendered;
        }
    }

    return htmlTree;
}

export function write(dirname: string, tree: HtmlTree): void {
    console.log(`Writing html to ${dirname}`);

    fs.removeSync(dirname);
    mkdirp.sync(dirname)

    for (const [key, value] of Object.entries(tree)) {
        // if the value of this entry is an object, we need to create a new directory
        // and write the files of that subtree in that directory
        if (typeof value === "object") {
            const subdirname = path.join(dirname, key);
            write(subdirname, value);
        } else {
           const filename = `${key}.html`;
           const filepath = path.join(dirname, filename);
           fs.writeFileSync(filepath, value);
        }
    }
}
