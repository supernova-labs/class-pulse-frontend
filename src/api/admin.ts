import { client, failOnError, unwrap } from "./client";
import type { AdminSession, Question, Session } from "./types";

export async function adminLogin(password: string): Promise<string> {
  const result = await client.POST("/admin/login", { body: { password } });
  return unwrap(result).token;
}

export async function listSessions(): Promise<AdminSession[]> {
  const result = await client.GET("/admin/sessions");
  return unwrap(result);
}

export async function createSession(name: string): Promise<Session> {
  const result = await client.POST("/admin/sessions", { body: { name } });
  return unwrap(result);
}

export async function endSession(sessionId: string): Promise<Session> {
  const result = await client.POST("/admin/sessions/{session_id}/end", {
    params: { path: { session_id: sessionId } },
  });
  return unwrap(result);
}

export async function moderateQuestion(
  questionId: string,
  status: "open" | "answered",
): Promise<Question> {
  const result = await client.PATCH("/questions/{question_id}", {
    params: { path: { question_id: questionId } },
    body: { status },
  });
  return unwrap(result);
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const result = await client.DELETE("/questions/{question_id}", {
    params: { path: { question_id: questionId } },
  });
  failOnError(result);
}
