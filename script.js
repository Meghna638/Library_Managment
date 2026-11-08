const GENRES=["Fiction","Non-fiction","Fantasy","Biography","Self-growth","Science"];
const COLORS=["#1f6f5c","#8a3b2e","#3b4f8a","#7a5a1c","#5b2f6b","#2c6a7a"];
const SEED=[
 {id:1,title:"The Midnight Library",author:"Matt Haig",genre:"Fiction",copies:3,pop:95,year:2020},
 {id:2,title:"Atomic Habits",author:"James Clear",genre:"Self-growth",copies:4,pop:98,year:2018},
 {id:3,title:"The Hobbit",author:"J.R.R. Tolkien",genre:"Fantasy",copies:2,pop:90,year:1937},
 {id:4,title:"Sapiens",author:"Yuval Noah Harari",genre:"Non-fiction",copies:3,pop:92,year:2011},
 {id:5,title:"Cosmos",author:"Carl Sagan",genre:"Science",copies:2,pop:80,year:1980},
 {id:6,title:"Wings of Fire",author:"A.P.J. Abdul Kalam",genre:"Biography",copies:3,pop:88,year:1999},
 {id:7,title:"A Brief History of Time",author:"Stephen Hawking",genre:"Science",copies:2,pop:85,year:1988},
 {id:8,title:"The Alchemist",author:"Paulo Coelho",genre:"Fiction",copies:3,pop:91,year:1988},
 {id:9,title:"Harry Potter and the Sorcerer's Stone",author:"J.K. Rowling",genre:"Fantasy",copies:4,pop:99,year:1997}
];
const KEY="lumen-library-v1";
let S=JSON.parse(localStorage.getItem(KEY)||"null")||{books:SEED,loans:[],history:[],requests:[]};
const save=()=>{localStorage.setItem(KEY,JSON.stringify(S));render()};
const $=id=>document.getElementById(id);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const left=b=>b.copies-S.loans.filter(l=>l.id===b.id).length;
const fmt=d=>new Date(d).toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}

function card(b){
  const n=left(b),has=S.loans.some(l=>l.id===b.id);
  return `<article class="book"><div class="cover" style="background:${COLORS[GENRES.indexOf(b.genre)%6]}">${esc(b.title)}</div>
  <div class="info"><strong>${esc(b.title)}</strong><small>${esc(b.author)} · ${esc(b.genre)}</small>
  <small>${n} of ${b.copies} available</small>
  <button class="btn" data-borrow="${b.id}" ${n<1||has?"disabled":""}>${has?"On your shelf":n<1?"Unavailable":"Borrow"}</button></div></article>`;
}

