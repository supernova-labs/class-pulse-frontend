import { sortQuestions } from "./sortQuestions";

interface NebulaQuestion {
  id: string;
  status: string;
  votes: number;
  created_at: string;
}

export interface StarPlacement {
  id: string;
  x: number; // % of stage width
  y: number; // % of stage height
  scale: number; // 0.7 - 1.3
  brightness: number; // 0 - 1, drives opacity and glow
  isCenter: boolean;
  isLeaving: boolean; // answered star parked at the edge
}

export interface NebulaLayout {
  stars: StarPlacement[];
  overflow: number; // open questions without a star
}

export const MAX_STARS = 9;
const MAX_LEAVING = 4;

const CENTER = { x: 50, y: 48 };
// Hand-tuned orbit slots; capped star widths keep them from overlapping.
const ORBIT = [
  { x: 20, y: 24 },
  { x: 78, y: 20 },
  { x: 87, y: 54 },
  { x: 72, y: 80 },
  { x: 28, y: 82 },
  { x: 11, y: 55 },
  { x: 40, y: 14 },
  { x: 62, y: 68 },
];

export function computeNebulaLayout(
  questions: NebulaQuestion[],
  maxStars: number = MAX_STARS,
): NebulaLayout {
  const visible = questions.filter((question) => question.status !== "deleted");
  const open = sortQuestions(visible.filter((question) => question.status === "open"));
  const answered = sortQuestions(visible.filter((question) => question.status === "answered"));

  const starring = open.slice(0, maxStars);
  const maxVotes = Math.max(1, ...starring.map((question) => question.votes));

  const stars: StarPlacement[] = starring.map((question, rank) => {
    const t = Math.sqrt(question.votes / maxVotes);
    const slot = rank === 0 ? CENTER : ORBIT[(rank - 1) % ORBIT.length];
    return {
      id: question.id,
      x: slot.x,
      y: slot.y,
      scale: 0.7 + 0.6 * t,
      brightness: 0.45 + 0.55 * t,
      isCenter: rank === 0,
      isLeaving: false,
    };
  });

  // Most recently answered stars park dimmed at the nearest horizontal edge.
  answered.slice(0, MAX_LEAVING).forEach((question, index) => {
    const slot = ORBIT[index % ORBIT.length];
    stars.push({
      id: question.id,
      x: slot.x < 50 ? 3 : 97,
      y: slot.y,
      scale: 0.6,
      brightness: 0.15,
      isCenter: false,
      isLeaving: true,
    });
  });

  return { stars, overflow: Math.max(0, open.length - starring.length) };
}
