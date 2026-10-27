
import { BadRequestException } from '@nestjs/common';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { RepositoriesService } from './repositories.service.js';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

describe('RepositoriesService', () => {
  let service: RepositoriesService;

  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    service = new RepositoriesService();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects URLs that do not belong to GitHub', async () => {
    await expect(
      service.analyzeRepository(
        'https://example.com/octocat/demo',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects invalid repository URL formats', async () => {
    await expect(
      service.analyzeRepository('not-a-valid-url'),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns repository data, activity, contributors, and health score', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);

      if (url.includes('/git/trees/')) {
        return jsonResponse({
          tree: [
            { path: 'README.md', type: 'blob' },
            { path: 'LICENSE', type: 'blob' },
            { path: 'Dockerfile', type: 'blob' },
            {
              path: '.github/workflows/ci.yml',
              type: 'blob',
            },
            { path: 'src/app.test.ts', type: 'blob' },
            { path: 'SECURITY.md', type: 'blob' },
            { path: '.gitignore', type: 'blob' },
            { path: 'package.json', type: 'blob' },
            { path: 'compose.yaml', type: 'blob' },
          ],
          truncated: false,
        });
      }

      if (url.includes('/contributors')) {
        return jsonResponse([
          {
            login: 'octocat',
            avatar_url: 'https://github.com/images/octocat.png',
            html_url: 'https://github.com/octocat',
            contributions: 42,
          },
        ]);
      }

      if (url.includes('/stats/commit_activity')) {
        return jsonResponse([
          {
            week: 1767225600,
            total: 5,
            days: [1, 0, 1, 1, 0, 1, 1],
          },
          {
            week: 1767830400,
            total: 3,
            days: [0, 1, 0, 1, 0, 1, 0],
          },
        ]);
      }

      if (url === 'https://api.github.com/repos/octocat/demo') {
        return jsonResponse({
          id: 1,
          name: 'demo',
          full_name: 'octocat/demo',
          html_url: 'https://github.com/octocat/demo',
          description: 'Demo repository',
          private: false,
          fork: false,
          stargazers_count: 12,
          watchers_count: 5,
          forks_count: 2,
          open_issues_count: 1,
          language: 'TypeScript',
          default_branch: 'main',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
          pushed_at: '2026-01-01T00:00:00Z',
          size: 100,
          topics: ['typescript'],
          owner: {
            login: 'octocat',
            avatar_url: 'https://github.com/images/octocat.png',
            html_url: 'https://github.com/octocat',
          },
          license: {
            key: 'mit',
            name: 'MIT License',
            spdx_id: 'MIT',
          },
        });
      }

      throw new Error(`Unexpected GitHub request: ${url}`);
    });

    const result = await service.analyzeRepository(
      'https://github.com/octocat/demo',
    );

    expect(result.fullName).toBe('octocat/demo');
    expect(result.stats.stars).toBe(12);

    expect(result.health.score).toBe(100);
    expect(result.health.grade).toBe('Excellent');
    expect(result.health.checks).toHaveLength(9);
    expect(result.health.checks.every((check) => check.passed))
      .toBe(true);

    expect(result.contributors.available).toBe(true);
    expect(result.contributors.items[0]?.username).toBe('octocat');
    expect(result.contributors.items[0]?.contributions).toBe(42);

    expect(result.activity.available).toBe(true);
    expect(result.activity.weeks).toHaveLength(2);
    expect(result.activity.totalCommits).toBe(8);

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
