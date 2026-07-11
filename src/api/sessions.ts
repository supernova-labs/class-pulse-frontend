import { client, failOnError, unwrap } from "./client";
import type { Participant, Question, QuestionList } from "./types";

export async function joinSession(code: string, displayName?: string): Promise<Participant> {
  const result = await client.POST("/sessions/{code}/participants", {
    params: { path: { code } },
    body: { display_name: displayName || null },
  });
  return unwrap(result);
}

export async function getQuestions(code: string, participantId?: string): Promise<QuestionList> {
  const result = await client.GET("/sessions/{code}/questions", {
    params: {
      path: { code },
      query: participantId ? { participant_id: participantId } : {},
    },
  });
  return unwrap(result);
}

export async function askQuestion(
  code: string,
  participantId: string,
  body: string,
): Promise<Question> {
  const result = await client.POST("/sessions/{code}/questions", {
    params: { path: { code } },
    body: { body, participant_id: participantId },
  });
  return unwrap(result);
}

export async function voteQuestion(questionId: string, participantId: string): Promise<void> {
  const result = await client.PUT("/questions/{question_id}/vote", {
    params: { path: { question_id: questionId }, query: { participant_id: participantId } },
  });
  failOnError(result);
}

export async function unvoteQuestion(questionId: string, participantId: string): Promise<void> {
  const result = await client.DELETE("/questions/{question_id}/vote", {
    params: { path: { question_id: questionId }, query: { participant_id: participantId } },
  });
  failOnError(result);
}
