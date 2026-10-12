// Answers stay in the app, so help works even when a model provider is unavailable.
export const HELP_TOPICS=[
  {id:'start',question:'How do I use MoodTrip?',terms:['start','begin','use moodtrip','how does it work','plan a trip','find places','recommendation'],answer:'Choose Use My Location or search for a city, locality, building or address. Select Solo or Group, describe or choose a mood, adjust radius and crowd preference, then press Find Places for This Mood. Open a result to inspect its map, explanation and reviews.',link:'#planner',linkLabel:'Open planner'},
  {id:'location',question:'Why is my location not working?',terms:['location not working','location denied','gps','permission','locate','my location','current location','wrong location'],answer:'Use My Location asks your browser for permission. If you denied it, enable location for this site in browser settings and try again. You can always search a city, locality, building or street manually. Check the selected location before finding places.',link:'#planner',linkLabel:'Choose location'},
  {id:'address',question:'How do I search an exact address?',terms:['address','building','society','street','locality','search city','manual city','autocomplete','suggestion'],answer:'Type a building, street, locality or city in the location search. Choose a matching suggestion when available, or press Search for the typed query. Adding the neighbourhood and city helps when a name is ambiguous.',link:'#planner',linkLabel:'Search location'},
  {id:'mood',question:'How does mood detection work?',terms:['mood detection','detect mood','emotion','text mood','deep model','transformer','roberta','fast mode','write feeling'],answer:'In Solo mode, select a mood or describe how you feel. Fast Text Mood uses lightweight text rules, while Run Deep Model loads an on-demand RoBERTa emotion classifier. You can always select a mood yourself; the model is optional.',link:'#planner',linkLabel:'Set a mood'},
  {id:'group',question:'How does Group mode work?',terms:['group','friends','people','multiple','vote','majority','together'],answer:'Switch from Solo to Group, choose 2–6 people, then select a mood for each person. MoodTrip blends their mood signals and shows a majority mood; in a tie it uses the combined mood vector.',link:'#planner',linkLabel:'Open group settings'},
  {id:'radius',question:'Can I change the search radius?',terms:['radius','distance','far away','nearby','km','kilomet','closer','farther'],answer:'In Context Features, choose a radius of 3, 5, 8, 12 or 20 km before searching. MoodTrip prioritizes nearer suitable places. If few places appear, try a larger radius or another location.',link:'#planner',linkLabel:'Change radius'},
  {id:'crowd',question:'Can I avoid crowded places?',terms:['crowd','quiet','busy','lively','noise','peaceful','alone'],answer:'Set Crowd to Quiet, Balanced or Lively in Context Features, or leave it on Auto. Crowd fit is a category-based estimate, not a real-time occupancy measurement. Always check the place yourself before visiting.',link:'#planner',linkLabel:'Set crowd preference'},
  {id:'results',question:'Why are there no results?',terms:['no result','no places','nothing found','empty results','zero places','search failed','not loading results'],answer:'Place availability varies by area and provider. Confirm your location, increase the radius, try a different mood or search a nearby larger city, then run the search again. A temporary provider timeout can also cause an empty result.',link:'#planner',linkLabel:'Try a new search'},
  {id:'ranking',question:'How are places ranked?',terms:['rank','ranking','score','best place','why this place','recommendation logic','algorithm'],answer:'Mood relevance creates a shortlist. Within it, distance is prioritized; available ratings and review counts break close-distance ties, then the learned suitability score helps order places. Feedback can adjust later rankings. The app shows a place-level explanation.',link:'#results',linkLabel:'View results'},
  {id:'map',question:'What if the map or Street Camera fails?',terms:['map','satellite','street camera','street view','camera','imagery','tiles','building'],answer:'Try switching between Street and Satellite, moving the camera point or reopening Street Camera. Some places have no street imagery or building coverage. Your recommendation stays available, and you can open the selected place in Google Maps.',link:'#results',linkLabel:'View map'},
  {id:'reviews',question:'Where do reviews come from?',terms:['review','rating','stars','google reviews','write review','public review'],answer:'Open Reviews on a result to see available public snippets, reviews saved in MoodTrip on this device, and a link to Google Reviews for that exact place. Public coverage varies. MoodTrip does not invent ratings or copy a review from a different branch.',link:'#results',linkLabel:'View places'},
  {id:'feedback',question:'What do Good Pick and Not For Me do?',terms:['feedback','good pick','not for me','dislike','like place','learn my preference','personalization'],answer:'Good Pick and Not For Me adjust recommendations immediately. Feedback is saved on this device; shared anonymous feedback is used only when that optional service is configured. It does not guarantee that every future suggestion will match your preference.',link:'#results',linkLabel:'View recommendations'},
  {id:'history',question:'Where is my trip history?',terms:['history','past trip','previous search','saved trips','clear history','delete history'],answer:'Use History at the top of the page to see recent searches. It stores up to eight entries on this device. Use Clear Local History there to remove them.',link:'#top',linkLabel:'Go to top'},
  {id:'privacy',question:'Do I need an account? What is saved?',terms:['privacy','account','sign in','login','data','saved','tracking','personal information'],answer:'No account is needed. Browser location is requested only when you press Use My Location; local history and feedback are stored on this device. Optional shared feedback is anonymous when configured. Read the privacy page for details.',link:'/privacy',linkLabel:'Privacy information'},
  {id:'cost',question:'Is MoodTrip free?',terms:['free','price','cost','payment','subscription','pay'],answer:'You can use the MoodTrip planner without creating an account or entering payment details. A recommended venue may have its own prices or entry rules, so check those before visiting.',link:'#planner',linkLabel:'Open planner'},
  {id:'safety',question:'Is this a mental health service?',terms:['mental health','therapy','therapist','crisis','unsafe','safety','emergency'],answer:'MoodTrip recommends places; it is not a therapist or emergency service. It favors quiet public spaces for low or stressed moods, but cannot verify a place’s real-time safety. If you are in immediate danger, contact local emergency services or someone you trust.'}
];

