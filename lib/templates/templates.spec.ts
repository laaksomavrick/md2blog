import { stripIndent } from "common-tags";
import memfs from "memfs";
import { IParsedMarkdown } from "../markdown";
import { ITemplatedFile, parseFrom } from "./templates";

// Mock fs with memfs so our tests don't actually read from disk
jest.mock("fs", () => {
    return memfs.fs;
});

// We don't particularly care to test the ejs library, so we'd like to focus
// our efforts validating that templating properly transforms a set of
// templates and an array of IParsedMarkdown items into an array of ITemplatedFile
describe("templates", () => {
    const TEMPLATE_DIRECTORY = `${__dirname}/TEMPLATES`;

    const TEMPLATES = {
        "./index.ejs": stripIndent`
        <!DOCTYPE html>
        <html>
            <body>
                <h1>Hello, <%= title %></h1>
            </body>
        </html
        `,
        "./posts/post.ejs": stripIndent`
        <!DOCTYPE html>
        <html>
            <body>
                <h1><%= title %></h1>
            </body>
        </html
        `,
    };

    const PARSED_MARKDOWN: IParsedMarkdown[] = [
        {
            absolutePath: "/Users/mlaakso/Code/static-site-generator/lib/markdown/markdown/index.md",
            content: "<p>fdoo bar baz</p>",
            fileName: "index",
            href: "index.html",
            parentDirectoryName: "markdown",
            populatedRequire: {},
            prettyUrl: false,
            require: undefined,
            subpath: undefined,
            template: "index",
            title: "this is the index",
        },
        {
            absolutePath: "/Users/mlaakso/Code/static-site-generator/lib/markdown/markdown/posts/0001-post.md",
            content: "<p>The great aardvark</p>",
            fileName: "0001-post",
            href: "posts/0001-post.html",
            parentDirectoryName: "posts",
            populatedRequire: {},
            prettyUrl: false,
            require: undefined,
            subpath: "posts",
            template: "post",
            title: "a post",
        },
    ];

    let index: ITemplatedFile;
    let post: ITemplatedFile;

    beforeAll(() => {
        memfs.vol.fromJSON(TEMPLATES, TEMPLATE_DIRECTORY);
        [index, post] = parseFrom(TEMPLATE_DIRECTORY, PARSED_MARKDOWN);
    });

    describe("parseFrom", () => {
        it("templates a flat IParsedMarkdown item", () => {
            expect(index).toBeDefined();
        });

        it("templates a nested IParsedMarkdown item", () => {
            expect(post).toBeDefined();
        });

        it("sets rendered when parsing an item", () => {
            expect(index.rendered).toBeDefined();
            expect(post.rendered).toBeDefined();
        });

        it("sets subpath when parsing an item", () => {
            expect(index.subpath).toEqual(undefined);
            expect(post.subpath).toEqual("posts");
        });

        it("sets href when parsing an item", () => {
            expect(index.href).toEqual("index.html");
            expect(post.href).toEqual("posts/0001-post.html");
        });
    });
});
