import { useQuery } from "@tanstack/react-query";
import { getQuestions } from "../api/sessions";
import { sortQuestions } from "../lib/sortQuestions";

export const POLL_INTERVAL_MS = 2500;

export function questionsQueryKey(code: string, participantId?: string) {
  return ["questions", code.toUpperCase(), participantId ?? null] as const;
}

export function useQuestionsPolling(code: string, participantId?: string, enabled = true) {
  const query = useQuery({
    queryKey: questionsQueryKey(code, participantId),
    queryFn: () => getQuestions(code, participantId),
    enabled,
    refetchInterval: (q) =>
      q.state.data?.session.status === "ended" ? false : POLL_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  const session = query.data?.session;
  return {
    session,
    questions: query.data ? sortQuestions(query.data.questions) : [],
    isEnded: session?.status === "ended",
    isLoading: query.isLoading,
    error: query.error,
  };
}
