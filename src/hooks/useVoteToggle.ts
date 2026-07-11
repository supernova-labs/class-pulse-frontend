import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unvoteQuestion, voteQuestion } from "../api/sessions";
import type { QuestionList } from "../api/types";
import { questionsQueryKey } from "./useQuestionsPolling";

export function useVoteToggle(code: string, participantId: string) {
  const queryClient = useQueryClient();
  const queryKey = questionsQueryKey(code, participantId);

  return useMutation({
    mutationFn: ({ questionId, voted }: { questionId: string; voted: boolean }) =>
      voted
        ? unvoteQuestion(questionId, participantId)
        : voteQuestion(questionId, participantId),
    onMutate: async ({ questionId, voted }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<QuestionList>(queryKey);
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
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
