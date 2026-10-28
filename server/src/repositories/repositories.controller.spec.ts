
import { Test, TestingModule } from '@nestjs/testing';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { RepositoriesController } from './repositories.controller.js';
import { RepositoriesService } from './repositories.service.js';

describe('RepositoriesController', () => {
  let controller: RepositoriesController;

  const analyzeRepository = vi.fn<
    (url: string) => Promise<unknown>
  >();

  beforeEach(async () => {
    analyzeRepository.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepositoriesController],
      providers: [
        {
          provide: RepositoriesService,
          useValue: {
            analyzeRepository,
          },
        },
      ],
    }).compile();

    controller = module.get<RepositoriesController>(
      RepositoriesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate repository analysis to the service', async () => {
    const repositoryUrl = 'https://github.com/octocat/demo';
    const expectedResult = {
      fullName: 'octocat/demo',
    };

    analyzeRepository.mockResolvedValue(expectedResult);

    await expect(
      controller.analyzeRepository(repositoryUrl),
    ).resolves.toEqual(expectedResult);

    expect(analyzeRepository).toHaveBeenCalledWith(repositoryUrl);
    expect(analyzeRepository).toHaveBeenCalledTimes(1);
  });
});
