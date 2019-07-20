import { stripIndent } from "common-tags";
import memfs from "memfs";
import * as markdown from "./markdown";

// TODO: clean up, test error cases when memfs shenanigans is figured out

jest.mock("fs", () => {
    return memfs.fs;
});

const MARKDOWN_DIRECTORY = "markdown";
const EMPTY_DIRECTORY = "empty";
const NON_MARKDOWN_DIRECTORY = "nonmarkdowndirectory";

describe("markdown", () => {
    beforeAll(() => {
        const markdownDirectory = {
            "./index.md": stripIndent`
                ---
                title: this is the index
                require:
                    - posts
                ---
                fdoo bar baz`,

            "./posts/0001-post.md": stripIndent`
                ---
                title: a post
                ---

                The great aardvark
            `,
        };

        // const emptyDirectory = {};

        // const nonMarkdownDirectory = {
        //     "foo.txt": "blah blah blah"
        // };

        // const filesystem = {
        //     [EMPTY_DIRECTORY]: emptyDirectory,
        //     [MARKDOWN_DIRECTORY]: markdownDirectory,
        //     [NON_MARKDOWN_DIRECTORY]: nonMarkdownDirectory,
        // };

        memfs.vol.fromJSON(markdownDirectory, `${__dirname}/${MARKDOWN_DIRECTORY}`);
        // memfs.vol.fromJSON(emptyDirectory, `${__dirname}/${EMPTY_DIRECTORY}`);
        // memfs.vol.fromJSON(nonMarkdownDirectory, `${__dirname}/${NON_MARKDOWN_DIRECTORY}`);
    });

    describe("parseFrom", () => {

        it("parses a directory of markdown files", () => {
            const md = markdown.parseFrom(`${__dirname}/${MARKDOWN_DIRECTORY}`);
            expect(md).toBeDefined();

            const [index, post] = md;

            expect(index).toBeDefined();
            expect(index.content).toEqual("<p>fdoo bar baz</p>");
            expect(index.title).toEqual("this is the index");
            expect(index.populatedRequire).toHaveProperty("posts");
            expect((index.populatedRequire as any).posts).toHaveLength(1);

            expect(post).toBeDefined();
            expect(post.content).toEqual("<p>The great aardvark</p>");
            expect(post.title).toEqual("a post");
        });

        // it("throws when the directory is empty", () => {
        //     // expect(markdown.parseFrom(`${__dirname}/${EMPTY_DIRECTORY}`)).toThrowError();

        //     const md = markdown.parseFrom(`${__dirname}/${EMPTY_DIRECTORY}`);
        // });

        // it("throws when no markdown documents exist", () => {
        //     expect(markdown.parseFrom(`${__dirname}/${NON_MARKDOWN_DIRECTORY}`)).toThrow();
        // });

        // it("throws when an invalid markdown file is givenm", () => {

        // })

    });

});
