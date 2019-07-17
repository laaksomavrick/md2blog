import * as markdown from "./lib/markdown";
import * as templates from "./lib/templates";

// POC

const mdTree = markdown.parseTreeFrom(__dirname + "/markdown");

const htmlTree = templates.parseTreeFrom(__dirname + "/templates", mdTree);

// templates.write(__dirname + "/public", htmlTree);

process.exit(0);
