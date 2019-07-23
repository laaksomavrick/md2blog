import * as filesystem from "./lib/filesystem";
import * as markdown from "./lib/markdown";
import * as templates from "./lib/templates";

// POC
// TODO: prettyUrl
// TODO: figure out seo

const parsedMarkdown = markdown.parseFrom(`${__dirname}/example/markdown`);

const parsedTemplates = templates.parseFrom(`${__dirname}/example/templates`, parsedMarkdown);

filesystem.writeTemplates(__dirname + "/public", parsedTemplates);

filesystem.writeStyles(__dirname + "/public/styles", __dirname + "/example/styles");

process.exit(0);
