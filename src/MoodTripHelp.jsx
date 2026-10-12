import React,{useEffect,useRef,useState}from'react';
import {answerHelp,HELP_TOPICS}from'./helpAnswers';
import './moodtrip-help.css';

const welcome={role:'assistant',text:'Hi, I’m the MoodTrip guide. Ask me how the planner works or tell me what you’re having trouble with.'};

export default function MoodTripHelp(){
  const [open,setOpen]=useState(false);
  const [draft,setDraft]=useState('');
  const [messages,setMessages]=useState([welcome]);
  const [lastTopic,setLastTopic]=useState(null);
  const [suggestions,setSuggestions]=useState(HELP_TOPICS.slice(0,4));
  const [busy,setBusy]=useState(false);
  const input=useRef(null);
  const end=useRef(null);

  useEffect(()=>{if(open)input.current?.focus()},[open]);
  useEffect(()=>{if(open)end.current?.scrollIntoView({block:'end'})},[messages,open]);
  useEffect(()=>{
    function onKey(e){if(e.key==='Escape'&&open)setOpen(false)}
    document.addEventListener('keydown',onKey);
    return()=>document.removeEventListener('keydown',onKey);
  },[open]);

  async function ask(value){
    const question=value.trim().slice(0,500);
    if(!question||busy)return;
    const result=answerHelp(question,lastTopic);
    const prior=messages.slice(-6).map(m=>({role:m.role,content:m.text}));
    const pending={role:'assistant',text:'Checking MoodTrip guidance…',pending:true};
    setMessages(prev=>[...prev.slice(-18),{role:'user',text:question},pending]);
    setBusy(true);
    setLastTopic(result.topic||null);
    setSuggestions(result.suggestions?.length?result.suggestions:HELP_TOPICS.slice(0,3));
    setDraft('');
    try{
      const response=await fetch('/api/help',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:[...prior,{role:'user',content:question}]})});
      if(!response.ok)throw new Error('Model unavailable');
      const payload=await response.json();
      if(typeof payload.answer!=='string'||!payload.answer.trim())throw new Error('Empty answer');
      setMessages(prev=>prev.map(m=>m===pending?{role:'assistant',text:payload.answer.trim(),link:result.link,linkLabel:result.linkLabel}:m));
    }catch{
      setMessages(prev=>prev.map(m=>m===pending?{role:'assistant',text:result.answer,link:result.link,linkLabel:result.linkLabel,unanswered:result.unanswered}:m));
    }finally{setBusy(false);input.current?.focus()}
  }

  return <div className="mtHelpDock">
    {open&&<section className="mtHelpPanel" role="dialog" aria-label="MoodTrip help chat">
      <header className="mtHelpHead"><div><span>MOODTRIP / HELP</span><h2>Ask about the app</h2></div><button type="button" onClick={()=>setOpen(false)} aria-label="Close help chat">×</button></header>
      <div className="mtHelpTranscript" role="log" aria-live="polite" aria-relevant="additions text">
        {messages.map((message,i)=><div className={'mtHelpMessage '+message.role} key={i}>
          <small>{message.role==='assistant'?'MOODTRIP':'YOU'}</small>
          <p>{message.text}</p>
          {message.link&&<a href={message.link} onClick={()=>setOpen(false)}>{message.linkLabel||'Open section'} ↗</a>}
          {message.unanswered&&<a href="mailto:24DCS032@lnmiit.ac.in?subject=MoodTrip%20help">Email the developer ↗</a>}
        </div>)}<div ref={end}/>
      </div>
      <div className="mtHelpSuggestions" aria-label="Suggested questions">
        {suggestions.map(topic=><button type="button" key={topic.id} disabled={busy} onClick={()=>ask(topic.question)}>{topic.question}</button>)}
      </div>
      <form className="mtHelpComposer" onSubmit={e=>{e.preventDefault();ask(draft)}}>
        <label className="mtHelpSrOnly" htmlFor="mt-help-input">Ask MoodTrip a question</label>
        <input id="mt-help-input" ref={input} value={draft} onChange={e=>setDraft(e.target.value)} maxLength={500} placeholder="Ask about MoodTrip…" autoComplete="off"/>
        <button type="submit" disabled={!draft.trim()||busy} aria-label="Send question">↗</button>
      </form>
      <p className="mtHelpNote">Questions go to a model for app support when available. Chats are not saved by MoodTrip; the built-in guide answers during outages.</p>
    </section>}
    <button className="mtHelpLauncher" type="button" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-label={open?'Close MoodTrip help':'Open MoodTrip help'}>
      <span aria-hidden="true">{open?'×':'?'}</span><b>{open?'CLOSE HELP':'ASK MOODTRIP'}</b>
    </button>
  </div>;
}
