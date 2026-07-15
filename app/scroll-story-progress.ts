export function clampStoryValue(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function storyStagePosition(centers: number[], anchor: number) {
  if (centers.length < 2 || anchor <= centers[0]) return 0;
  const lastIndex = centers.length - 1;
  if (anchor >= centers[lastIndex]) return lastIndex;

  for (let index = 0; index < lastIndex; index += 1) {
    if (anchor <= centers[index + 1]) {
      const distance = Math.max(1, centers[index + 1] - centers[index]);
      return index + clampStoryValue((anchor - centers[index]) / distance);
    }
  }

  return lastIndex;
}

export function activeStoryStage(stagePosition: number, stageCount: number) {
  return clampStoryValue(Math.floor(stagePosition + .5), 0, Math.max(0, stageCount - 1));
}
