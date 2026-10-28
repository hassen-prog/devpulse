/** A configured ZIP processing limit was exceeded. */
export class ZipLimitError extends RangeError {
    constructor(limit, requestedSize, maxSize) {
        super(`ZIP ${limit} exceeded: ${requestedSize} bytes exceeds limit of ${maxSize} bytes`);
        this.limit = limit;
        this.requestedSize = requestedSize;
        this.maxSize = maxSize;
        this.name = 'ZipLimitError';
    }
}
