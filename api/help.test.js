import {afterEach,describe,expect,it,vi} from 'vitest';
import handler from './help';

function response(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;return this},status(v){this.statusCode=v;return this},json(v){this.body=v;return this}}}
const req=(messages)=>({method:'POST',headers:{host:'moodtrip.test',origin:'https://moodtrip.test','x-forwarded-for':'test-'+Math.random()},body:{messages}});
afterEach(()=>{vi.unstubAllGlobals();delete process.env.AI_GATEWAY_API_KEY});

describe('MoodTrip AI help endpoint',()=>{
  it('rejects invalid or oversized conversation before calling the model',async()=>{
    const res=response();
    await handler(req([{role:'user',content:'x'.repeat(501)}]),res);
    expect(res.statusCode).toBe(400);
  });
  it('sends app facts server-side and returns a capped answer',async()=>{
    process.env.AI_GATEWAY_API_KEY='test-token';
    const fetch=vi.fn(async(_,options)=>{
      expect(options.headers.Authorization).toBe('Bearer test-token');
      const sent=JSON.parse(options.body);
      expect(sent.messages[0].content).toContain('MoodTrip');
      expect(sent.messages.at(-1).content).toBe('How do I plan with friends?');
      return {ok:true,json:async()=>({choices:[{message:{content:'Switch to Group mode and choose a mood for each person.'}}]})};
    });
    vi.stubGlobal('fetch',fetch);
    const res=response();
    await handler(req([{role:'user',content:'How do I plan with friends?'}]),res);
    expect(res.statusCode).toBe(200);
    expect(res.body.answer).toMatch(/Group mode/);
  });
});
