import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { QuestionList } from "../api/types";
import { questionsQueryKey } from "./useQuestionsPolling";
import { useVoteToggle } from "./useVoteToggle";

jest.mock("../api/sessions", () => ({
  voteQuestion: jest.fn(),
  unvoteQuestion: jest.fn(),
}));

import { voteQuestion } from "../api/sessions";

const CODE = "TW-1234";
const PARTICIPANT = "participant-1";

const initialData: QuestionList = {
  session: {
    id: "s1",
    name: "Test",
    code: CODE,
    status: "active",
    created_at: "2026-07-11T10:00:00Z",
    ended_at: null,
  },
  questions: [
    {
      id: "q1",
      body: "Pergunta?",
      status: "open",
      votes: 2,
      voted_by_me: false,
      author_name: "Guest 01",
      answered_at: null,
      created_at: "2026-07-11T10:00:00Z",
    },
  ],
};

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const key = questionsQueryKey(CODE, PARTICIPANT);
  queryClient.setQueryData(key, initialData);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const { result } = renderHook(() => useVoteToggle(CODE, PARTICIPANT), { wrapper });
  return { queryClient, key, result };
}

describe("useVoteToggle", () => {
  it("optimistically increments votes and flips voted_by_me before the server resolves", async () => {
    let resolveVote: () => void = () => {};
    (voteQuestion as jest.Mock).mockImplementation(
      () => new Promise<void>((resolve) => (resolveVote = resolve)),
    );
    const { queryClient, key, result } = setup();

    act(() => result.current.mutate({ questionId: "q1", voted: false }));

    await waitFor(() => {
      const data = queryClient.getQueryData<QuestionList>(key);
      expect(data?.questions[0].votes).toBe(3);
      expect(data?.questions[0].voted_by_me).toBe(true);
    });
    act(() => resolveVote());
  });

  it("rolls back the cache when the server rejects", async () => {
    (voteQuestion as jest.Mock).mockRejectedValue(new Error("boom"));
    const { queryClient, key, result } = setup();

    act(() => result.current.mutate({ questionId: "q1", voted: false }));

    await waitFor(() => expect(result.current.isError).toBe(true));
    const data = queryClient.getQueryData<QuestionList>(key);
    expect(data?.questions[0].votes).toBe(2);
    expect(data?.questions[0].voted_by_me).toBe(false);
  });
});
