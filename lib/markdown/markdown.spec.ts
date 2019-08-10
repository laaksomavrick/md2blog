import { stripIndent } from "common-tags";
import memfs from "memfs";
import { parseMarkdownFrom } from "./markdown";

// Mock fs with memfs so our tests don't actually write to disk
jest.mock("fs", () => {
    return memfs.fs;
});

const MARKDOWN_DIRECTORY = "markdown";

describe("markdown", () => {
    afterEach(() => {
        memfs.vol.reset();
    });

    describe("parseMarkdownFrom", () => {
        it("parses a document in a flat directory", () => {
            const markdownDirectory = {
                "./index.md": stripIndent`
                    ---
                    title: this is the index
                    ---
                    fdoo bar baz`,
            };

            memfs.vol.fromJSON(markdownDirectory, `${__dirname}/${MARKDOWN_DIRECTORY}`);
            const md = parseMarkdownFrom(`${__dirname}/${MARKDOWN_DIRECTORY}`);

            expect(md).toBeDefined();
            expect(md.length).toBe(1);
        });

        it("parses a nested directory", () => {
            const markdownDirectory = {
                "./posts/0001-post.md": stripIndent`
                    ---
                    title: a post
                    ---
                    The great aardvark
                `,
            };

            memfs.vol.fromJSON(markdownDirectory, `${__dirname}/${MARKDOWN_DIRECTORY}`);
            const md = parseMarkdownFrom(`${__dirname}/${MARKDOWN_DIRECTORY}`);

            expect(md).toBeDefined();
            expect(md.length).toBe(1);
        });

        it("parses title in a markdown document's metadata", () => {
            const title = "a title";
            const markdownDirectory = {
                "./index.md": stripIndent`
                    ---
                    title: ${title}
                    ---
                `,
            };

            memfs.vol.fromJSON(markdownDirectory, `${__dirname}/${MARKDOWN_DIRECTORY}`);
            const [doc] = parseMarkdownFrom(`${__dirname}/${MARKDOWN_DIRECTORY}`);

            expect(doc.title).toEqual(title);
        });

        it("parses require in a markdown document's metadata", () => {
            const markdownDirectory = {
                "./index.md": stripIndent`
                    ---
                    title: a title
                    require:
                      - posts
                    ---
                `,
                "./posts/0001-post.md": stripIndent`
                    ---
                    title: a post
                    ---
                    The great aardvark
                `,
            };

            memfs.vol.fromJSON(markdownDirectory, `${__dirname}/${MARKDOWN_DIRECTORY}`);
            const [doc] = parseMarkdownFrom(`${__dirname}/${MARKDOWN_DIRECTORY}`);
            const { posts } = doc.populatedRequire;
            const [post] = posts;

            expect(posts.length).toEqual(1);
            expect(post).toBeDefined();
        });

        it("parses prettyUrl in a markdown document's metadata", () => {
            const markdownDirectory = {
                "./index.md": stripIndent`
                    ---
                    title: title
                    prettyUrl: true
                    ---
                `,
            };

            memfs.vol.fromJSON(markdownDirectory, `${__dirname}/${MARKDOWN_DIRECTORY}`);
            const [doc] = parseMarkdownFrom(`${__dirname}/${MARKDOWN_DIRECTORY}`);

            expect(doc.prettyUrl).toEqual(true);
        });

        it("parses template in a markdown document's metadata", () => {
            const template = "post";
            const markdownDirectory = {
                "./index.md": stripIndent`
                    ---
                    title: title
                    template: ${template}
                    ---
                `,
            };

            memfs.vol.fromJSON(markdownDirectory, `${__dirname}/${MARKDOWN_DIRECTORY}`);
            const [doc] = parseMarkdownFrom(`${__dirname}/${MARKDOWN_DIRECTORY}`);

            expect(doc.template).toEqual(template);
        });

        it("parses content in a markdown document", () => {
            const content = "<p>foo bar baz</p>";
            const markdownDirectory = {
                "./index.md": stripIndent`
                    ---
                    title: title
                    ---
                    ${content}
                `,
            };

            memfs.vol.fromJSON(markdownDirectory, `${__dirname}/${MARKDOWN_DIRECTORY}`);
            const [doc] = parseMarkdownFrom(`${__dirname}/${MARKDOWN_DIRECTORY}`);

            expect(doc.content).toEqual(content);
        });

        it("derives the value of href for a nested document", () => {
            const markdownDirectory = {
                "./posts/0001-post.md": stripIndent`
                    ---
                    title: a post
                    ---
                    The great aardvark
                `,
            };

            memfs.vol.fromJSON(markdownDirectory, `${__dirname}/${MARKDOWN_DIRECTORY}`);
            const [doc] = parseMarkdownFrom(`${__dirname}/${MARKDOWN_DIRECTORY}`);

            expect(doc.href).toEqual("posts/0001-post");
        });

        it("derives the value of fileName when prettyUrl is true for a document", () => {
            const markdownDirectory = {
                "./posts/0001-post.md": stripIndent`
                    ---
                    title: a post
                    prettyUrl: true
                    ---
                    The great aardvark
                `,
            };

            memfs.vol.fromJSON(markdownDirectory, `${__dirname}/${MARKDOWN_DIRECTORY}`);
            const [doc] = parseMarkdownFrom(`${__dirname}/${MARKDOWN_DIRECTORY}`);

            expect(doc.fileName).toEqual("a-post");
        });
    });
});
