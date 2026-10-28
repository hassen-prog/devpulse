var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BadGatewayException, BadRequestException, Injectable, NotFoundException, ServiceUnavailableException, } from '@nestjs/common';
let RepositoriesService = class RepositoriesService {
    async analyzeRepository(repositoryUrl) {
        if (!repositoryUrl?.trim()) {
            throw new BadRequestException('Please provide a GitHub repository URL.');
        }
        let parsedUrl;
        try {
            parsedUrl = new URL(repositoryUrl.trim());
        }
        catch {
            throw new BadRequestException('Invalid URL. Use https://github.com/owner/repository.');
        }
        if (parsedUrl.protocol !== 'https:' ||
            parsedUrl.hostname.toLowerCase() !== 'github.com' ||
            parsedUrl.port) {
            throw new BadRequestException('Only HTTPS GitHub repository URLs are supported.');
        }
        const segments = parsedUrl.pathname.split('/').filter(Boolean);
        if (segments.length !== 2) {
            throw new BadRequestException('Please provide a URL in the format https://github.com/owner/repository.');
        }
        const [owner, rawRepository] = segments;
        const repository = rawRepository.replace(/\.git$/i, '');
        const validName = /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/;
        if (!validName.test(owner) || !validName.test(repository)) {
            throw new BadRequestException('The repository owner or name is invalid.');
        }
        const apiUrl = `https://api.github.com/repos/` +
            `${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;
        let response;
        try {
            response = await fetch(apiUrl, {
                headers: {
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2026-03-10',
                    'User-Agent': 'DevPulse',
                },
                signal: AbortSignal.timeout(10000),
            });
        }
        catch {
            throw new ServiceUnavailableException('Unable to reach GitHub. Please try again.');
        }
        if (response.status === 404) {
            throw new NotFoundException('Repository not found. Check the URL and make sure the repository is public.');
        }
        if (response.status === 403 || response.status === 429) {
            throw new ServiceUnavailableException('GitHub API rate limit reached or access restricted. Please try again later.');
        }
        if (!response.ok) {
            throw new BadGatewayException(`GitHub API returned status ${response.status}.`);
        }
        const data = (await response.json());
        const [treeData, contributors, activity] = await Promise.all([
            this.getRepositoryTree(owner, repository, data.default_branch),
            this.getContributors(owner, repository),
            this.getCommitActivity(owner, repository),
        ]);
        const health = this.calculateHealth(treeData);
        return {
            id: data.id,
            name: data.name,
            fullName: data.full_name,
            description: data.description,
            url: data.html_url,
            visibility: data.private ? 'Private' : 'Public',
            isFork: data.fork,
            owner: {
                username: data.owner.login,
                avatarUrl: data.owner.avatar_url,
                url: data.owner.html_url,
            },
            stats: {
                stars: data.stargazers_count,
                forks: data.forks_count,
                watchers: data.watchers_count,
                openIssues: data.open_issues_count,
                sizeKb: data.size,
            },
            language: data.language,
            defaultBranch: data.default_branch,
            topics: data.topics ?? [],
            license: data.license?.name ?? null,
            dates: {
                createdAt: data.created_at,
                updatedAt: data.updated_at,
                pushedAt: data.pushed_at,
            },
            health,
            contributors,
            activity,
        };
    }
    async getRepositoryTree(owner, repository, branch) {
        const treeUrl = `https://api.github.com/repos/` +
            `${encodeURIComponent(owner)}/${encodeURIComponent(repository)}` +
            `/git/trees/${encodeURIComponent(branch)}?recursive=1`;
        let response;
        try {
            response = await fetch(treeUrl, {
                headers: {
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2026-03-10',
                    'User-Agent': 'DevPulse',
                },
                signal: AbortSignal.timeout(10000),
            });
        }
        catch {
            throw new ServiceUnavailableException('Unable to retrieve the repository file tree from GitHub.');
        }
        if (response.status === 404 || response.status === 409) {
            return { tree: [], truncated: false };
        }
        if (response.status === 403 || response.status === 429) {
            throw new ServiceUnavailableException('GitHub API rate limit reached while retrieving repository files.');
        }
        if (!response.ok) {
            throw new BadGatewayException(`GitHub file-tree request failed with status ${response.status}.`);
        }
        return (await response.json());
    }
    async getContributors(owner, repository) {
        const unavailable = (note) => ({
            available: false,
            items: [],
            note,
        });
        const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}` +
            `/${encodeURIComponent(repository)}/contributors?per_page=8`;
        let response;
        try {
            response = await fetch(endpoint, {
                headers: {
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2026-03-10',
                    'User-Agent': 'DevPulse',
                },
                signal: AbortSignal.timeout(10000),
            });
        }
        catch {
            return unavailable('Unable to retrieve contributor information.');
        }
        if (response.status === 204) {
            return {
                available: true,
                items: [],
                note: 'No contributor information is available yet.',
            };
        }
        if (response.status === 403 || response.status === 429) {
            return unavailable('GitHub API rate limit reached while retrieving contributors.');
        }
        if (!response.ok) {
            return unavailable(`GitHub could not retrieve contributors (HTTP ${response.status}).`);
        }
        let payload;
        try {
            payload = await response.json();
        }
        catch {
            return unavailable('GitHub returned invalid contributor data.');
        }
        if (!Array.isArray(payload)) {
            return unavailable('GitHub returned an unexpected contributor response.');
        }
        const items = payload
            .filter((contributor) => typeof contributor.login === 'string' &&
            typeof contributor.contributions === 'number')
            .map((contributor) => ({
            username: contributor.login,
            avatarUrl: contributor.avatar_url,
            url: contributor.html_url,
            contributions: contributor.contributions,
        }));
        return {
            available: true,
            items,
            note: items.length === 0
                ? 'No named contributors were returned.'
                : null,
        };
    }
    async getCommitActivity(owner, repository) {
        const unavailable = (note) => ({
            available: false,
            weeks: [],
            totalCommits: 0,
            note,
        });
        const endpoint = `https://api.github.com/repos/${encodeURIComponent(owner)}` +
            `/${encodeURIComponent(repository)}/stats/commit_activity`;
        let response;
        try {
            response = await fetch(endpoint, {
                headers: {
                    Accept: 'application/vnd.github+json',
                    'X-GitHub-Api-Version': '2026-03-10',
                    'User-Agent': 'DevPulse',
                },
                signal: AbortSignal.timeout(10000),
            });
        }
        catch {
            return unavailable('Unable to retrieve weekly commit activity.');
        }
        if (response.status === 202) {
            return unavailable('GitHub is calculating activity statistics. Try analyzing this repository again shortly.');
        }
        if (response.status === 204) {
            return unavailable('GitHub returned no weekly activity data.');
        }
        if (response.status === 403 || response.status === 429) {
            return unavailable('GitHub API rate limit reached while retrieving activity.');
        }
        if (response.status === 422) {
            return unavailable('GitHub could not provide weekly activity statistics for this repository.');
        }
        if (!response.ok) {
            return unavailable(`GitHub could not retrieve activity (HTTP ${response.status}).`);
        }
        let payload;
        try {
            payload = await response.json();
        }
        catch {
            return unavailable('GitHub returned invalid activity data.');
        }
        if (!Array.isArray(payload)) {
            return unavailable('GitHub returned an unexpected activity response.');
        }
        const weeks = payload
            .map((entry) => ({
            weekStart: new Date(entry.week * 1000).toISOString(),
            commits: entry.total,
        }))
            .sort((a, b) => new Date(a.weekStart).getTime() -
            new Date(b.weekStart).getTime());
        if (weeks.length === 0) {
            return unavailable('No weekly commit activity was returned.');
        }
        return {
            available: true,
            weeks,
            totalCommits: weeks.reduce((total, week) => total + week.commits, 0),
            note: null,
        };
    }
    createCheck(id, label, weight, matchingPath, recommendation) {
        return {
            id,
            label,
            weight,
            passed: Boolean(matchingPath),
            details: matchingPath
                ? `Detected ${matchingPath}.`
                : 'No matching file was detected.',
            recommendation: matchingPath ? null : recommendation,
        };
    }
    calculateHealth(treeData) {
        const paths = (treeData.tree ?? [])
            .filter((entry) => entry.type === 'blob')
            .map((entry) => entry.path);
        const rootFile = (pattern) => paths.find((path) => !path.includes('/') && pattern.test(path));
        const anyFile = (predicate) => paths.find(predicate);
        const readme = rootFile(/^readme(?:\..*)?$/i);
        const license = rootFile(/^(?:license|licence|copying)(?:\..*)?$/i);
        const dockerfile = anyFile((path) => /(?:^|\/)dockerfile(?:\.[^/]+)?$/i.test(path));
        const pipeline = anyFile((path) => {
            const lower = path.toLowerCase();
            return (/^\.github\/workflows\/.+\.ya?ml$/.test(lower) ||
                lower === '.gitlab-ci.yml' ||
                lower === 'jenkinsfile' ||
                lower === '.circleci/config.yml' ||
                /^azure-pipelines\.ya?ml$/.test(lower) ||
                lower === 'bitbucket-pipelines.yml');
        });
        const tests = anyFile((path) => {
            const lower = path.toLowerCase();
            const filename = lower.split('/').pop() ?? '';
            return (/(^|\/)(__tests__|tests?|spec)\/.+/.test(lower) ||
                /\.(test|spec)\.[^/]+$/.test(lower) ||
                /^test_[^/]+\.py$/.test(filename) ||
                /^(jest|vitest)\.config\./.test(filename) ||
                /^(pytest\.ini|tox\.ini)$/.test(filename) ||
                /^(playwright|cypress)\.config\./.test(filename));
        });
        const securityPolicy = anyFile((path) => /^(?:\.github\/|docs\/)?security(?:\.[^/]+)?$/i.test(path));
        const gitignore = rootFile(/^\.gitignore$/i);
        const manifests = new Set([
            'package.json',
            'package-lock.json',
            'pnpm-lock.yaml',
            'yarn.lock',
            'bun.lock',
            'bun.lockb',
            'pyproject.toml',
            'requirements.txt',
            'pipfile',
            'go.mod',
            'cargo.toml',
            'pom.xml',
            'build.gradle',
            'build.gradle.kts',
            'composer.json',
            'gemfile',
        ]);
        const dependencyManifest = anyFile((path) => manifests.has((path.split('/').pop() ?? '').toLowerCase()));
        const composeFile = anyFile((path) => /(?:^|\/)(?:docker-compose|compose)(?:\.[^/.]+)*\.ya?ml$/i.test(path));
        const checks = [
            this.createCheck('readme', 'README documentation', 15, readme, 'Add a README.md explaining the project, setup, usage, and architecture.'),
            this.createCheck('license', 'Open-source license', 10, license, 'Add a LICENSE file if you intend to publish this project for reuse.'),
            this.createCheck('dockerfile', 'Dockerfile', 10, dockerfile, 'Add a Dockerfile to define a reproducible application image.'),
            this.createCheck('ci', 'CI/CD pipeline', 15, pipeline, 'Add an automated pipeline to lint, test, and build the application.'),
            this.createCheck('tests', 'Automated tests', 15, tests, 'Add automated tests and a discoverable test configuration.'),
            this.createCheck('security', 'Security policy', 10, securityPolicy, 'Add SECURITY.md with instructions for reporting vulnerabilities.'),
            this.createCheck('gitignore', '.gitignore', 5, gitignore, 'Add a .gitignore to exclude generated files and local-only artifacts.'),
            this.createCheck('dependencies', 'Dependency manifest', 10, dependencyManifest, 'Add the appropriate dependency manifest for your language or framework.'),
            this.createCheck('compose', 'Docker Compose', 10, composeFile, 'Consider adding Docker Compose for a reproducible multi-service development setup.'),
        ];
        const score = checks.reduce((total, check) => total + (check.passed ? check.weight : 0), 0);
        const grade = score >= 90
            ? 'Excellent'
            : score >= 75
                ? 'Healthy'
                : score >= 50
                    ? 'Needs attention'
                    : 'Critical';
        return {
            score,
            grade,
            checks,
            analyzedFiles: paths.length,
            treeTruncated: treeData.truncated ?? false,
            note: 'This score evaluates detected repository files and configuration only. It is not a code-quality review or a security audit.',
        };
    }
};
RepositoriesService = __decorate([
    Injectable()
], RepositoriesService);
export { RepositoriesService };
//# sourceMappingURL=repositories.service.js.map