function render(){
  $("shelfCount").textContent=S.loans.length;
  $("sBorrowed").textContent=S.loans.length;
  $("sRead").textContent=S.history.length;
  $("sReq").textContent=S.requests.length;
  $("sDue").textContent=S.loans.length?fmt(Math.min(...S.loans.map(l=>l.due))):"—";
  const h=new Date().getHours();
  $("hello").textContent=(h<12?"Good morning.":h<18?"Good afternoon.":"Good evening.");
  $("popular").innerHTML=[...S.books].sort((a,b)=>b.pop-a.pop).slice(0,4).map(card).join("");
  // explore
  const q=$("q").value.toLowerCase(),g=$("genre").value,s=$("sort").value;
  let list=S.books.filter(b=>(g==="All genres"||b.genre===g)&&(b.title+b.author).toLowerCase().includes(q));
  list.sort((a,b)=>s==="az"?a.title.localeCompare(b.title):s==="new"?b.year-a.year:b.pop-a.pop);
  $("all").innerHTML=list.length?list.map(card).join(""):`<p class="empty">No books found. Try another title or genre.</p>`;
  // shelf
  $("shelfList").innerHTML=S.loans.length?S.loans.map(l=>{const b=S.books.find(x=>x.id===l.id);
    return `<div class="row"><div><strong>${esc(b.title)}</strong><small>${esc(b.author)} · due ${fmt(l.due)}</small></div><button class="btn alt" data-return="${l.id}">Return</button></div>`}).join("")
    :`<p class="empty">Your shelf is empty. Borrow a book from Explore.</p>`;
  // requests
  $("reqList").innerHTML=S.requests.length?S.requests.map(r=>`<div class="row"><div><strong>${esc(r.title)}</strong><small>${esc(r.author)}${r.why?" — "+esc(r.why):""}</small></div></div>`).join(""):`<p class="empty">You have not requested any books yet.</p>`;
  // history
  $("histList").innerHTML=S.history.length?[...S.history].reverse().map(x=>`<div class="row"><div><strong>${esc(x.title)}</strong><small>${esc(x.author)} · returned ${fmt(x.date)}</small></div></div>`).join(""):`<p class="empty">Nothing here yet. Return a book to see it in your history.</p>`;
  // desk
  $("deskReq").innerHTML=S.requests.length?S.requests.map((r,i)=>`<div class="row"><div><strong>${esc(r.title)}</strong><small>${esc(r.author)}</small></div><button class="btn alt" data-approve="${i}">Add to collection</button></div>`).join(""):`<p class="empty">No pending requests.</p>`;
  $("inventory").innerHTML=S.books.map(b=>`<div class="row"><div><strong>${esc(b.title)}</strong><small>${left(b)} of ${b.copies} in stock</small></div><button class="btn alt" data-remove="${b.id}">Remove</button></div>`).join("");
}

document.addEventListener("click",e=>{
  const t=e.target.closest("button");if(!t)return;
  if(t.dataset.go){
    document.querySelectorAll("section").forEach(s=>s.classList.toggle("on",s.id===t.dataset.go));
    document.querySelectorAll("aside button").forEach(b=>b.classList.toggle("on",b===t));
    scrollTo(0,0);
  }
  if(t.dataset.borrow){S.loans.push({id:+t.dataset.borrow,due:Date.now()+14*864e5});toast("Borrowed. Due in 14 days.");save()}
  if(t.dataset.return){const i=S.loans.findIndex(l=>l.id===+t.dataset.return),b=S.books.find(x=>x.id===+t.dataset.return);
    S.loans.splice(i,1);S.history.push({title:b.title,author:b.author,date:Date.now()});toast("Returned. Thank you!");save()}
  if(t.dataset.approve){const r=S.requests.splice(+t.dataset.approve,1)[0];
    S.books.push({id:Date.now(),title:r.title,author:r.author,genre:"Fiction",copies:1,pop:50,year:new Date().getFullYear()});toast("Added to collection.");save()}
  if(t.dataset.remove){const id=+t.dataset.remove;S.books=S.books.filter(b=>b.id!==id);S.loans=S.loans.filter(l=>l.id!==id);toast("Book removed.");save()}
});

$("reqForm").onsubmit=e=>{e.preventDefault();
  S.requests.push({title:$("rTitle").value.trim(),author:$("rAuthor").value.trim(),why:$("rWhy").value.trim()});
  e.target.reset();toast("Request sent.");save()};
$("addForm").onsubmit=e=>{e.preventDefault();
  S.books.push({id:Date.now(),title:$("aTitle").value.trim(),author:$("aAuthor").value.trim(),genre:$("aGenre").value,copies:Math.max(1,+$("aCopies").value||1),pop:50,year:new Date().getFullYear()});
  e.target.reset();$("aCopies").value=1;toast("Book added.");save()};

$("genre").innerHTML=["All genres",...GENRES].map(g=>`<option>${g}</option>`).join("");
$("aGenre").innerHTML=GENRES.map(g=>`<option>${g}</option>`).join("");
["q","genre","sort"].forEach(id=>$(id).addEventListener("input",render));
render();
