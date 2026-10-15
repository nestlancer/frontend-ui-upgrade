// Local browser QA. Install tools outside deliverables; see QA_REPORT for paths.
const puppeteer=require('/home/user/.cache/nl-qa/node_modules/puppeteer-core');
const chromium=require('/home/user/.cache/nl-qa/node_modules/@sparticuz/chromium/build/index.js').default;
const {AxePuppeteer}=require('/home/user/.cache/nl-qa/node_modules/@axe-core/puppeteer');
const fs=require('fs');
const paths=JSON.parse(fs.readFileSync('upgrade-v2/test-paths.json','utf8'));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});
 const results={browser:await browser.version(),layout:[],motion:[],interactions:[],accessibility:[],errors:[],visibility:[]};
 const page=await browser.newPage();
 page.on('pageerror',e=>results.errors.push({url:page.url(),error:e.message}));
 page.on('response',r=>{if(r.url().startsWith('http://localhost:8000')&&r.status()>=400)results.errors.push({url:r.url(),status:r.status()})});
 await page.setRequestInterception(true);page.on('request',r=>r.url().startsWith('http://localhost:8000')||r.url().startsWith('data:')?r.continue():r.abort());
 for(let i=0;i<paths.length;i++){
  const path=paths[i], url='http://localhost:8000/'+path;
  for(const theme of ['light','dark']) for(const width of ([0,1,2,5,7].includes(i)?[320,390,768,1440,1920]:[390,1440])){
   await page.setViewport({width,height:960,deviceScaleFactor:1});await page.goto(url,{waitUntil:'load'});
   await page.evaluate(t=>{document.documentElement.dataset.theme=t;localStorage.setItem('nl-theme',t)},theme);await page.evaluate(()=>document.fonts.ready);await wait(1000);
   results.layout.push({path,theme,width,...await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,images:[...document.images].filter(x=>x.loading!=='lazy'&&(!x.complete||x.naturalWidth===0)).map(x=>x.src),bodySize:getComputedStyle(document.body).fontSize,clipped:[...document.querySelectorAll('main p,main h1,main .btn,main dd')].filter(x=>x.clientWidth&&x.scrollWidth>x.clientWidth+2).map(x=>({text:x.textContent.trim().slice(0,70),width:x.clientWidth,scroll:x.scrollWidth})).slice(0,12)}))});
   if(width===390||width===1440){
    await page.screenshot({path:`upgrade-v2/evidence/qa-${i}-${theme}-${width}.webp`,type:'webp',quality:72});
    {const axe=await new AxePuppeteer(page).analyze(); results.accessibility.push({path,theme,width,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,15)}))});}
   }
  }
  await page.setViewport({width:1440,height:960});await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);await page.goto(url);await page.evaluate(()=>{document.documentElement.dataset.theme='light';localStorage.setItem('nl-theme','light')});await wait(100);
  const early=await page.evaluate(()=>document.getAnimations().map(a=>({name:a.animationName||'transition',target:a.effect?.target?.className,duration:a.effect?.getTiming().duration,playState:a.playState})));await wait(2200);
  const later=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').map(a=>a.animationName));
  const scroll=await page.evaluate(async()=>{const el=[...document.querySelectorAll('.reveal:not(.is-in)')].find(e=>!e.parentElement.closest('.reveal'));if(!el)return null;const before=el.className;el.scrollIntoView();await new Promise(r=>setTimeout(r,180));return{before,after:el.className,animations:el.getAnimations({subtree:true}).map(a=>a.animationName)}});
  results.motion.push({path,early,settledRunning:later,scroll});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await wait(100);
  results.visibility.push({path,mode:'live-reduced',...await visibility(page)});
  await page.goto(url);results.visibility.push({path,mode:'fresh-reduced',...await visibility(page)});
  await page.setJavaScriptEnabled(false);await page.goto(url);results.visibility.push({path,mode:'no-js',...await visibility(page)});await page.setJavaScriptEnabled(true);
 }
 // Deterministic state checks; do not submit to any backend.
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);await page.setViewport({width:390,height:960});
 await page.goto('http://localhost:8000/apps/landing/index.html');await page.click('[data-public-menu]');results.interactions.push({name:'mobile-menu-open',value:await page.$eval('[data-public-menu]',e=>e.getAttribute('aria-expanded'))});await page.keyboard.press('Escape');results.interactions.push({name:'menu-Escape-return-focus',value:await page.$eval('[data-public-menu]',e=>e===document.activeElement&&e.getAttribute('aria-expanded')==='false')});
 await page.goto('http://localhost:8000/apps/landing/services/index.html');await page.focus('.service-details summary');await page.keyboard.press('Enter');results.interactions.push({name:'service-disclosure-keyboard',closed:await page.$eval('.service-details',e=>!e.open)});
 await page.goto('http://localhost:8000/apps/landing/pricing/index.html');await page.focus('.faq-item summary');await page.keyboard.press('Enter');results.interactions.push({name:'faq-keyboard',open:await page.$eval('.faq-item',e=>e.open)});await page.screenshot({path:'upgrade-v2/evidence/pricing-faq-state.webp',type:'webp',quality:70});
 await page.goto('http://localhost:8000/apps/landing/login/index.html');await page.click('[data-demo-login] button[type=submit]');results.interactions.push({name:'login-required',value:await page.$eval('#nl-email',e=>!e.validity.valid)});await page.type('#nl-email','sample@example.test');await page.type('#nl-password','local-sample');await page.click('[data-password-toggle]');results.interactions.push({name:'password-toggle',value:await page.$eval('#nl-password',e=>e.type)});await page.click('[data-demo-login] button[type=submit]');results.interactions.push({name:'login-demo-only',url:page.url(),feedback:await page.$eval('#login-result',e=>e.textContent)});await page.screenshot({path:'upgrade-v2/evidence/login-local-state.webp',type:'webp',quality:70});
 await page.goto('http://localhost:8000/apps/admin/payments/01a10a2c-2d0e-7499-b769-967d17a42197/index.html');await page.click('[data-payment-action="Issue refund"]');await wait(80);results.interactions.push({name:'refund-dialog-open',value:await page.$eval('dialog',e=>({open:e.open,focusInside:e.contains(document.activeElement),animations:e.getAnimations().map(a=>a.animationName)}))});await page.click('[data-review-action]');results.interactions.push({name:'refund-preview',value:await page.$eval('[data-review-result]',e=>e.textContent)});await page.screenshot({path:'upgrade-v2/evidence/payment-dialog-state.webp',type:'webp',quality:70});await page.keyboard.press('Escape');results.interactions.push({name:'refund-Escape-return-focus',value:await page.$eval('[data-payment-action="Issue refund"]',e=>e===document.activeElement)});
 // New lane interactions: authored-data filters and process-stage controls.
 await page.goto('http://localhost:8000/apps/landing/services/index.html');await page.click('[data-process-step="Frontend + backend API"]');results.interactions.push({name:'process-stage',value:await page.$eval('#process-detail',e=>e.textContent)});
 await page.goto('http://localhost:8000/apps/landing/portfolio/index.html');await page.type('#work-search','Fitness');results.interactions.push({name:'portfolio-filter',value:await page.$$eval('[data-local-item]:not([hidden])',es=>es.map(e=>e.querySelector('h2').textContent))});
 await page.goto('http://localhost:8000/apps/web/projects/index.html');await page.select('#project-status','On hold');results.interactions.push({name:'project-empty-filter',value:await page.$eval('[data-local-result]',e=>e.textContent),visible:await page.$$eval('[data-local-item]:not([hidden])',es=>es.length)});await page.screenshot({path:'upgrade-v2/evidence/projects-empty-state.webp',type:'webp',quality:70});await page.select('#project-status','');results.interactions.push({name:'project-filter-reset',visible:await page.$$eval('[data-local-item]:not([hidden])',es=>es.length)});
 fs.writeFileSync('upgrade-v2/evidence/browser-qa.json' ,JSON.stringify(results,null,2));console.log(JSON.stringify({layouts:results.layout.length,overflow:results.layout.filter(x=>x.scroll>x.width+2),clipping:results.layout.filter(x=>x.clipped.length),errors:results.errors,axe:results.accessibility.map(x=>({path:x.path,width:x.width,violations:x.violations.map(v=>v.id)})),interactions:results.interactions},null,2));await browser.close();
})();
async function visibility(page){return page.evaluate(()=>({hiddenEssential:[...document.querySelectorAll('main h1,main .reveal')].filter(e=>getComputedStyle(e).opacity==='0'&&!e.closest('details:not([open])')).length,running:document.getAnimations().filter(a=>a.playState==='running').map(a=>a.animationName)}))}
