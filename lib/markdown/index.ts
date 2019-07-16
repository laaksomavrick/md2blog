import fs from "fs";
import path from "path";
import showdown, { Metadata } from "showdown";
import * as console from "../console";

const MARKDOWN_EXT = ".md";
const FILE_ENCODING = "utf8";

export interface ParsedFileMetadata extends Metadata {
    title: string;
}

export interface ParsedFile {
    metadata: ParsedFileMetadata;
    content: string; // HTML string
}

export interface MarkdownTree {
    [key: string]: ParsedFile | MarkdownTree;
}

// TODO: better name
export function parseTreeFrom(dirname: string): MarkdownTree {
    console.log(`Reading markdown files from ${dirname}`);

    let markdownTree: MarkdownTree = {};
    const converter = new showdown.Converter({ metadata: true });
    const filenames = fs.readdirSync(dirname);

    for (const filename of filenames) {
        const filepath = path.join(dirname, filename);
        const isDirectory = fs.existsSync(filepath) && fs.lstatSync(filepath).isDirectory();
        const parsed = path.parse(filepath);
        const ext = parsed.ext;
        const name = parsed.name;

        if (isDirectory) {
            markdownTree[name] = parseTreeFrom(filepath);
        } else {
            if (ext !== MARKDOWN_EXT) {
                console.warn(`${filename} is not a markdown file, skipping.`);
                continue;
            }

            const file = fs.readFileSync(filepath, FILE_ENCODING);

            const content = converter.makeHtml(file);
            const metadata = converter.getMetadata();

            if (!isParsedFileMetadata(metadata)) {
                console.warn(`${filename} is missing required metadata fields, skipping.`);
                continue;
            }

            const parsedFile = { metadata, content };
            markdownTree[name] = parsedFile;
        }
    }

    return markdownTree;
}

export function isParsedFile(markdownTree: ParsedFile | MarkdownTree): markdownTree is ParsedFile {
    return markdownTree.metadata !== undefined;
}

function isParsedFileMetadata(metadata: Metadata | string): metadata is ParsedFileMetadata {
    if (typeof metadata === "string") {
        return false;
    }
    return metadata.title !== undefined;
}

