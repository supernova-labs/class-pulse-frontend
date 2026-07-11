interface Sortable {
  status: string;
  votes: number;
  created_at: string;
}

// Open questions first, then votes desc, then created_at asc.
export function sortQuestions<T extends Sortable>(questions: T[]): T[] {
  return [...questions].sort((a, b) => {
    const answered = Number(a.status === "answered") - Number(b.status === "answered");
    if (answered !== 0) return answered;
    if (a.votes !== b.votes) return b.votes - a.votes;
    return a.created_at.localeCompare(b.created_at);
  });
}
