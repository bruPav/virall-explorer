import { chromium } from 'playwright-core';
const executablePath='/home/bruno/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';
const base='http://127.0.0.1:4173';
const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
const errors=[];
function watch(page,name){page.on('console',m=>{if(m.type()==='error') errors.push(`[${name}] ${m.text()}`)});page.on('pageerror',e=>errors.push(`[${name}] ${e.message}`));}

// Mobile sample selection scroll
{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,colorScheme:'dark'});
  const p=await ctx.newPage(); watch(p,'samples-mobile');
  await p.goto(`${base}/explore?tab=samples`,{waitUntil:'networkidle'});
  await p.waitForTimeout(500);
  const initialHeader=await p.locator('text=Flight 10 · D1').count();
  if(!initialHeader) errors.push('[samples-mobile] default F10 D1 detail missing');
  await p.getByRole('button',{name:/D2.*F10/i}).first().scrollIntoViewIfNeeded();
  await p.getByRole('button',{name:/D2.*F10/i}).first().click();
  await p.waitForTimeout(900);
  const url=p.url();
  const detailVisible=await p.locator('text=Flight 10 · D2').first().isVisible();
  const box=await p.locator('text=Flight 10 · D2').first().boundingBox();
  const inView=box ? box.y>=0 && box.y<844 : false;
  if(!url.includes('sample=F10_D2')) errors.push(`[samples-mobile] url not updated: ${url}`);
  if(!detailVisible||!inView) errors.push(`[samples-mobile] detail not scrolled into view: ${JSON.stringify(box)}`);
  await ctx.close();
}

// Species default/nonviral and CSV
{
  const ctx=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark',acceptDownloads:true});
  const p=await ctx.newPage(); watch(p,'species');
  await p.goto(`${base}/explore?tab=species`,{waitUntil:'networkidle'});
  await p.waitForTimeout(400);
  const footer=await p.locator('text=/1–50 of 813/').count();
  if(!footer) errors.push('[species] default should show 1–50 of 813');
  await p.getByRole('button',{name:'Non-viral'}).click();
  await p.waitForTimeout(300);
  const nv=await p.locator('text=/1–6 of 6/').count();
  if(!nv) errors.push('[species] non-viral filter should show 6 rows');
  const hasStrep=await p.locator('text=Streptococcus thermophilus').count();
  if(!hasStrep) errors.push('[species] non-viral table missing Streptococcus thermophilus');
  const [download]=await Promise.all([
    p.waitForEvent('download'),
    p.getByRole('button',{name:/download filtered species/i}).click(),
  ]);
  if(download.suggestedFilename()!=='virall-species.csv') errors.push(`[species] bad csv name ${download.suggestedFilename()}`);
  await ctx.close();
}

// Validation filter + CSV
{
  const ctx=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark',acceptDownloads:true});
  const p=await ctx.newPage(); watch(p,'validation');
  await p.goto(`${base}/validation`,{waitUntil:'networkidle'});
  await p.getByRole('button',{name:'DNA viruses'}).click();
  await p.waitForTimeout(300);
  const dnaRows=await p.locator('tbody tr').count();
  if(dnaRows!==24) errors.push(`[validation] DNA filter should show 24 rows, got ${dnaRows}`);
  const [download]=await Promise.all([
    p.waitForEvent('download'),
    p.getByRole('button',{name:/export csv/i}).click(),
  ]);
  if(download.suggestedFilename()!=='virall-validation.csv') errors.push(`[validation] bad csv name ${download.suggestedFilename()}`);
  await ctx.close();
}

// Taxonomy keyboard drill
{
  const ctx=await browser.newContext({viewport:{width:1440,height:900},colorScheme:'dark'});
  const p=await ctx.newPage(); watch(p,'taxonomy');
  await p.goto(`${base}/explore?tab=taxonomy`,{waitUntil:'networkidle'});
  await p.waitForTimeout(500);
  const path=p.locator('path[role="button"]').first();
  await path.focus();
  await path.press('Enter');
  await p.waitForTimeout(300);
  const crumb=await p.locator('text=Bacterial viruses').count();
  if(!crumb) errors.push('[taxonomy] keyboard drill did not update breadcrumb');
  await ctx.close();
}

await browser.close();
console.log('Interaction errors:',errors.length);
for(const e of errors) console.log(' -',e);
