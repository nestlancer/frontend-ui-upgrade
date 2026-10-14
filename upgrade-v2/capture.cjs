const puppeteer=require('/home/user/.cache/nl-qa/node_modules/puppeteer-core');
const chromium=require('/home/user/.cache/nl-qa/node_modules/@sparticuz/chromium/build/index.js').default;
const fs=require('fs');
const paths=process.env.PATHS ? JSON.parse(fs.readFileSync(process.env.PATHS,'utf8')) : process.env.EXTRA ? ['apps/landing/portfolio/index.html','apps/web/projects/index.html'] : JSON.parse(fs.readFileSync('upgrade-v2/test-paths.json','utf8'));
(async()=>{const browser=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});
let phase=process.argv[2]||'baseline', results=[];
for(let i=0;i<paths.length;i++){const p=await browser.newPage();await p.setRequestInterception(true);p.on('request',r=>r.url().startsWith('http://localhost:8000')||r.url().startsWith('data:')?r.continue():r.abort());
for(const width of [1440,390]){await p.setViewport({width,height:960,deviceScaleFactor:1});await p.goto('http://localhost:8000/'+paths[i]);await new Promise(r=>setTimeout(r,1500));await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=650){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50))}window.scrollTo(0,0)});await new Promise(r=>setTimeout(r,900));const captureMode=await captureFull(p,`upgrade-v2/evidence/${phase}-${i}-${width}.webp`);results.push({path:paths[i],width,captureMode,dimensions:await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}))});}await p.close();}
fs.writeFileSync(`upgrade-v2/evidence/${phase}-dimensions.json`,JSON.stringify(results,null,2));
if(phase==='baseline'){let p=await browser.newPage();for(const url of ['https://ui.aceternity.com/live-preview/timeline-demo','https://magicui.design/docs/components/animated-beam']){try{await p.goto(url,{timeout:15000});results.push({reference:url,title:await p.title()})}catch(e){results.push({reference:url,blocked:e.message})}}fs.writeFileSync('upgrade-v2/evidence/reference-browser-attempts.json',JSON.stringify(results.slice(-2),null,2));}
await browser.close();})();

// Chromium's full-page compositor can repeat top-of-page tiles above 8192px.
// For long documents capture real scrolled viewports and stitch them losslessly;
// sticky chrome is shown only in the first tile, never overlaid on later text.
async function captureFull(page,path){
 const height=await page.evaluate(()=>document.documentElement.scrollHeight);
 if(height<7500){await page.screenshot({path,type:'webp',quality:65,fullPage:true});return 'full-page';}
 const {execFileSync}=require('child_process');
 const dir='/home/user/.cache/nl-qa/capture-'+process.pid;fs.mkdirSync(dir,{recursive:true});
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
 const tiles=[];let hideChrome;const width=page.viewport().width,step=page.viewport().height;
 for(let y=0;y<height;y+=step){
  if(y===step)hideChrome=await page.addStyleTag({content:'.mkt-header,#fab { visibility:hidden!important; }'});
  await page.evaluate(top=>window.scrollTo(0,top),y);await new Promise(r=>setTimeout(r,100));
  const actual=await page.evaluate(()=>scrollY),file=dir+'/'+y+'.png';await page.screenshot({path:file,type:'png'});
  tiles.push({file,top:y,offset:y-actual,height:Math.min(step,height-y)});
 }
 const meta=dir+'/tiles.json';fs.writeFileSync(meta,JSON.stringify({width,height,tiles,path}));
 execFileSync('/home/user/.cache/nl-qa/venv/bin/python',['-c',`import json,sys
from PIL import Image
r=json.load(open(sys.argv[1])); out=Image.new('RGB',(r['width'],r['height']))
for t in r['tiles']:
 im=Image.open(t['file']); out.paste(im.crop((0,t['offset'],r['width'],t['offset']+t['height'])),(0,t['top']))
out.save(r['path'],quality=65)`,meta]);
 if(hideChrome)await hideChrome.dispose();await page.evaluate(()=>scrollTo(0,0));
 await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);return 'stitched-viewport; settled reduced motion; sticky chrome first tile only';
}
