import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unvoteQuestion, voteQuestion } from "../api/sessions";
import type { Question, QuestionList } from "../api/types";
import { questionsQueryKey } from "./useQuestionsPolling";

export function useVoteToggle(code: string, participantId: string) {
  const queryClient = useQueryClient();
  const queryKey = questionsQueryKey(code, participantId);

  return useMutation({
    mutationFn: ({ questionId, voted }: { questionId: string; voted: boolean }) =>
      voted ? unvoteQuestion(questionId, participantId) : voteQuestion(questionId, participantId),
    onMutate: async ({ questionId, voted }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousQuestion = queryClient
        .getQueryData<QuestionList>(queryKey)
        ?.questions.find((q) => q.id === questionId);
      queryClient.setQueryData<QuestionList>(queryKey, (data) =>
        data
          ? {
              ...data,
              questions: data.questions.map((q) =>
                q.id === questionId
                  ? { ...q, voted_by_me: !voted, votes: q.votes + (voted ? -1 : 1) }
                  : q,
              ),
            }
          : data,
      );
      return { previousQuestion };
    },
    onError: (_error, { questionId }, context) => {
      // roll back only the affected question so other in-flight votes survive
      const previous = context?.previousQuestion;
      if (!previous) return;
      queryClient.setQueryData<QuestionList>(queryKey, (data) =>
        data
          ? {
              ...data,
              questions: data.questions.map((q): Question => (q.id === questionId ? previous : q)),
            }
          : data,
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
