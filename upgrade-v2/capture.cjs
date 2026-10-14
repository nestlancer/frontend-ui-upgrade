const puppeteer=require('/home/user/.cache/nl-qa/node_modules/puppeteer-core');
const chromium=require('/home/user/.cache/nl-qa/node_modules/@sparticuz/chromium/build/index.js').default;
const fs=require('fs');
const paths=process.env.PATHS ? JSON.parse(fs.readFileSync(process.env.PATHS,'utf8')) : process.env.EXTRA ? ['apps/landing/portfolio/index.html','apps/web/projects/index.html'] : JSON.parse(fs.readFileSync('upgrade-v2/test-paths.json','utf8'));
(async()=>{const browser=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});
let phase=process.argv[2]||'baseline', results=[];
for(let i=0;i<paths.length;i++){const p=await browser.newPage();await p.setRequestInterception(true);p.on('request',r=>r.url().startsWith('http://localhost:8000')||r.url().startsWith('data:')?r.continue():r.abort());
for(const width of [1440,390]){await p.setViewport({width,height:960,deviceScaleFactor:1});await p.goto('http://localhost:8000/'+paths[i]);await new Promise(r=>setTimeout(r,1500));await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=650){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50))}window.scrollTo(0,0)});await new Promise(r=>setTimeout(r,900));await p.screenshot({path:`upgrade-v2/evidence/${phase}-${i}-${width}.webp`,type:'webp',quality:65,fullPage:true});results.push({path:paths[i],width,dimensions:await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}))});}await p.close();}
fs.writeFileSync(`upgrade-v2/evidence/${phase}-dimensions.json`,JSON.stringify(results,null,2));
if(phase==='baseline'){let p=await browser.newPage();for(const url of ['https://ui.aceternity.com/live-preview/timeline-demo','https://magicui.design/docs/components/animated-beam']){try{await p.goto(url,{timeout:15000});results.push({reference:url,title:await p.title()})}catch(e){results.push({reference:url,blocked:e.message})}}fs.writeFileSync('upgrade-v2/evidence/reference-browser-attempts.json',JSON.stringify(results.slice(-2),null,2));}
await browser.close();})();
