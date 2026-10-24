/**
 * Answer key for the Hub "Practice Challenges" quiz (frontend/src/data/hubContent.js).
 * The server grades submissions against this list so a client cannot claim a pass or pick its own XP.
 * Keep ids and correct option texts in sync with the frontend list.
 */
export const PRACTICE_CHALLENGE_XP = 25;

export const PRACTICE_CHALLENGE_ANSWERS: Record<string, string> = {
  '1': '<h1>Hello, CodeLand!</h1>',
  '2': 'justify-content: center;',
  '3': '30',
  '4': '4 times',
  '5': '20',
  '6': 'setCount(current => current + 1);',
};
