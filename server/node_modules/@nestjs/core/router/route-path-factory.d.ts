import { type RequestMethod, type VersioningOptions } from '@nestjs/common';
import { ApplicationConfig } from '../application-config.js';
import { RoutePathMetadata } from './interfaces/route-path-metadata.interface.js';
import { type RouteInfo, type VersionValue } from '@nestjs/common/internal';
export declare class RoutePathFactory {
    private readonly applicationConfig;
    /**
     * URI version prefixes (`/v1`, or `''` for an unversioned route) under
     * which each global prefix exclusion was matched by a created route.
     */
    private readonly excludedRouteVersionPrefixes;
    constructor(applicationConfig: ApplicationConfig);
    create(metadata: RoutePathMetadata, requestMethod?: RequestMethod): string[];
    getVersion(metadata: RoutePathMetadata): VersionValue | undefined;
    getVersionPrefix(versioningOptions: VersioningOptions): string;
    appendToAllIfDefined(paths: string[], fragmentToAppend: string | string[] | undefined): string[];
    isExcludedFromGlobalPrefix(path: string, requestMethod?: RequestMethod, versionOrVersions?: VersionValue, versioningOptions?: VersioningOptions): boolean;
    /**
     * Returns the global prefix exclusions as the paths routes are actually
     * served at. Under URI versioning an exclusion such as `hello` matches the
     * unversioned path, while the route lives at `/v1/hello`, so every version
     * prefix a matching route was created under is prepended. An exclusion no
     * created route matched (e.g. a raw route registered by a library) is kept
     * as configured.
     */
    getExcludedRoutePaths(): RouteInfo[];
    private trackExcludedRoute;
    private getUriVersionPrefixOfPath;
}
