import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import showdown from "showdown";
import * as console from "../console";

const MARKDOWN_EXT = ".md";
const FILE_ENCODING = "utf8";

export interface ParsedFileMetadata {
    title: string;
    require: string[];
}

export interface ParsedFile {
    metadata: ParsedFileMetadata;
    content: string; // HTML string
    required?: { [key: string]: any }; // Populated values from the metadata.require array
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
            const metadataString = converter.getMetadata(true) as string;
            const metadata: ParsedFileMetadata = yaml.safeLoad(metadataString);

            if (!isParsedFileMetadata(metadata)) {
                console.warn(`${filename} is missing required metadata fields, skipping.`);
                continue;
            }

            const parsedFile = { metadata, content };
            markdownTree[name] = parsedFile;
        }
    }

    // We can only populate the required fields once the tree is done being parsed,
    // otherwise a required field may not be present yet
    // TODO: clean up
    for (const [key, value] of Object.entries(markdownTree)) {
        const metadata = value.metadata;
        if (isParsedFileMetadata(metadata)) {
            const require = metadata.require;
            if (require) {
                for (const required of metadata.require) {
                    // Will only work with one level on nesting
                    const populated = { ...value, [required]: markdownTree[required] };
                    markdownTree[key] = populated;
                }
            }
        }
    }

    return markdownTree;
}

export function isParsedFile(markdownTree: ParsedFile | MarkdownTree): markdownTree is ParsedFile {
    return markdownTree.metadata !== undefined;
}

function isParsedFileMetadata(metadata: any): metadata is ParsedFileMetadata {
    if (!metadata) {
        return false;
    } else if (typeof metadata === "string") {
        return false;
    }
    return metadata.title !== undefined;
}
