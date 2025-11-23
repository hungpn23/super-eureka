// TODO: improve logic later (e.g., ignore case, ignore extra spaces, etc.)
export default (input: string, answer: string) => {
  if (!input) return false;

  return input.trim().toLowerCase() === answer.trim().toLowerCase();
};
