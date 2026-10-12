import {describe,it,expect} from 'vitest';
import {answerHelp} from './helpAnswers';

describe('MoodTrip help answers',()=>{
  it('gives actionable help for common location and result problems',()=>{
    expect(answerHelp('My location is not working').topic).toBe('location');
    expect(answerHelp('Why are there no results?').topic).toBe('results');
    expect(answerHelp('How do I use group mode?').topic).toBe('group');
  });
  it('does not invent an answer to an unrelated question',()=>{
    const answer=answerHelp('What is the weather forecast tomorrow?');
    expect(answer.unanswered).toBe(true);
    expect(answer.answer).toMatch(/not sure/i);
  });
});
