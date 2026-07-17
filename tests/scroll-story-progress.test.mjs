import assert from "node:assert/strict";
import test from "node:test";
import { activeStoryStage, furthestStoryStagePosition, storyStagePosition, storyStageRevealProgress } from "../app/scroll-story-progress.ts";

const documentCenters = [900, 1600, 2300, 3000];
const viewportAnchor = 500;

function activeStageAtScroll(scrollY) {
  const viewportCenters = documentCenters.map((center) => center - scrollY);
  const position = storyStagePosition(viewportCenters, viewportAnchor);
  return { active: activeStoryStage(position, documentCenters.length), position };
}

test("scroll story advances through every stage in order without a skip", () => {
  const observed = [];
  let previousPosition = -1;
  for (let scrollY = 0; scrollY <= 3000; scrollY += 20) {
    const state = activeStageAtScroll(scrollY);
    assert.ok(state.position >= previousPosition, `${state.position} moved backward after ${previousPosition}`);
    previousPosition = state.position;
    if (observed.at(-1) !== state.active) observed.push(state.active);
  }
  assert.deepEqual(observed, [0, 1, 2, 3]);
});

test("scroll story reverses through every stage without a skip", () => {
  const observed = [];
  let previousPosition = Infinity;
  for (let scrollY = 3000; scrollY >= 0; scrollY -= 20) {
    const state = activeStageAtScroll(scrollY);
    assert.ok(state.position <= previousPosition, `${state.position} moved forward after ${previousPosition}`);
    previousPosition = state.position;
    if (observed.at(-1) !== state.active) observed.push(state.active);
  }
  assert.deepEqual(observed, [3, 2, 1, 0]);
});

test("stage position interpolates continuously between adjacent centers", () => {
  assert.equal(storyStagePosition([0, 100, 200, 300], 0), 0);
  assert.equal(storyStagePosition([0, 100, 200, 300], 50), .5);
  assert.equal(storyStagePosition([0, 100, 200, 300], 150), 1.5);
  assert.equal(storyStagePosition([0, 100, 200, 300], 300), 3);
});

test("each visual stage fades in once and remains revealed after scrolling back", () => {
  let furthest = 0;
  const forward = [0, .35, .7, 1, 1.4, 2, 2.7, 3].map((position) => {
    furthest = furthestStoryStagePosition(furthest, position);
    return [0, 1, 2, 3].map((index) => storyStageRevealProgress(index, furthest));
  });
  assert.equal(forward[0][0], 1, "the first stage is available at the first description");
  assert.ok(forward[1][1] > 0 && forward[1][1] < 1, "the next stage fades in over a meaningful scroll interval");
  assert.deepEqual(forward.at(-1), [1, 1, 1, 1]);

  for (const position of [2.4, 1.3, 0]) {
    furthest = furthestStoryStagePosition(furthest, position);
    assert.deepEqual([0, 1, 2, 3].map((index) => storyStageRevealProgress(index, furthest)), [1, 1, 1, 1]);
  }
});
