export interface AnalyzedRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  visibility: string;
  isFork: boolean;

  owner: {
    username: string;
    avatarUrl: string;
    url: string;
  };

  stats: {
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    sizeKb: number;
  };

  language: string | null;
  defaultBranch: string;
  topics: string[];
  license: string | null;

  dates: {
    createdAt: string;
    updatedAt: string;
    pushedAt: string | null;
  };
  
  health: {
    score: number;
    grade: 'Excellent' | 'Healthy' | 'Needs attention' | 'Critical';
    checks: {
      id: string;
      label: string;
      weight: number;
      passed: boolean;
      details: string;
      recommendation: string | null;
    }[];
    analyzedFiles: number;
    treeTruncated: boolean;
    note: string;
  };

contributors: {
  available: boolean;
  items: {
    username: string;
    avatarUrl: string;
    url: string;
    contributions: number;
  }[];
  note: string | null;
};

activity: {
  available: boolean;
  weeks: {
    weekStart: string;
    commits: number;
  }[];
  totalCommits: number;
  note: string | null;
};

}