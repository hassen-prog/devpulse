/**
 * Records that the pipes of `request` rejected it, so its route handler did
 * not run.
 */
export declare function markRejectedByPipes(request: unknown): void;
/**
 * Whether the pipes of `request` rejected it, so its route handler did not
 * run. An interceptor can then release what it prepared for the handler,
 * e.g. the files an upload interceptor stored.
 */
export declare function isRejectedByPipes(request: unknown): boolean;