const normalize=s=>String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
const stop=new Set(['the','and','for','what','where','when','why','how','can','do','does','is','are','i','my','a','an','to','in','on','with','of','it','this','that','your','me','you','about','please']);

export function answerHelp(raw,lastTopic){
  const query=normalize(raw);
  if(!query)return {answer:'Ask me about the planner, mood detection, location, maps, reviews or privacy.',suggestions:HELP_TOPICS.slice(0,3)};
  if(/^(hi|hello|hey|help|thanks|thank you)$/.test(query))return {answer:'Hi! I can help you use MoodTrip. Choose a question below or describe what is going wrong.',suggestions:HELP_TOPICS.slice(0,3)};
  const words=query.split(' ').filter(w=>w.length>2&&!stop.has(w));
  const ranked=HELP_TOPICS.map(topic=>{
    const terms=[topic.question,...topic.terms];
    let score=0;
    for(const term of terms){
      const phrase=normalize(term);
      if(phrase.length>3 && (` ${query} `).includes(` ${phrase} `))score=Math.max(score,phrase.includes(' ')?6:4);
      const overlap=phrase.split(' ').filter(w=>w.length>3&&!stop.has(w)&&words.includes(w)).length;
      score=Math.max(score,overlap*(phrase.includes(' ')?1.5:2));
    }
    return {topic,score};
  }).sort((a,b)=>b.score-a.score);
  let match=ranked[0];
  if((/^(and |what about |how do i do that|tell me more|why is that)/.test(query)||words.length===0) && lastTopic && match.score<4){
    match={topic:HELP_TOPICS.find(t=>t.id===lastTopic),score:4};
  }
  if(!match?.topic||match.score<2)return {
    answer:'I am not sure about that yet. I can answer questions about MoodTrip’s features and common issues. Try one of these, or email the developer for help.',
    suggestions:[HELP_TOPICS[0],HELP_TOPICS[7],HELP_TOPICS[12]],unanswered:true
  };
  return {answer:match.topic.answer,link:match.topic.link,linkLabel:match.topic.linkLabel,topic:match.topic.id,
    suggestions:HELP_TOPICS.filter(t=>t.id!==match.topic.id).filter(t=>t.id===ranked[1]?.topic.id||t.id===ranked[2]?.topic.id).slice(0,2)};
}
