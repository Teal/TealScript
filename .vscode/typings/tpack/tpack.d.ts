
declare module "tpack" {
    export function task(taskName: string, func: Function): any;
    export function src(...patterns: any[]): any;
    export function createFile(path: any): any;
    export var allowOverwriting: boolean;
}