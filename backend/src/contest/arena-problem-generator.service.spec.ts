import { describe, it, expect } from 'vitest';
import { BadGatewayException } from '@nestjs/common';
import { ArenaProblemGeneratorService } from './arena-problem-generator.service.js';

// 1x1 transparent PNG
const PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const generatorProblem = (overrides: Record<string, unknown> = {}) => ({
  id: 'chapter-4',
  index: 3,
  title: 'D. Orchard Search',
  arabicTitle: 'القطاع 4: D. Orchard Search',
  level: 'Medium',
  difficulty: 'Medium',
  difficultyColor: '#c084fc',
  baseXp: 100,
  timeLimit: '1.0 second',
  memoryLimit: '64 megabytes',
  problemStory: 'Red walks through the orchard...',
  taskDescription: 'Red walks...',
  inputSpec: 'The first line contains n.',
  outputSpec: 'Print the answer.',
  examples: [
    { input: '3\n1 2 3', output: '6', explanation: '1+2+3' },
    { input: '1\n5', output: '5', explanation: '' },
  ],
  constraints: ['1 <= n <= 10^5'],
  note: 'Sum them.',
  hint: 'Prefix sums help.',
  storyPart: 'Part 4 of the story',
  coreIdea: 'Binary Search',
  canBeExplainedByDiagrams: true,
  imagePrompt: 'A 2x2 grid...',
  imageUrl: PNG_DATA_URL,
  formattedProblem: 'D. Orchard Search ...',
  starterCode: { cpp: 'int main(){}' },
  sampleTests: [],
  ...overrides,
});

describe('ArenaProblemGeneratorService.mapProblem', () => {
  const service = new ArenaProblemGeneratorService();

  it('maps every generator field onto the problem', () => {
    const mapped = service.mapProblem(generatorProblem());
    expect(mapped).toMatchObject({
      xp: 100,
      difficultyIndex: 3,
      title: 'D. Orchard Search',
      arabicTitle: 'القطاع 4: D. Orchard Search',
      statement: 'Red walks through the orchard...',
      taskDescription: 'Red walks...',
      inputSpec: 'The first line contains n.',
      outputSpec: 'Print the answer.',
      constraints: ['1 <= n <= 10^5'],
      note: 'Sum them.',
      hint: 'Prefix sums help.',
      timeLimit: '1.0 second',
      memoryLimit: '64 megabytes',
      storyPart: 'Part 4 of the story',
      coreIdea: 'Binary Search',
      canBeExplainedByDiagrams: true,
      imagePrompt: 'A 2x2 grid...',
      imageMimeType: 'image/png',
      starterCode: { cpp: 'int main(){}' },
    });
    expect(mapped.examples).toHaveLength(2);
    expect(mapped.imageData?.length).toBeGreaterThan(0);
    // The raw payload is kept, minus the inline image.
    expect(mapped.rawOutput.coreIdea).toBe('Binary Search');
    expect(mapped.rawOutput.imageUrl).not.toContain('base64');
  });

  it('takes the XP tier from the generated problem, falling back to its index', () => {
    const top = service.mapProblem(generatorProblem({ index: 5, baseXp: 150 }));
    expect(top.xp).toBe(150);
    expect(top.difficultyIndex).toBe(5);
    expect(service.mapProblem(generatorProblem({ index: 1, baseXp: 999 })).xp).toBe(50);
  });

  it('falls back to the legacy single example fields', () => {
    const mapped = service.mapProblem(
      generatorProblem({ examples: undefined, exampleInput: '2', exampleOutput: '4' }),
    );
    expect(mapped.examples).toEqual([{ input: '2', output: '4', explanation: '' }]);
  });

  it('keeps a problem without an image (image is optional)', () => {
    const mapped = service.mapProblem(generatorProblem({ imageUrl: '' }));
    expect(mapped.imageData).toBeNull();
    expect(mapped.imageMimeType).toBeNull();
  });

  it('accepts only a full contest of 6 problems, one per tier', async () => {
    const run = (problems: unknown[]) => {
      (service as any).runGenerator = async () => ({ problems });
      return service.generateContest('A story about an orchard');
    };
    const full = [0, 1, 2, 3, 4, 5].map((index) =>
      generatorProblem({ index, baseXp: [25, 50, 75, 100, 125, 150][index] }),
    );

    const mapped = await run(full);
    expect(mapped.map((p) => p.xp)).toEqual([25, 50, 75, 100, 125, 150]);

    await expect(run(full.slice(0, 5))).rejects.toThrow(/instead of one per tier/);
    await expect(run([...full.slice(0, 5), generatorProblem({ index: 0 })])).rejects.toThrow(
      /instead of one per tier/,
    );
  });

  it('rejects incomplete problems instead of saving them', () => {
    expect(() => service.mapProblem(generatorProblem({ hint: '' }))).toThrow(BadGatewayException);
    expect(() =>
      service.mapProblem(generatorProblem({ examples: [], sampleTests: [] })),
    ).toThrow(/missing: examples/);
    expect(() => service.mapProblem(generatorProblem({ title: '  ' }))).toThrow(/title/);
  });
});
