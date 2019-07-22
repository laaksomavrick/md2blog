import * as markdown from "./lib/markdown";
import * as templates from "./lib/templates";

// POC

const parsedMarkdown = markdown.parseFrom(`${__dirname}/example/markdown`);

const parsedTemplates = templates.parseFrom(`${__dirname}/example/templates`, parsedMarkdown);

templates.write(__dirname + "/public", parsedTemplates);

process.exit(0);
