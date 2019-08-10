#!/usr/bin/env node

import { buildCli } from "./lib/cli";
import config from "./lib/config";

function main(): void {
    try {
        const cli = buildCli();

        cli.parse(process.argv);

        if (cli.args.length === 0) {
            cli.help();
        }

        process.exit(0);
    } catch (e) {
        if (config.get("env") === "development") {
            console.log(e);
        } else {
            console.error(e.message);
        }
    }
}

main();
