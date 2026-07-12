import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { getQuestions } from "../api/sessions";
import type { Question, QuestionList } from "../api/types";
import { API_URL } from "../appConfig";
import { sortQuestions } from "../lib/sortQuestions";

const NO_QUESTIONS: Question[] = [];

export function questionsQueryKey(code: string, participantId?: string) {
  return ["questions", code.toUpperCase(), participantId ?? null] as const;
}

// Live question updates arrive over Server-Sent Events; the initial query seeds
// the cache so the first paint doesn't wait for the stream.
export function useQuestionsPolling(code: string, participantId?: string, enabled = true) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: questionsQueryKey(code, participantId),
    queryFn: () => getQuestions(code, participantId),
    enabled,
  });

  useEffect(() => {
    // EventSource is absent in jsdom/SSR — fall back to the one-shot fetch above
    if (!enabled || !code || typeof EventSource === "undefined") return;

    const params = new URLSearchParams();
    if (participantId) params.set("participant_id", participantId);
    const qs = params.toString();
    const url = `${API_URL}/sessions/${encodeURIComponent(code)}/stream${qs ? `?${qs}` : ""}`;

    const source = new EventSource(url);
    source.onmessage = (event) => {
      const data = JSON.parse(event.data) as QuestionList;
      queryClient.setQueryData(questionsQueryKey(code, participantId), data);
    };
    // EventSource auto-reconnects on transient drops; no manual retry needed

    return () => source.close();
  }, [code, participantId, enabled, queryClient]);

  // referentially stable unless the payload actually changes
  const questions = useMemo(
    () => (query.data ? sortQuestions(query.data.questions) : NO_QUESTIONS),
    [query.data],
  );

  const session = query.data?.session;
  return {
    session,
    questions,
    isEnded: session?.status === "ended",
    isLoading: query.isLoading,
    error: query.error,
  };
}
