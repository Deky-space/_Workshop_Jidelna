export type Category = "bílé maso" | "červené maso" | "ryba" | "bezmasé" | "sladké";
export type Ingredient = { name: string; grams: number | null; group?: string };
export type Recipe = { id: string; name: string; category: Category; ingredients: Ingredient[]; note?: string; approved: boolean };
export type Day = { date: string; soup: string; first: string; second: string; side: string; locked: boolean };
export type Idea = { id: string; text: string; status: "nový" | "navržený" | "schválený" | "zamítnutý"; recipeId?: string; date?: string; choice?: "first" | "second"; explanation?: string };
export type AppData = { month: string; days: Day[]; recipes: Recipe[]; ideas: Idea[]; diners: number; ruleVersion: string };
export type Finding = { level: "error" | "warning" | "unknown"; title: string; detail: string };

export const RULE_VERSION = "107/2005 Sb. – znění od 1. 9. 2025, běžná výživa";

export const seedRecipes: Recipe[] = [
  { id:"fish",name:"Pečená ryba na zelenině s bramborem",category:"ryba",approved:false,ingredients:[{name:"ryba",grams:null,group:"Ryby"},{name:"brambory",grams:null,group:"Brambory"},{name:"zelenina",grams:null,group:"Zelenina a ovoce"}] },
  { id:"chicken",name:"Kuřecí nudličky s rýží",category:"bílé maso",approved:false,ingredients:[{name:"kuřecí maso",grams:null,group:"Maso"},{name:"rýže",grams:null},{name:"zelenina",grams:null,group:"Zelenina a ovoce"}] },
  { id:"lentils",name:"Čočka na kyselo s vejcem",category:"bezmasé",approved:false,ingredients:[{name:"čočka",grams:null,group:"Luštěniny"},{name:"vejce",grams:null},{name:"cibule",grams:null,group:"Zelenina a ovoce"}] },
  { id:"pasta",name:"Špagety s rajčatovou omáčkou a sýrem",category:"bezmasé",approved:false,ingredients:[{name:"těstoviny",grams:null},{name:"rajčata",grams:null,group:"Zelenina a ovoce"},{name:"sýr",grams:null,group:"Mléčné výrobky"}] },
  { id:"pork",name:"Vepřová kýta s rýží",category:"červené maso",approved:false,ingredients:[{name:"vepřové maso",grams:null,group:"Maso"},{name:"rýže",grams:null}] },
  { id:"couscous",name:"Zeleninový kuskus s cizrnou",category:"bezmasé",approved:false,ingredients:[{name:"kuskus",grams:null},{name:"cizrna",grams:null,group:"Luštěniny"},{name:"zelenina",grams:null,group:"Zelenina a ovoce"}] },
  { id:"ricepudding",name:"Rýžový nákyp se švestkami",category:"sladké",approved:false,ingredients:[{name:"rýže",grams:null},{name:"švestky",grams:null,group:"Zelenina a ovoce"},{name:"mléko",grams:null,group:"Mléčné výrobky"}] },
  { id:"beans",name:"Fazole po bretaňsku",category:"bezmasé",approved:false,ingredients:[{name:"fazole",grams:null,group:"Luštěniny"},{name:"rajčata",grams:null,group:"Zelenina a ovoce"}] },
  { id:"turkey",name:"Krůtí maso na zelenině s bramborem",category:"bílé maso",approved:false,ingredients:[{name:"krůtí maso",grams:null,group:"Maso"},{name:"zelenina",grams:null,group:"Zelenina a ovoce"},{name:"brambory",grams:null,group:"Brambory"}] },
  { id:"cauliflower",name:"Květákový mozeček s bramborem",category:"bezmasé",approved:false,ingredients:[{name:"květák",grams:null,group:"Zelenina a ovoce"},{name:"vejce",grams:null},{name:"brambory",grams:null,group:"Brambory"}] },
];

const formatDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
export function monthDays(month: string): Day[] {
  const [year, m] = month.split("-").map(Number);
  const count = new Date(year,m,0).getDate();
  const days: Day[]=[];
  for(let i=1;i<=count;i++) {
    const date=new Date(year,m-1,i);
    if(date.getDay()===0 || date.getDay()===6) continue;
    const index=days.length;
    days.push({date:formatDate(date),soup:["Zeleninová polévka","Bramborová polévka","Hráškový krém","Vývar se zeleninou","Dýňová polévka"][index%5],first:["chicken","fish","pork","turkey","chicken"][index%5],second:["lentils","pasta","cauliflower","beans","couscous"][index%5],side:"Voda, neslazený čaj",locked:false});
  }
  return days;
}
export function initialData(): AppData { const month="2026-10"; return {month,days:monthDays(month),recipes:seedRecipes,ideas:[],diners:400,ruleVersion:RULE_VERSION}; }
export const recipeName=(recipes:Recipe[],id:string)=>recipes.find(x=>x.id===id)?.name??"Neznámá receptura";
export const isMeatless=(recipe?:Recipe)=>recipe?.category==="bezmasé"||recipe?.category==="sladké";
export function weekNumber(date:string):number { const d=new Date(`${date}T12:00:00`); return Math.floor((d.getDate()+new Date(d.getFullYear(),d.getMonth(),1).getDay()+6)/7); }

