import { VERSION_NEUTRAL, VersioningType, flatten, } from '@nestjs/common';
import { isRouteExcluded } from './utils/index.js';
import { addLeadingSlash, isUndefined, stripEndSlash, } from '@nestjs/common/internal';
export class RoutePathFactory {
    applicationConfig;
    /**
     * URI version prefixes (`/v1`, or `''` for an unversioned route) under
     * which each global prefix exclusion was matched by a created route.
     */
    excludedRouteVersionPrefixes = new Map();
    constructor(applicationConfig) {
        this.applicationConfig = applicationConfig;
    }
    create(metadata, requestMethod) {
        let paths = [''];
        const versionOrVersions = this.getVersion(metadata);
        if (versionOrVersions &&
            metadata.versioningOptions?.type === VersioningType.URI) {
            const versionPrefix = this.getVersionPrefix(metadata.versioningOptions);
            if (Array.isArray(versionOrVersions)) {
                paths = flatten(paths.map(path => versionOrVersions.map(version => 
                // Version Neutral - Do not include version in URL
                version === VERSION_NEUTRAL
                    ? path
                    : `${path}/${versionPrefix}${version}`)));
            }
            else {
                // Version Neutral - Do not include version in URL
                if (versionOrVersions !== VERSION_NEUTRAL) {
                    paths = paths.map(path => `${path}/${versionPrefix}${versionOrVersions}`);
                }
            }
        }
        paths = this.appendToAllIfDefined(paths, metadata.modulePath);
        paths = this.appendToAllIfDefined(paths, metadata.ctrlPath);
        paths = this.appendToAllIfDefined(paths, metadata.methodPath);
        if (metadata.globalPrefix) {
            paths = paths.map(path => {
                if (this.isExcludedFromGlobalPrefix(path, requestMethod, versionOrVersions, metadata.versioningOptions)) {
                    this.trackExcludedRoute(path, requestMethod, versionOrVersions, metadata.versioningOptions);
                    return path;
                }
                return stripEndSlash(metadata.globalPrefix || '') + path;
            });
        }
        return paths
            .map(path => addLeadingSlash(path || '/'))
            .map(path => (path !== '/' ? stripEndSlash(path) : path));
    }
    getVersion(metadata) {
        // The version will be either the path version or the controller version,
        // with the pathVersion taking priority.
        return metadata.methodVersion || metadata.controllerVersion;
    }
    getVersionPrefix(versioningOptions) {
        const defaultPrefix = 'v';
        if (versioningOptions.type === VersioningType.URI) {
            if (versioningOptions.prefix === false) {
                return '';
            }
            else if (versioningOptions.prefix !== undefined) {
                return versioningOptions.prefix;
            }
        }
        return defaultPrefix;
    }
    appendToAllIfDefined(paths, fragmentToAppend) {
        if (!fragmentToAppend) {
            return paths;
        }
        const concatPaths = (a, b) => stripEndSlash(a) + addLeadingSlash(b);
        if (Array.isArray(fragmentToAppend)) {
            const paths2dArray = paths.map(path => fragmentToAppend.map(fragment => concatPaths(path, fragment)));
            return flatten(paths2dArray);
        }
        return paths.map(path => concatPaths(path, fragmentToAppend));
    }
    isExcludedFromGlobalPrefix(path, requestMethod, versionOrVersions, versioningOptions) {
        if (isUndefined(requestMethod)) {
            return false;
        }
        const options = this.applicationConfig.getGlobalPrefixOptions();
        const excludedRoutes = options.exclude;
        const versionPrefix = this.getUriVersionPrefixOfPath(path, versionOrVersions, versioningOptions);
        return (Array.isArray(excludedRoutes) &&
            isRouteExcluded(excludedRoutes, path.slice(versionPrefix.length), requestMethod));
    }
    /**
     * Returns the global prefix exclusions as the paths routes are actually
     * served at. Under URI versioning an exclusion such as `hello` matches the
     * unversioned path, while the route lives at `/v1/hello`, so every version
     * prefix a matching route was created under is prepended. An exclusion no
     * created route matched (e.g. a raw route registered by a library) is kept
     * as configured.
     */
    getExcludedRoutePaths() {
        const excludedRoutes = this.applicationConfig.getGlobalPrefixOptions().exclude ?? [];
        return excludedRoutes.flatMap(route => {
            const versionPrefixes = this.excludedRouteVersionPrefixes.get(route) ?? [
                '',
            ];
            return [...versionPrefixes].map(versionPrefix => ({
                path: versionPrefix
                    ? versionPrefix + addLeadingSlash(route.path)
                    : route.path,
                method: route.requestMethod,
            }));
        });
    }
    trackExcludedRoute(path, requestMethod, versionOrVersions, versioningOptions) {
        // `RouterExplorer` creates each path a second time with
        // `versioningOptions: undefined` only to log it; tracking that call
        // would record `hello` next to `/v1/hello`.
        if (!versioningOptions && this.applicationConfig.getVersioning()) {
            return;
        }
        const versionPrefix = this.getUriVersionPrefixOfPath(path, versionOrVersions, versioningOptions);
        const unversionedPath = path.slice(versionPrefix.length);
        const excludedRoutes = this.applicationConfig.getGlobalPrefixOptions().exclude ?? [];
        excludedRoutes
            .filter(route => isRouteExcluded([route], unversionedPath, requestMethod))
            .forEach(route => {
            const versionPrefixes = this.excludedRouteVersionPrefixes.get(route) ?? new Set();
            versionPrefixes.add(versionPrefix);
            this.excludedRouteVersionPrefixes.set(route, versionPrefixes);
        });
    }
    getUriVersionPrefixOfPath(path, versionOrVersions, versioningOptions) {
        if (!versionOrVersions ||
            versionOrVersions === VERSION_NEUTRAL ||
            versioningOptions?.type !== VersioningType.URI) {
            return '';
        }
        const versions = Array.isArray(versionOrVersions)
            ? versionOrVersions
            : [versionOrVersions];
        const versionPrefix = this.getVersionPrefix(versioningOptions);
        for (const version of versions) {
            if (typeof version !== 'string') {
                continue;
            }
            const prefix = `/${versionPrefix}${version}`;
            if (path === prefix || path.startsWith(`${prefix}/`)) {
                return prefix;
            }
        }
        return '';
    }
}
