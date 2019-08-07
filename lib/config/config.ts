import convict from "convict";
import { homedir } from "os";
import path from "path";
import { DEFAULT_DIRECTORY } from "../filesystem";

// TODO: filesystem and cli have a circular import - fix?
// TODO: comments

interface IConfig {
    env: string;
    markdownPath: string;
    outPath: string;
    stylesPath: string;
    templatesPath: string;
}

function defaultPath(subpath: string): string {
    return path.join(homedir(), DEFAULT_DIRECTORY, subpath);
}

export default convict<IConfig>({
    env: {
        default: "development",
        doc: "The application environment.",
        env: "NODE_ENV",
        format: ["production", "development", "test"],
    },
    markdownPath: {
        default: defaultPath("markdown"),
        doc: "The path to a folder containing .md documents",
        env: "MARKDOWN_PATH",
        format: String,
    },
    outPath: {
        default: defaultPath("public"),
        doc: "The path for program output",
        env: "OUT_PATH",
        format: String,
    },
    stylesPath: {
        default: defaultPath("styles"),
        doc: "The path to a folder containing stylesheets",
        env: "STYLES_PATH",
        format: String,
    },
    templatesPath: {
        default: defaultPath("templates"),
        doc: "The path to a folder containing .ejs templates",
        env: "TEMPLATES_PATH",
        format: String,
    },
});
