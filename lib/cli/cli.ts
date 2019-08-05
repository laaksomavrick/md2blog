import { Command } from "commander";
import { config } from "../config";
import { writeStyles, writeTemplates } from "../filesystem";
import { parseMarkdownFrom } from "../markdown";
import { parseTemplatesFrom } from "../templates";

// TODO: comments

export function buildCli(): Command {
    const program = new Command();
    program
        .version("0.1.0")
        .option(
            "-t, --templatesPath <path>",
            "The absolute path to a folder containing .ejs templates",
            config.get("templatesPath"),
        )
        .option(
            "-m, --markdownPath <path>",
            "The absolute path to a folder containing .md documents",
            config.get("markdownPath"),
        )
        .option(
            "-s, --stylesPath [path]",
            "The absolute path to a folder containing stylesheets",
            config.get("stylesPath"),
        )
        .option("-o, --outPath <path>", "The absolute path for program output", config.get("outPath"));
    return program;
}

export function processArgs(cli: Command): void {
    const toCheck = ["templatesPath", "markdownPath", "stylesPath", "outPath"];

    for (const check of toCheck) {
        const cliOptionValue = cli[check];
        if (cliOptionValue !== config.get(check)) {
            config.set(check, cliOptionValue);
        }
    }

    // TODO
    // if .md2blog doesn't exist, create it with some sensible default data
    // writeProgramFolder();

    const parsedMarkdown = parseMarkdownFrom(config.get("markdownPath"));

    const parsedTemplates = parseTemplatesFrom(config.get("templatesPath"), parsedMarkdown);

    writeTemplates(config.get("outPath"), parsedTemplates);

    writeStyles(config.get("stylesPath"), config.get("outPath") + "/styles");
}
