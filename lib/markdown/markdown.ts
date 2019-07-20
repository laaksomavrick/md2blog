import yaml from "js-yaml";
import showdown from "showdown";
// import * as console from "../console";
import * as filesystem from "../filesystem";

/**
 * The shape of the parsed metadata field of a markdown document.
 * This the yaml between the three hyphens in each document
 */
export interface IParsedMarkdownMetadata {
    // The title of the markdown document
    title: string;

    // The template to use for the markdown file; e.g post -> post.ejs
    template: string;

    // Other parsed markdown document(s) required for the markdown file's corresponding template
    // For example, an index.md may want the index.md's title and content, alongside a list of posts
    // The values in this array should correspond to the parent directory of the items being required
    // E.g require: ['posts']
    require: string[];
}

/**
 * The shape of a parsed markdown document, with additional metadata for use in processing/templating
 */
export interface IParsedMarkdown extends IParsedMarkdownMetadata {
    // The absolute path of the parsed markdown file
    absolutePath: string;

    // The content of the markdown document
    content: string;

    // Whether or not we want to use a pretty url for the document when served/referenced in html
    prettyUrl: boolean;

    // The filename of the parsed markdown file
    fileName: string;

    // The parent directory of the parsed markdown file
    parentDirectoryName: string;

    // The populated require values
    populatedRequire: { [key: string]: any | any[] };

    // The subpath from the markdown root
    subpath: string | null;
}

export function parseFrom(root: string): IParsedMarkdown[] {
    const files = filesystem.readFilesFrom(".md", root, null);

    if (files.length === 0) {
        throw new Error(`No markdown files found in ${root}, exiting...`);
    }

    const parsedFiles = parseMarkdownFiles(files);

    // This is modifying in place
    populateParsedMarkdownRequires(files, parsedFiles);

    return parsedFiles;
}

export function parseMarkdownFiles(files: filesystem.IReadFile[]): IParsedMarkdown[] {
    const converter = new showdown.Converter({ metadata: true });
    return files.map(
        (file: filesystem.IReadFile): IParsedMarkdown => {
            const absolutePath = file.absolutePath;
            const content = converter.makeHtml(file.fileContents);
            const metadataString = converter.getMetadata(true) as string;
            const metadata: IParsedMarkdownMetadata = yaml.safeLoad(metadataString);
            const require = metadata.require;
            const title = metadata.title;
            const template = metadata.template;
            const fileName = file.fileName;
            const prettyUrl = false; // TODO
            const populatedRequire = {};
            const parentDirectoryName = file.parentDirectoryName;
            const subpath = file.subpath;

            return {
                absolutePath,
                content,
                fileName,
                parentDirectoryName,
                populatedRequire,
                prettyUrl,
                require,
                subpath,
                template,
                title,
            };
        },
    );
}

export function populateParsedMarkdownRequires(files: filesystem.IReadFile[], parsedMarkdown: IParsedMarkdown[]): void {
    const memo: any = {};

    for (const parsedFile of parsedMarkdown) {
        if (!parsedFile.require) {
            continue;
        }

        for (const required of parsedFile.require) {
            let match = memo[required];

            if (match) {
                parsedFile.populatedRequire[required] = match;
            } else {
                match = files.filter(file => file.parentDirectoryName === required);
                memo[required] = match;
                parsedFile.populatedRequire[required] = match;
            }
        }
    }
}
