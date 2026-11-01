// Desktop regression check. No Android tools or network dependencies are used.
const { createServer } = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname, '../app/src/main/assets/home');
const output = process.env.TEMP;
const mime = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml' };
const server = createServer((req,res) => {
  const url = new URL(req.url, 'http://localhost');
  let name = decodeURIComponent(url.pathname).replace(/^\//,'');
  const baseline = name.startsWith('baseline/');
  if (baseline) name = name.slice(9);
  if (!name) name = 'index.html';
  if (name.includes('..')) { res.writeHead(403).end(); return; }
  try {
    const data = baseline ? execFileSync('git', ['show', 'HEAD:app/src/main/assets/home/' + name], {maxBuffer: 5e6, stdio:['ignore','pipe','ignore']}) : fs.readFileSync(path.join(root,name));
    res.writeHead(200, {'Content-Type':mime[path.extname(name)] || 'text/plain'}).end(data);
  } catch { res.writeHead(404).end(); }
});
(async () => {
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const browser = await chromium.launch({headless:true, executablePath:process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
  try {
    const context = await browser.newContext({viewport:{width:1920,height:1080}});
    await context.route(/^https:\/\//, route => {
      if (route.request().url().includes('tvhome.local/icon/')) return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#26394e"/><text x="75" y="95" fill="white">App banner</text></svg>'});
      return route.fulfill({headers:{'Access-Control-Allow-Origin':'*'},contentType:'application/json',body:JSON.stringify({current:{temperature_2m:62,weather_code:0,is_day:1},daily:{temperature_2m_max:[65],temperature_2m_min:[48],precipitation_probability_max:[5]}})});
    });
    await context.addInitScript(() => {
      window.launches = [];
      window.TV = {
        apps: () => JSON.stringify(['com.netflix.ninja','com.amazon.firebat','com.amazon.firetv.youtube','com.hbo.hbonow','com.peacocktv.peacockfiretv','com.apple.atve.amazon.appletv','com.cricbuzz.android.tv','com.fox.foxone'].map((pkg,i)=>({pkg,label:['Netflix','Prime Video','YouTube','HBO','Peacock','Apple TV','Cricbuzz','FOX ONE'][i],tv:i!==6}))),
        launch: pkg => { window.launches.push(pkg); return window.launchResult !== false; },
        openSettings: () => {}, openStockHome: () => {}
      };
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', message => { if (message.type()==='warning') console.log(message.text()); });
    const base = `http://127.0.0.1:${server.address().port}/`;
    await page.goto(base);
    await page.waitForTimeout(1600);
    await page.locator('#weather').waitFor({state:'visible',timeout:5000});
    assert.equal(await page.locator('#weather').isVisible(),true);
    assert.match(await page.locator('#weather-temp').textContent(),/62/);
    assert.notEqual((await page.locator('#time').textContent()).trim(),'--:--');
    const glass = await page.locator('#favorites .app').first().evaluate(el => {
      const s=getComputedStyle(el); return [s.width,s.height,s.border,s.backgroundColor,s.boxShadow,s.transform];
    });
    assert.equal(await page.locator('#itachi-stage').isVisible(),false);
    assert.equal(await page.locator('.sharingan-only').first().isVisible(),false);
    await page.screenshot({path:path.join(output,'launcher-glass.png')});
    await page.locator('#btn-theme').click();
    await page.waitForFunction(()=>document.body.dataset.theme==='sharingan');
    await page.locator('#favorites .app').first().focus();
    await page.waitForTimeout(1100);
    assert.equal(await page.locator('#favorites .app').count(),8);
    assert.equal(await page.locator('#weather').isVisible(),true);
    const row = await page.locator('#favorites .app').evaluateAll(els=>els.map(e=>({x:e.offsetLeft,y:e.offsetTop,w:e.offsetWidth, bg:getComputedStyle(e).backgroundImage, border:getComputedStyle(e).borderWidth})));
    assert.equal(new Set(row.map(e=>e.y)).size,1);
    assert(row.every(e=>e.x>=0 && e.x+e.w<=1920 && e.bg.includes('/logos/') && e.border==='0px'));
    const gaze = await page.locator('.sharingan-gaze').first().getAttribute('style');
    assert.equal(await page.locator('.sharingan-gaze .sharingan-iris-base').count(),2);
    assert.equal(await page.locator('.sharingan-spin image').count(),2);
    const readGaze = () => page.locator('.sharingan-gaze').evaluateAll(els => els.map(el => {
      const m = new DOMMatrix(getComputedStyle(el).transform);
      return {x:m.e,y:m.f,angle:Math.atan2(m.b,m.a)*180/Math.PI};
    }));
    assert((await readGaze()).every(m => m.x === -11 && m.y === 2 && m.angle === 0));
    await page.screenshot({path:path.join(output,'launcher-gaze-left.png')});
    await page.locator('#favorites .app').nth(3).focus();
    await page.waitForTimeout(230);
    assert((await readGaze()).every(m => Math.abs(m.x + 11 / 7) < .001 && m.angle === 0));
    await page.screenshot({path:path.join(output,'launcher-gaze-center.png')});
    await page.locator('#favorites .app').first().focus();
    // Both gaze groups must remain beneath stationary socket clips.
    assert.deepEqual(await page.locator('.sharingan-gaze').evaluateAll(els => els.map(el =>
      el.parentElement.parentElement.getAttribute('clip-path'))), ['url(#socket-left)','url(#socket-right)']);
    assert.equal(await page.locator('#itachi-expression').getAttribute('data-asset-status'),'required');
    assert.equal(await page.locator('#itachi-smirk').getAttribute('href'),null);
    for(let i=0;i<7;i++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(280); }
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.pkg),'com.fox.foxone');
    assert.notEqual(await page.locator('.sharingan-gaze').first().getAttribute('style'),gaze);
    await page.waitForTimeout(450);
    assert((await readGaze()).every(m => m.x === 11 && m.y === 2 && m.angle === 0));
    const dock = await page.locator('#favorites .app').evaluateAll(els => els.map(el => {
      const s = getComputedStyle(el);
      return {background:s.backgroundColor, shadow:s.boxShadow, scale:new DOMMatrix(s.transform).a,
        opacity:s.opacity, label:getComputedStyle(el.querySelector('.label')).opacity};
    }));
    assert(dock.every(s => s.background === 'rgba(0, 0, 0, 0)' && s.shadow === 'none'));
    assert(dock.slice(0,7).every(s => s.scale === .96 && s.opacity === '0.74' && s.label === '0'));
    assert.deepEqual(dock[7], {background:'rgba(0, 0, 0, 0)', shadow:'none', scale:1.2, opacity:'1', label:'1'});
    const glow = await page.evaluate(() => {
      const app = document.activeElement.getBoundingClientRect();
      const spot = document.getElementById('sharingan-spotlight').getBoundingClientRect();
      return {x:spot.x + spot.width/2 - app.x - app.width/2, y:spot.y + spot.height/2 - app.y - app.height/2};
    });
    assert(Math.abs(glow.x) < 1 && Math.abs(glow.y) < 1);
    assert.equal(await page.locator('.sharingan-spin').first().evaluate(el=>getComputedStyle(el).animationName),'none');
    assert.equal(await page.locator('#favorites .app:focus .label').textContent(),'FOX ONE');
    await page.screenshot({path:path.join(output,'launcher-sharingan.png')});
    await page.evaluate(()=>document.body.classList.add('sharingan-blink'));
    await page.evaluate(() => {
      document.querySelectorAll('.sharingan-lid-left,.sharingan-lid-right').forEach(el => {
        el.getAnimations().forEach(animation => { animation.pause(); animation.currentTime=100; });
      });
    });
    assert.match(await page.locator('#lid-curve-left').evaluate(el=>getComputedStyle(el).d),/483/);
    await page.screenshot({path:path.join(output,'launcher-blink.png')});
    await page.evaluate(()=>document.body.classList.remove('sharingan-blink'));
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>window.launches.length),0);
    await page.waitForTimeout(300);
    assert.deepEqual(await page.evaluate(()=>window.launches),['com.fox.foxone']);
    await page.evaluate(()=>window.onShow());
    assert.equal(await page.evaluate(()=>document.body.classList.contains('sharingan-launch')),false);
    assert.equal(await page.evaluate(()=>document.body.classList.contains('sharingan-wake')),true);
    const spin = await page.locator('.sharingan-spin').first().evaluate(el => {
      const animation=el.getAnimations()[0];
      return {frames:animation.effect.getKeyframes().map(f=>f.transform),iterations:animation.effect.getTiming().iterations};
    });
    assert.deepEqual(spin.frames,['rotate(-360deg)','rotate(0deg)']);
    assert.equal(spin.iterations,1);
    await page.locator('#btn-all').click();
    assert.equal(await page.locator('#all-section').isVisible(),true);
    await page.evaluate(()=>window.onBack());
    assert.equal(await page.locator('#favorites-section').isVisible(),true);
    await page.evaluate(()=>window.onHome());
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.pkg),'com.netflix.ninja');
    await page.evaluate(()=>{window.launchResult=false; document.activeElement.click();});
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(()=>document.body.classList.contains('sharingan-launch')),false);
    for(let i=0;i<3;i++) await page.locator('#btn-theme').click();
    await page.locator('#favorites .app').first().focus();
    await page.waitForTimeout(350);
    assert.equal(await page.evaluate(()=>document.body.dataset.theme),'glass');
    assert.equal(await page.locator('#itachi-stage').isVisible(),false);
    const restored = await page.locator('#favorites .app').first().evaluate(el=>{const s=getComputedStyle(el);return [s.width,s.height,s.border,s.backgroundColor,s.boxShadow,s.transform];});
    assert.deepEqual(restored,glass);
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>window.launches.length),3);
    const old = await context.newPage();
    await old.goto(base+'baseline/index.html');
    await old.waitForTimeout(1600);
    const original = await old.locator('#favorites .app').first().evaluate(el=>{const s=getComputedStyle(el);return [s.width,s.height,s.border,s.backgroundColor,s.boxShadow,s.transform];});
    assert.deepEqual(original,glass);
    await old.screenshot({path:path.join(output,'launcher-glass-original.png')});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.locator('#btn-theme').click();
    await page.locator('#favorites .app').last().focus();
    await page.waitForTimeout(450);
    assert.equal(await page.locator('.sharingan-gaze').first().evaluate(el=>getComputedStyle(el).transform),'none');
    assert.equal(await page.locator('.sharingan-spin').first().evaluate(el=>getComputedStyle(el).animationName),'none');
    await page.evaluate(()=>window.onHide());
    assert.equal(await page.evaluate(()=>document.body.classList.contains('sharingan-blink')),false);
    assert.deepEqual(errors,[]);
    console.log('PASS: original/restored Glass, logo row, remote/labels, full iris left/center/right gaze, fixed socket clips, missing mouth asset explicitly marked, curved blink, single wake spin, reduced motion, suspend, launch delay/deduplication/failure, All apps, Back, Home, themes, clock/weather; no JS errors.');
    console.log('Screenshots:', output);
  } finally { await browser.close(); server.close(); }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
