import showdown, { Metadata } from "showdown";
import fs from 'fs';
import path from "path";
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

export function readFrom(dirname: string): ParsedFile[] {
    console.log(`Reading .md files from ${dirname}`);

    let parsedFiles: ParsedFile[] = [];
    const converter = new showdown.Converter({metadata: true});
    const filenames = fs.readdirSync(dirname);
    
    for (const filename of filenames) {
        const ext = path.parse(filename).ext;
        if (ext !== MARKDOWN_EXT) {
            console.warn(`${filename} is not a markdown file, skipping.`)
            continue;
        }

        const filepath = path.join(dirname, filename);
        const file = fs.readFileSync(filepath, FILE_ENCODING);

        const content = converter.makeHtml(file);
        const metadata = converter.getMetadata();

        if (content == "") {
            console.warn(`${filename} has no content, skipping.`)
            continue;
        }

        if (!isParsedFileMetadata(metadata)) {
            console.warn(`${filename} is missing required metadata fields, skipping.`)
            continue;
        }

        const parsedFile = { metadata, content };
        parsedFiles.push(parsedFile);
    }

    console.log("Done reading files.")

    return parsedFiles;
}

function isParsedFileMetadata(metadata: Metadata | string): metadata is ParsedFileMetadata {
    if (typeof metadata === "string") {
        return false;
    }
    return metadata.title !== undefined;
}