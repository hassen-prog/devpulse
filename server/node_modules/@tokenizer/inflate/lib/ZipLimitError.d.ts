/** Opt-in per-entry ZIP processing limits, in bytes. */
export interface ZipHandlerOptions {
    /** Maximum bytes scanned before a data descriptor, including ignored entries. */
    maxDataDescriptorScanBytes?: number;
    /** Maximum compressed bytes buffered for a selected entry. */
    maxCompressedSize?: number;
    /** Maximum decompressed bytes retained for a selected entry (including stored entries). */
    maxUncompressedSize?: number;
}
/** A configured ZIP processing limit was exceeded. */
export declare class ZipLimitError extends RangeError {
    readonly limit: keyof ZipHandlerOptions;
    readonly requestedSize: number;
    readonly maxSize: number;
    constructor(limit: keyof ZipHandlerOptions, requestedSize: number, maxSize: number);
}
