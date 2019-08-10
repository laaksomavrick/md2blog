import commander from "commander";
import mkdirp from "mkdirp";
import { homedir } from "os";
import path from "path";
import { generate, md, scaffold } from "../actions";
import config from "../config";
import { DEFAULT_DIRECTORY } from "../filesystem";

// TODO: comments
// TODO: tests (given argv, parses args correctly)

export function buildCli(): commander.Command {
    const program = commander;
    program.version("0.1.0");

    program
        .command("generate")
        .description("generate html from given files")
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
        .action(callGenerate);

    program
        .command("scaffold")
        .description("scaffold an example md2blog configuration")
        .action(callScaffold);

    program
        .command("md")
        .description("generate a markdown document at the given file path")
        .option(
            "-m, --markdownPath [markdownPath]",
            "Override the default output directory",
            config.get("markdownPath"),
        )
        .option(
            "-t --templateType [templateType]",
            "Set a template type for the generated markdown file (affects file location and template value)",
        )
        .action(callMd);

    return program;
}

function callGenerate(...args: any[]): void {
    const [cmd] = args;
    // TODO: better type safety
    const toCheck = ["templatesPath", "markdownPath", "stylesPath", "outPath"];

    for (const check of toCheck) {
        const cliOptionValue = cmd[check];
        if (cliOptionValue !== config.get(check)) {
            config.set(check, cliOptionValue);
        }
    }

    const outPath = config.get("outPath");
    const markdownPath = config.get("markdownPath");
    const templatesPath = config.get("templatesPath");
    const stylesPath = config.get("stylesPath");

    generate({ outPath, markdownPath, templatesPath, stylesPath });
}

function callScaffold(): void {
    // Since example is included in the "build" folder, this will work
    const src = path.join(__dirname, "..", "..", "example");
    const dest = path.join(homedir(), DEFAULT_DIRECTORY);
    scaffold(src, dest);
}

// TODO in a bigger project you'd separate actions from their commands
// TODO actually do it for testing purposes
// TODO commands should parse args, call action
function callMd(...args: any[]): void {
    const [cmd] = args;

    let markdownPath = config.get("markdownPath");
    let templateType = "yourtemplate";

    const markdownPathArg = cmd.markdownPath;
    const templateTypeArg = cmd.templateType;

    if (markdownPathArg) {
        markdownPath = markdownPathArg;
    }

    if (templateTypeArg) {
        templateType = templateTypeArg;
        const templateTypeDirectory = `${templateType}s`;
        markdownPath = path.join(markdownPath, templateTypeDirectory);

        mkdirp.sync(markdownPath);
    }

    md({ markdownPath, templateType });
}
