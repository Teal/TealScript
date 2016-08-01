
declare module "tpack" {
    export function task(taskName: string, func: Function): any;
    export function src(...patterns: any[]): any;
    export function createFile(path: any): any;
    export function getFile(path: any): any;
    export function error(message: any): any;
    export var allowOverwriting: boolean;
}