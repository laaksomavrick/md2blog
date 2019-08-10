import { stripIndent } from "common-tags";
import path from "path";
import { directoryExists, upsertDirectory, upsertFile, writeTemplates } from "../filesystem";
import { parseMarkdownFrom } from "../markdown";
import { parseTemplatesFrom } from "../templates";

export interface IGenerateArgs {
    outPath: string;
    markdownPath: string;
    templatesPath: string;
    stylesPath: string;
}

export interface IMdArgs {
    markdownPath: string;
    templateType: string;
}

export function generate(args: IGenerateArgs): void {
    const { outPath, markdownPath, templatesPath, stylesPath } = args;
    const stylesOutPath = path.join(outPath, "styles");

    if (!directoryExists(outPath)) {
        throw new Error(`outPath does not exist. Have you tried running md2blog scaffold?`);
    }

    const parsedMarkdown = parseMarkdownFrom(markdownPath);
    const parsedTemplates = parseTemplatesFrom(templatesPath, parsedMarkdown);

    writeTemplates(outPath, parsedTemplates);
    upsertDirectory(stylesPath, stylesOutPath);
}

export function scaffold(src: string, dest: string): void {
    upsertDirectory(src, dest);
    console.log("Finished scaffolding");
}

export function md(args: IMdArgs) {
    const { markdownPath, templateType } = args;

    const timestamp = Date.now();
    const mdTemplate = stripIndent`
        ---
        title: yourtitle
        template: ${templateType}
        timestamp: ${timestamp}
        prettyUrl: true
        ---

        yourcontent
    `;

    const fileOutPath = path.join(markdownPath, `${timestamp}.md`);

    upsertFile(fileOutPath, mdTemplate);
}
