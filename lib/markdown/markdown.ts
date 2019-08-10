import yaml from "js-yaml";
import showdown from "showdown";
// import * as console from "../console";
import { IReadFile, readFilesFrom } from "../filesystem";

/**
 * The shape of the parsed metadata field of a markdown document.
 * This the yaml between the three hyphens in each document
 */
export interface IParsedMarkdownMetadata {
    // The title of the markdown document
    title: string;

    // The template to use for the markdown file; e.g post -> post.ejs
    // TODO: this must be a string
    template: string | undefined;

    // Other parsed markdown document(s) required for the markdown file's corresponding template
    // For example, an index.md may want the index.md's title and content, alongside a list of posts
    // The values in this array should correspond to the parent directory of the items being required
    // E.g require: ['posts']
    require: string[] | undefined;

    // Whether or not we want to use a pretty url for the document when served/referenced in html
    prettyUrl: boolean;

    // The unix timestamp for the markdown file.
    timestamp: number | undefined;
}

/**
 * The shape of a parsed markdown document, with additional metadata for use in processing/templating
 */
export interface IParsedMarkdown extends IParsedMarkdownMetadata {
    // The absolute path of the parsed markdown file
    absolutePath: string;

    // The content of the markdown document
    content: string;

    // String for use in href tags to direct to this particular document
    href: string;

    // The filename of the parsed markdown file
    fileName: string;

    // The parent directory of the parsed markdown file
    parentDirectoryName: string;

    // The populated require values
    populatedRequire: { [key: string]: any | any[] };

    // The subpath from the markdown root
    subpath: string | undefined;
}

/**
 * Parses all markdown files from the given filepath, transforming them into
 * IParsedMarkdown entries of an array and returning it. This function can throw
 * when no files are found, or if something unexpected goes wrong (e.g NPE).
 */
export function parseMarkdownFrom(root: string): IParsedMarkdown[] {
    const files = readFilesFrom(".md", root, undefined);

    if (files.length === 0) {
        throw new Error(`No markdown files found in ${root}, exiting...`);
    }

    const parsedFiles = parseMarkdownFiles(files);

    const populatedParsedFiles = populateParsedMarkdownRequires(parsedFiles);

    return populatedParsedFiles;
}

function parseMarkdownFiles(files: IReadFile[]): IParsedMarkdown[] {
    const converter = new showdown.Converter({ metadata: true });

    return files.map(
        (file: IReadFile): IParsedMarkdown => {
            const content = converter.makeHtml(file.fileContents);
            const metadataString = converter.getMetadata(true) as string;

            const metadata: IParsedMarkdownMetadata = yaml.safeLoad(metadataString);
            const require = metadata.require;
            const title = metadata.title;
            const template = metadata.template;
            const prettyUrl = metadata.prettyUrl || false;
            const timestamp = metadata.timestamp || undefined;

            const absolutePath = file.absolutePath;
            const fileName = prettyUrl ? metadata.title.split(" ").join("-") : file.fileName;
            const populatedRequire = {};
            const parentDirectoryName = file.parentDirectoryName;
            const subpath = file.subpath;
            const href = subpath ? `${subpath}/${fileName}.html` : `${fileName}.html`;

            return {
                absolutePath,
                content,
                fileName,
                href,
                parentDirectoryName,
                populatedRequire,
                prettyUrl,
                require,
                subpath,
                template,
                timestamp,
                title,
            };
        },
    );
}

function populateParsedMarkdownRequires(parsedMarkdown: IParsedMarkdown[]): IParsedMarkdown[] {
    // Lets only bother finding things once
    const memo: any = {};

    return parsedMarkdown.map((parsedFile: IParsedMarkdown) => {
        if (!parsedFile.require) {
            return parsedFile;
        }

        for (const required of parsedFile.require) {
            let match = memo[required];

            if (match) {
                parsedFile.populatedRequire[required] = match;
            } else {
                match = parsedMarkdown.filter(md => md.parentDirectoryName === required);
                memo[required] = match;
                parsedFile.populatedRequire[required] = match;
            }
        }

        return parsedFile;
    });
}
