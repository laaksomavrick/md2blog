export function warn(message: string): void {
    console.warn("\x1b[33m%s\x1b[0m", message)
}

export function log(message: string): void {
    console.log("\x1b[36m%s\x1b[0m", message)
}