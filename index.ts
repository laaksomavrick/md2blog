import ejs from "ejs";
import fs from "fs";
import mkdirp from "mkdirp";
import showdown, { Metadata } from "showdown";

// POC

const mdConverter = new showdown.Converter({metadata: true});

const mdFile = fs.readFileSync(__dirname + "/markdown/01-tst.md", "utf8");

const mdContent = mdConverter.makeHtml(mdFile);
const mdMetadata = mdConverter.getMetadata()

const file = fs.readFileSync(__dirname + "/templates/index.ejs", "utf8");

const template = ejs.compile(file, {});

const rendered = template({ title: (mdMetadata as Metadata).title, content: mdContent });

mkdirp.sync(__dirname + "/public");

fs.writeFileSync(__dirname + "/public/index.html", rendered);
