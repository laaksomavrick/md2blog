import memfs from "memfs";
import * as markdown from "../lib/markdown";

jest.mock("fs", () => {
    return memfs.fs;
});

const MARKDOWN_DIRECTORY = "markdown";

describe("markdown", () => {
    beforeAll(() => {
        // Whitespace is significant
        const markdownDirectory = {
            "./index.md": `
---
title: this is the index
require:
    - posts
---

fdoo bar baz`,

            "./posts/0001-post.md": `
---
title: a post
---

The great aardvark
            `,
        };

        memfs.vol.fromJSON(markdownDirectory, `${__dirname}/${MARKDOWN_DIRECTORY}`);
    });

    it("parses a directory of markdown files", () => {
        const mdTree = markdown.parseTreeFrom(`${__dirname}/${MARKDOWN_DIRECTORY}`);
        expect(mdTree).toBeDefined();

        const index = mdTree["index"] as markdown.ParsedFile;
        expect(index).toBeDefined();
        expect(index).toHaveProperty("metadata");
        expect(index).toHaveProperty("posts");
        expect(index.metadata).toHaveProperty("title");
        expect(index.metadata.title).toEqual("this is the index");

        const requires = index.metadata.require;
        expect(requires).toEqual(["posts"]);

        const posts: markdown.MarkdownTree = mdTree["posts"] as markdown.MarkdownTree;
        expect(posts).toBeDefined();
        expect(posts["0001-post"]).toBeDefined();

        const postsItem = posts["0001-post"] as markdown.ParsedFile;
        expect(postsItem.content).toEqual("<p>The great aardvark</p>");
    });
});
