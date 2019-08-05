import commander from "commander";
import { homedir } from "os";
import path from "path";
import { config } from "../config";
import { DEFAULT_DIRECTORY, upsertDirectory, writeTemplates } from "../filesystem";
import { parseMarkdownFrom } from "../markdown";
import { parseTemplatesFrom } from "../templates";

// TODO: comments

export function buildCli(): commander.Command {
    const program = commander;
    program.version("0.1.0");

    program
        .command("generate")
        .description("generate blog from given files")
        .option(
            "-t, --templatesPath [path]",
            "The absolute path to a folder containing .ejs templates",
            config.get("templatesPath"),
        )
        .option(
            "-m, --markdownPath [path]",
            "The absolute path to a folder containing .md documents",
            config.get("markdownPath"),
        )
        .option(
            "-s, --stylesPath [path]",
            "The absolute path to a folder containing stylesheets",
            config.get("stylesPath"),
        )
        .option("-o, --outPath [path]", "The absolute path for program output", config.get("outPath"))
        .action(generate);

    program
        .command("scaffold")
        .description("scaffold an example md2blog configuration")
        .action(scaffold);

    return program;
}

function generate(...args: any[]): void {
    const [arg] = args;
    const toCheck = ["templatesPath", "markdownPath", "stylesPath", "outPath"];

    for (const check of toCheck) {
        const cliOptionValue = arg[check];
        if (cliOptionValue !== config.get(check)) {
            config.set(check, cliOptionValue);
        }
    }

    // TODO
    // if .md2blog doesn't exist, error message specifying to use md2blog generate
    // assuming override = false

    const parsedMarkdown = parseMarkdownFrom(config.get("markdownPath"));
    const parsedTemplates = parseTemplatesFrom(config.get("templatesPath"), parsedMarkdown);

    writeTemplates(config.get("outPath"), parsedTemplates);
    upsertDirectory(config.get("stylesPath"), config.get("outPath") + "/styles");
}

function scaffold(): void {
    // Since example is included in the "build" folder, this will work
    const src = path.join(__dirname, "..", "..", "example");
    const dest = path.join(homedir(), DEFAULT_DIRECTORY);

    upsertDirectory(src, dest);

    console.log("Finished scaffolding an example md2blog configuration");
}
