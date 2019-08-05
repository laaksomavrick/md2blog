import { buildCli, processArgs } from "./lib/cli";

function main(): void {
    const cli = buildCli();
    cli.parse(process.argv);
    processArgs(cli);
    process.exit(0);
}

main();
