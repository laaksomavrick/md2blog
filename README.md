# md2blog

md2blig is a dead simple blog oriented static site generator, developed out of frustration with complex static site generators which attempt to be everything for everyone. This package is in **beta**, meaning breaking changes may occur until a 1.0.0 release. That being said, I do not expect the functionality for the current cli to change.

## Installation

`npm install -g md2blog`
`yarn install -g md2blog`

## Usage

```
$ md2blog --help

Options:
  -V, --version       output the version number
  -h, --help          output usage information

Commands:
  generate [options]  generate html from given files
  scaffold            scaffold an example md2blog configuration
  md [options]        generate a markdown document at the given file path
```

## Tutorial

Either install the package globally, or use npx to execute it without an installation.

We'll begin by running the scaffolding tool to get us going quickly. This will create `~/.md2blog` where all the files required for the tool will live.

`npx md2blog scaffold`

You should see a directory similar to this:

```
$ tree ~/.md2blog

.md2blog
├── markdown
│   ├── about.md
│   ├── index.md
│   └── posts
│       └── 1565228333616.md
├── public
│   ├── about.html
│   ├── index.html
│   ├── posts
│   │   └── yourtitle.html
│   └── styles
│       └── style.css
├── styles
│   └── style.css
└── templates
    ├── about.ejs
    ├── head.ejs
    ├── index.ejs
    └── posts
        └── post.ejs
```

_markdown_ is where your markdown documents will live, and _templates_ is where our `.ejs` templates will live. The directory structure is important, as it dictates the structure of our blog. Each document must have a _template_, which will correspond to a corrolary template. For example:

```
$ cat ~/.md2blog/markdown/index.md

---
title: index
template: index
timestamp: 1565228265541
require:
  - posts
---

index content
```

```
$ cat ~/.md2blog/templates/index.ejs

<!DOCTYPE html>
<html>
    <%- include('./head.ejs', {title: title, stylepath: "styles/style.css"}); %>
    <body>
        <% if (title) { %>
        <h1>Hello, <%= title %></h1>
        <% } else { %>
        <h1> Hello, world </h1>
        <% } %>

        <% for (const post of required.posts) { %>
        <a href="<%= post.href %>"><%= post.title %></a>
        <% } %>
        <%- content %>
    </body>
</html>%
```

Thus, our index template will have the variables `title`, `template`, `timestamp`, `posts`, and `content` available to it. `posts` is available via the `require` array, which lets us create a list of posts on our blog home page.

Now, lets generate our html. Run the following command:

`md2blog generate`

Observe that our `/public` directory is now populated with the html that compromises our blog:

```
$ tree ~/.md2blog/public

.md2blog/public
├── about.html
├── index.html
├── posts
│   └── yourtitle.html
└── styles
    └── style.css
```

Now, lets add a new post. Run the following command to create a new post in our `/posts` directory:

`md2blog md -t post`

md2blog is smart enough to scaffold a new markdown file for us in the proper template directory when we specify the `-t` option. Not specifying the `-t` option will create a new markdown document in the root of `/markdown`. Running any command with `-h` or `--help` will give a full list of options for that particular command.

You should see a new file in your `/markdown/posts` directory:

```
$ tree ~/.md2blog/markdown/posts

.md2blog/markdown/posts
├── 1565228333616.md
└── 1565456985091.md
```

run `md2blog generate` again to generate html with the newly created post.

From here, you can do whatever you'd like with the `/public` directory to get it onto your site. I host my blog on github pages, and use a simple bash script to copy the files over to my github pages repo:

```
#!/bin/sh
# Warning! This will make changes in your file system.

cp -a ~/.md2blog/public/. ./yoursitedirectory
```