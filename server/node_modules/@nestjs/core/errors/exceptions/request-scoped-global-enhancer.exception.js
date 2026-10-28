import { REQUEST_SCOPED_GLOBAL_ENHANCER_MESSAGE } from '../messages.js';
import { RuntimeException } from './runtime.exception.js';
export class RequestScopedGlobalEnhancerException extends RuntimeException {
    constructor(enhancerToken, provider, kind) {
        super(REQUEST_SCOPED_GLOBAL_ENHANCER_MESSAGE(enhancerToken, provider, kind));
    }
}
