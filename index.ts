import ejs from "ejs";
import fs from "fs";
import mkdirp from "mkdirp";
import showdown, { Metadata } from "showdown";
import * as markdown from "./lib/markdown";
import * as templates from "./lib/templates";

// POC

const mdTree = markdown.parseTreeFrom(__dirname + "/markdown");

console.log(mdTree);

const htmlTree = templates.parseTreeFrom(__dirname + "/templates", mdTree);

console.log(htmlTree);

process.exit(0);


// /templates
//    /posts
//      post.html     <-- single view, we know we need one posts
//      posts.html    <-- list view, we know we need all posts
// about.html         <-- single view, we know we need about
// index.html         <-- entry point, gets nothing, includes things it needs (e.g posts.html)

// const mdConverter = new showdown.Converter({metadata: true});

// const mdFile = fs.readFileSync(__dirname + "/markdown/01-tst.md", "utf8");

// const mdContent = mdConverter.makeHtml(mdFile);
// const mdMetadata = mdConverter.getMetadata()

// Read and compile all .ejs files

// How to know which files are a list (e.g when to render with particular values)

// All files in /markdown are a blog post

// const file = fs.readFileSync(__dirname + "/templates/index.ejs", "utf8");

// const template = ejs.compile(file, {});

// const rendered = template({ title: (mdMetadata as Metadata).title, content: mdContent });

// mkdirp.sync(__dirname + "/public");

// fs.writeFileSync(__dirname + "/public/index.html", rendered);
