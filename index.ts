import { buildCli } from "./lib/cli";

function main(): void {
    const cli = buildCli();
    cli.parse(process.argv);
    process.exit(0);
}

main();