export function findings(data: AppData): Finding[] {
  const out:Finding[]=[];
  const byId=new Map(data.recipes.map(r=>[r.id,r]));
  for(const day of data.days){
    const a=byId.get(day.first), b=byId.get(day.second);
    if(!a||!b){out.push({level:"error",title:`${day.date}: chybí receptura`,detail:"Vyberte pro oba chody platnou recepturu."});continue;}
    if(!isMeatless(a)&&!isMeatless(b)) out.push({level:"error",title:`${day.date}: chybí bezmasá volba`,detail:"Ve výběrovém obědovém menu musí být vždy možné zvolit bezmasý pokrm (příloha č. 1, bod 9d)."});
  }
  const weeks=new Map<number,Day[]>();
  data.days.forEach(d=>{const w=weekNumber(d.date);weeks.set(w,[...(weeks.get(w)??[]),d]);});
  for(const [week,days] of weeks){
    for(const choice of ["first","second"] as const){
      const red=days.filter(d=>byId.get(d[choice])?.category==="červené maso").length;
      if(red>1) out.push({level:"error",title:`Týden ${week}: červené maso ve volbě ${choice==="first"?"1":"2"} ${red}×`,detail:"Každá volba může červené maso obsahovat nejvýše jednou týdně (příloha č. 1, bod 9e)."});
    }
  }
  const fishDates=data.days.filter(d=>[d.first,d.second].some(id=>byId.get(id)?.category==="ryba")||/(ryb|losos|tresk|tuňák)/i.test(d.soup)).map(d=>d.date);
  for(let i=0;i<data.days.length;i+=10){const block=data.days.slice(i,i+10);if(block.length>=8&&!block.some(d=>fishDates.includes(d.date)))out.push({level:"error",title:"V dvoutýdenním úseku chybí ryba",detail:`Úsek ${block[0].date}–${block.at(-1)?.date}; rybí pokrm se nabízí nejméně jednou za dva týdny.`});}
  const unapproved=data.recipes.filter(r=>data.days.some(d=>d.first===r.id||d.second===r.id)&&!r.approved).length;
  if(unapproved)out.push({level:"unknown",title:`${unapproved} receptur čeká na schválení`,detail:"Složení a gramáže jsou zatím pracovní návrh. Vedoucí musí potvrdit použitelnost."});
  const missing=data.recipes.filter(r=>data.days.some(d=>d.first===r.id||d.second===r.id)&&(!r.ingredients.length||r.ingredients.some(i=>i.grams===null))).length;
  if(missing)out.push({level:"unknown",title:"Spotřební koš nelze ověřit",detail:`U ${missing} použitých receptur chybí gramáže na porci. Měsíční plnění ani finanční limit nelze poctivě spočítat.`});
  out.push({level:"unknown",title:"Ceny a skutečné počty porcí nejsou zadány",detail:"Odhad nákupu a kontrola finančního limitu vyžadují ceny surovin a počty porcí podle věku. Zadaný celkový počet slouží jen k orientaci."});
  return out;
}

export function suggest(data:AppData,recipeId:string) {
  const recipe=data.recipes.find(r=>r.id===recipeId);
  if(!recipe)return null;
  const candidates=data.days.filter(d=>!d.locked).flatMap(day=> (["first","second"] as const).map(choice=>{
    const next={...data,days:data.days.map(d=>d.date===day.date?{...d,[choice]:recipeId}:d)};
    const errs=findings(next).filter(f=>f.level==="error").length;
    const baseline=findings(data).filter(f=>f.level==="error").length;
    const replaced=recipeName(data.recipes,day[choice]);
    return {date:day.date,choice,score:errs-baseline,errors:errs,replaced};
  }));
  candidates.sort((a,b)=>a.score-b.score||a.date.localeCompare(b.date)|| (a.choice==="first"?-1:1));
  return candidates[0]??null;
}

export function parentMessage(idea:Idea,recipe:Recipe,proposal:{date:string;replaced:string}|null,approved:boolean) {
  if(!proposal) return `Děkujeme za námět „${idea.text}“. Zatím pro něj nemáme volný a provozně potvrzený termín. Nabízíme upravenou podobu „${recipe.name}“ k dalšímu posouzení vedoucí jídelny.`;
  const date=new Date(`${proposal.date}T12:00:00`).toLocaleDateString("cs-CZ",{day:"numeric",month:"long"});
  return `Děkujeme za námět „${idea.text}“. ${approved?"Zařadili jsme do pracovního plánu":"Navrhujeme zařadit"} jídlo „${recipe.name}“ na ${date}. V jídelníčku ${approved?"nahrazuje":"by nahradilo"} „${proposal.replaced}“. ${recipe.approved?"Složení receptury potvrdila vedoucí jídelny.":"Složení receptury ještě musí potvrdit vedoucí jídelny."} Případné úpravy vycházejí z možností kuchyně a skladby ostatních jídel.`;
}
