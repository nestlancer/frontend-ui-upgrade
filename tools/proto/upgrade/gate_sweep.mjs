/**
 * gate_sweep.mjs — sweep every manifest page against the verification gates.
 *
 * Checks, per page:
 *   h1            exactly one h1 (the prompt requires one h1 per page)
 *   headings      no skipped heading level (h1 -> h2 -> h3)
 *   minFont       no rendered text below 11px
 *   targets       interactive controls >= 44px at 390px width
 *   images        every <img> has an alt attribute
 *   labels        every input/select/textarea has a label or aria-label
 *   overflow      0 horizontal overflow at 1440px and 390px
 *   reduced       with prefers-reduced-motion: reduce forced, nothing is left
 *                 mid-animation (no non-none animation running on entry)
 *   theme         forcing light and dark changes both --bg-app and the body surface
 *   keyboard      first Tab reaches the skip link; Enter focuses the unique main
 *                 target and both focus states have a visible ring
 *   interactions  every theme toggle works by keyboard and persists; closed
 *                 mobile navigation is inert, opens/closes with focus and ARIA
 *                 updates; native dialog opens and closes with focus restored
 *
 * Default scope is the screenshot-mapped pages in pairs.json. `--all` adds
 * every proto index.html, including the sign-off hub and ungraded state routes;
 * `--only=route1,route2` runs a fast targeted regression subset.
 *
 * Usage (from the scratch dir that owns node_modules):
 *   cp tools/proto/upgrade/gate_sweep.mjs /tmp/shot/
 *   cd /tmp/shot && PROTO_BASE=http://127.0.0.1:8765/ LD_LIBRARY_PATH=/tmp/nsswrap/lib node gate_sweep.mjs --all
 */
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE = process.env.PROTO_BASE || 'http://127.0.0.1:8765/';
// Default: the pages that carry a screenshot (pairs.json). `--all` adds every
// other proto page, so the state/template routes are held to the same gates.
const ROOT = '/home/user/frontend-ui-upgrade/proto';
const pairs = JSON.parse(fs.readFileSync('/home/user/grade/pairs.json', 'utf8'));
const graded = [...new Set(pairs.map(p => p.proto))].filter(Boolean).sort();
let pages = graded;
if (process.argv.includes('--all')) {
  const ROOT_PAGE = '__proto_root__';
  const walk = (dir, base = '') => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const rel = base ? base + '/' + e.name : e.name;
    if (e.isDirectory()) return walk(dir + '/' + e.name, rel);
    return e.name === 'index.html' ? [base || ROOT_PAGE] : [];
  });
  pages = [...new Set([...walk(ROOT), ...graded])].sort();
}
const onlyArg = process.argv.find(arg => arg.startsWith('--only='));
if (onlyArg) {
  const wanted = new Set(onlyArg.slice('--only='.length).split(',').filter(Boolean));
  pages = pages.filter(p => wanted.has(p === '__proto_root__' ? 'index.html' : p));
}


const PROBE = `(() => {
  const vis = el => { const s = getComputedStyle(el); const b = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0; };
  const out = { h1: 0, skips: [], minFont: 99, small: 0, targets: [], imgs: 0, noAlt: 0, fields: 0, unlabeled: 0,
                ov: document.documentElement.scrollWidth - window.innerWidth };
  const root = document.documentElement;
  const originalTheme = root.getAttribute('data-theme');
  root.setAttribute('data-theme', 'light');
  const lightCanvas = getComputedStyle(root).getPropertyValue('--bg-app').trim();
  const lightSurface = getComputedStyle(document.body).backgroundColor;
  root.setAttribute('data-theme', 'dark');
  const darkCanvas = getComputedStyle(root).getPropertyValue('--bg-app').trim();
  const darkSurface = getComputedStyle(document.body).backgroundColor;
  out.darkTheme = !!darkCanvas && darkCanvas !== lightCanvas && darkSurface !== lightSurface;
  if (originalTheme === null) root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', originalTheme);
  out.h1 = [...document.querySelectorAll('h1')].filter(vis).length;
  let prev = 0;
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis);
  for (const h of hs) {
    const lvl = +h.tagName[1];
    if (prev && lvl > prev + 1) out.skips.push(prev + '->' + lvl + ' (' + h.innerText.trim().slice(0, 28) + ')');
    prev = lvl;
  }
  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el)) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const txt = [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim().length > 1);
    if (txt && fs) { if (fs < out.minFont) out.minFont = fs; if (fs < 11) out.small++; }
  }
  for (const el of document.querySelectorAll('a.btn, button, .btn, .icobtn, .tab, .chip, input, select, textarea, a.link')) {
    if (!vis(el)) continue;
    // Controls hidden from assistive tech (aria-hidden proxy inputs, tabindex=-1)
    // are not reachable targets; the visible control that drives them is measured.
    if (el.getAttribute('aria-hidden') === 'true' || el.getAttribute('tabindex') === '-1') continue;
    const cs = getComputedStyle(el);
    const r0 = el.getBoundingClientRect();
    // A checkbox/radio is as big as the box that carries it: if it lives inside a
    // label (or has one), measure that, which is what the user actually taps.
    let r = r0;
    if (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio')) {
      const carrier = el.closest('label') || (el.id && document.querySelector('label[for="' + el.id + '"]'));
      if (carrier) r = carrier.getBoundingClientRect();
    }
    // WCAG 2.5.8 exempts links that sit inline in a sentence. Rather than
    // guessing from the container's class, test it: a link is inline when the
    // block around it carries other text of its own.
    if (el.tagName === 'A') {
      const host = el.parentElement;
      const mine = (el.innerText || '').trim();
      const theirs = host ? (host.innerText || '').trim() : '';
      if (host && theirs.length > mine.length + 6) continue;
    }
    if (cs.position === 'absolute' && r.width < 3) continue;
    if (r.height < 44 && r.height > 1) out.targets.push(((el.className || '').toString().split(' ').slice(0,2).join('.') || el.tagName.toLowerCase()) + '@' + Math.round(r.height));
  }
  const imgs = [...document.images];
  out.imgs = imgs.length; out.noAlt = imgs.filter(i => !i.hasAttribute('alt')).length;
  for (const f of document.querySelectorAll('input, select, textarea')) {
    if (['hidden', 'submit', 'button'].includes(f.type)) continue;
    out.fields++;
    const id = f.id;
    const labelled = (id && document.querySelector('label[for="' + id + '"]'))
      || f.getAttribute('aria-label') || f.getAttribute('aria-labelledby')
      || f.closest('label') || f.getAttribute('title') || f.getAttribute('placeholder');
    if (!labelled) out.unlabeled++;
  }
  return out;
})()`;

const browser = await puppeteer.launch({
  executablePath: await chromium.executablePath(), args: chromium.args, headless: true,
  defaultViewport: { width: 1440, height: 900 },
});

const fails = [];
let checked = 0;
let themeRoutesChecked = 0, themeControlsChecked = 0;
let mobileNavRoutesChecked = 0, dialogRoutesChecked = 0;
for (const p of pages) {
  const page = await browser.newPage();
  const pageName = p === '__proto_root__' ? 'index.html' : p;
  const route = p === '__proto_root__' ? '' : p + '/';
  const row = { page: pageName };
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise(r => setTimeout(r, 300));
    const d = await page.evaluate(PROBE);
    Object.assign(row, d);

    // Exercise a real keyboard activation on every route and verify that the
    // persisted theme, pressed state, and visible FAB-menu label stay in sync.
    row.themeKeyboard = [];
    const themeControlCount = await page.evaluate(() => document.querySelectorAll('[data-theme-toggle]').length);
    row.themeControls = themeControlCount;
    if (themeControlCount) {
      themeRoutesChecked++;
      themeControlsChecked += themeControlCount;
      await page.evaluate(() => {
        if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
      });
      let themeFocused = false;
      let menuOpenedByTab = false;
      for (let i = 0; i < 400; i++) {
        await page.keyboard.press('Tab');
        const focusState = await page.evaluate(() => {
          const el = document.activeElement;
          const s = el && getComputedStyle(el), r = el && el.getBoundingClientRect();
          const visible = !!el && s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
          return { theme: visible && el.matches('[data-theme-toggle]'), fab: visible && el.matches('.fab-btn') };
        });
        if (focusState.theme) { themeFocused = true; break; }
        if (focusState.fab && !menuOpenedByTab) {
          // Some public/auth surfaces only expose the visible theme label in
          // the prototype menu, so open it with the actual keyboard path.
          await page.keyboard.press('Enter');
          menuOpenedByTab = true;
        }
      }
      if (!themeFocused) row.themeKeyboard.push('no visible theme toggle reached within 400 Tab presses');
      else {
        const beforeTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'light');
        const expectedTheme = beforeTheme === 'dark' ? 'light' : 'dark';
        await page.keyboard.press('Space');
        const toggled = await page.evaluate(expected => {
          const controls = [...document.querySelectorAll('[data-theme-toggle]')];
          const labels = [...document.querySelectorAll('[data-theme-label]')];
          return {
            theme: document.documentElement.getAttribute('data-theme') || 'light',
            stored: localStorage.getItem('nl-theme'),
            allPressed: controls.length > 0 && controls.every(b => b.getAttribute('aria-pressed') === String(expected === 'dark')),
            labelCount: labels.length,
            labelsMatch: labels.every(n => n.textContent.trim() === (expected === 'dark' ? 'Dark' : 'Light')),
          };
        }, expectedTheme);
        if (toggled.theme !== expectedTheme) row.themeKeyboard.push('Space did not switch the document theme');
        if (toggled.stored !== expectedTheme) row.themeKeyboard.push('theme choice was not saved to localStorage');
        if (!toggled.allPressed) row.themeKeyboard.push('aria-pressed did not match the active theme on every toggle');
        if (!toggled.labelCount || !toggled.labelsMatch) row.themeKeyboard.push('theme label text did not update on every route control');

        const fabState = await page.evaluate(() => {
          const b = document.querySelector('.fab-btn'), fab = document.querySelector('.fab');
          if (!b || !fab) return { ready: false, open: false };
          b.focus({ preventScroll: true });
          return { ready: document.activeElement === b, open: fab.classList.contains('open') };
        });
        if (!fabState.ready) row.themeKeyboard.push('prototype menu opener was not focusable for the visible label check');
        else if (!fabState.open) await page.keyboard.press('Enter');
        const visibleLabel = await page.evaluate(expected => {
          const fab = document.querySelector('.fab');
          const labels = [...document.querySelectorAll('[data-theme-label]')];
          const shown = labels.filter(n => {
            const s = getComputedStyle(n), r = n.getBoundingClientRect();
            return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
          });
          return {
            menuOpen: !!fab && fab.classList.contains('open'),
            visibleCount: shown.length,
            matches: shown.length > 0 && shown.every(n => n.textContent.trim() === (expected === 'dark' ? 'Dark' : 'Light')),
          };
        }, expectedTheme);
        if (!visibleLabel.menuOpen || !visibleLabel.visibleCount || !visibleLabel.matches)
          row.themeKeyboard.push('theme label was not visibly updated in the opened keyboard menu');

        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 150));
        const persisted = await page.evaluate(expected => {
          const controls = [...document.querySelectorAll('[data-theme-toggle]')];
          const labels = [...document.querySelectorAll('[data-theme-label]')];
          return {
            theme: document.documentElement.getAttribute('data-theme') || 'light',
            stored: localStorage.getItem('nl-theme'),
            allPressed: controls.length > 0 && controls.every(b => b.getAttribute('aria-pressed') === String(expected === 'dark')),
            labelsMatch: labels.length > 0 && labels.every(n => n.textContent.trim() === (expected === 'dark' ? 'Dark' : 'Light')),
          };
        }, expectedTheme);
        if (persisted.theme !== expectedTheme || persisted.stored !== expectedTheme)
          row.themeKeyboard.push('theme choice did not persist across reload');
        if (!persisted.allPressed) row.themeKeyboard.push('aria-pressed was incorrect after theme restoration');
        if (!persisted.labelsMatch) row.themeKeyboard.push('theme label was incorrect after theme restoration');
      }
    } else row.themeKeyboard.push('no theme control found on route');

    // Exercise the one native dialog through its keyboard opener and native
    // Escape behavior, including the browser's focus restoration contract.
    const dialogInfo = await page.evaluate(() => ({
      openers: document.querySelectorAll('[data-dialog-open]').length,
      dialogs: document.querySelectorAll('dialog').length,
    }));
    if (dialogInfo.openers || dialogInfo.dialogs) {
      dialogRoutesChecked++;
      row.dialogKeyboard = [];
      if (dialogInfo.openers !== 1 || dialogInfo.dialogs !== 1)
        row.dialogKeyboard.push(`expected one dialog opener and one native dialog; found ${dialogInfo.openers}/${dialogInfo.dialogs}`);
      const openerReady = await page.evaluate(() => {
        const opener = document.querySelector('[data-dialog-open]');
        if (!opener) return false;
        window.__gateDialogOpener = opener;
        opener.focus({ preventScroll: true });
        return document.activeElement === opener;
      });
      if (!openerReady) row.dialogKeyboard.push('dialog opener could not receive focus');
      else {
        await page.keyboard.press('Enter');
        const opened = await page.evaluate(() => {
          const opener = window.__gateDialogOpener;
          const id = opener && opener.getAttribute('data-dialog-open');
          const dialog = id && document.getElementById(id);
          return !!dialog && dialog.open && dialog.matches(':modal') && dialog.contains(document.activeElement);
        });
        if (!opened) row.dialogKeyboard.push('Enter did not open a modal dialog and move focus inside it');
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 30));
        const closed = await page.evaluate(() => {
          const opener = window.__gateDialogOpener;
          const id = opener && opener.getAttribute('data-dialog-open');
          const dialog = id && document.getElementById(id);
          return !!dialog && !dialog.open && document.activeElement === opener;
        });
        if (!closed) row.dialogKeyboard.push('Escape did not close the dialog and restore opener focus');
      }
    }

    // Reset the browser's sequential-focus starting point after the interaction
    // probes, so this remains a first-Tab-from-load test on every route.
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 100));

    // Exercise the real keyboard path, not just the anchor markup. A valid skip
    // link should be first in the tab order, and Enter should move focus to the
    // named main landmark (tabindex=-1 keeps it out of the regular tab order).
    const skipStart = await page.evaluate(() => {
      const links = [...document.querySelectorAll('a.skip-link')];
      const link = links[0];
      const href = link?.getAttribute('href') || '';
      const id = href.startsWith('#') ? decodeURIComponent(href.slice(1)) : '';
      const targets = id ? [...document.querySelectorAll(`[id="${CSS.escape(id)}"]`)] : [];
      const target = targets[0];
      const r = target?.getBoundingClientRect();
      const s = target && getComputedStyle(target);
      return {
        count: links.length, href, targetCount: targets.length,
        targetTag: target?.tagName || '', targetTabindex: target?.getAttribute('tabindex'),
        targetVisible: !!target && s.display !== 'none' && s.visibility !== 'hidden' && !!r?.width && !!r?.height,
      };
    });
    await page.evaluate(() => {
      if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
    });
    await page.keyboard.press('Tab');
    const skipFocus = await page.evaluate(() => {
      const el = document.activeElement, s = getComputedStyle(el);
      return { isSkip: el.matches('a.skip-link'), focusVisible: el.matches(':focus-visible'),
        outline: s.outlineStyle, outlineWidth: parseFloat(s.outlineWidth) || 0,
        rect: el.getBoundingClientRect().toJSON() };
    });
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 40));
    const skipLanding = await page.evaluate(() => {
      const el = document.activeElement, target = document.getElementById('main'), s = getComputedStyle(el);
      return { hash: location.hash, isMain: el === target, focusVisible: el.matches(':focus-visible'),
        outline: s.outlineStyle, outlineWidth: parseFloat(s.outlineWidth) || 0 };
    });
    row.keyboard = [];
    if (skipStart.count !== 1) row.keyboard.push(`skip-link count=${skipStart.count}`);
    if (skipStart.href !== '#main') row.keyboard.push(`skip-link href=${skipStart.href || '(missing)'}`);
    if (skipStart.targetCount !== 1 || skipStart.targetTag !== 'MAIN' || skipStart.targetTabindex !== '-1' || !skipStart.targetVisible)
      row.keyboard.push('skip-link target is not one visible, focusable main landmark');
    if (!skipFocus.isSkip) row.keyboard.push('first Tab did not focus the skip link');
    if (!skipFocus.focusVisible || skipFocus.outline === 'none' || skipFocus.outlineWidth < 2 || skipFocus.rect.width < 1)
      row.keyboard.push('skip-link focus ring is not visible');
    if (skipLanding.hash !== '#main' || !skipLanding.isMain) row.keyboard.push('Enter did not focus #main');
    if (!skipLanding.focusVisible || skipLanding.outline === 'none' || skipLanding.outlineWidth < 2)
      row.keyboard.push('main focus ring is not visible after skip');

    await page.evaluate(() => {
      if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    });
    await page.setViewport({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 200));

    // At phone width, the closed off-canvas links must be inert and absent
    // from the Tab sequence. Exercise open, Escape, focus restoration, and
    // both directions of responsive breakpoint synchronization per nav route.
    const navToggleCount = await page.evaluate(() => document.querySelectorAll('[data-sb-toggle]').length);
    row.mobileNavToggles = navToggleCount;
    if (navToggleCount) {
      mobileNavRoutesChecked++;
      row.mobileNavKeyboard = [];
      const closedStart = await page.evaluate(() => {
        const aside = document.querySelector('.sidebar');
        const toggles = [...document.querySelectorAll('[data-sb-toggle]')];
        return {
          inert: !!aside && aside.hasAttribute('inert'),
          expandedClosed: toggles.length > 0 && toggles.every(b => b.getAttribute('aria-expanded') === 'false'),
          labelsOpen: toggles.length > 0 && toggles.every(b => b.getAttribute('aria-label') === 'Open navigation'),
        };
      });
      if (!closedStart.inert) row.mobileNavKeyboard.push('closed mobile sidebar was not inert');
      if (!closedStart.expandedClosed || !closedStart.labelsOpen) row.mobileNavKeyboard.push('closed navigation ARIA state was not reset');

      await page.evaluate(() => {
        if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
      });
      await page.keyboard.press('Tab');
      const firstMobileTab = await page.evaluate(() => ({
        skip: document.activeElement.matches('a.skip-link'),
        insideSidebar: !!document.activeElement.closest('.sidebar'),
      }));
      await page.keyboard.press('Tab');
      const secondMobileTab = await page.evaluate(() => ({
        toggle: document.activeElement.matches('[data-sb-toggle]'),
        insideSidebar: !!document.activeElement.closest('.sidebar'),
      }));
      if (!firstMobileTab.skip || firstMobileTab.insideSidebar)
        row.mobileNavKeyboard.push('first mobile Tab did not pass the skip link without entering the closed sidebar');
      if (!secondMobileTab.toggle || secondMobileTab.insideSidebar)
        row.mobileNavKeyboard.push('closed sidebar links were not skipped before the navigation opener');

      const navOpenerReady = await page.evaluate(() => {
        let opener = document.activeElement;
        if (!opener.matches('[data-sb-toggle]')) opener = document.querySelector('[data-sb-toggle]');
        if (!opener) return false;
        window.__gateNavOpener = opener;
        opener.focus({ preventScroll: true });
        return document.activeElement === opener;
      });
      if (!navOpenerReady) row.mobileNavKeyboard.push('mobile navigation opener could not receive focus');
      else {
        await page.keyboard.press('Enter');
        const openedNav = await page.evaluate(() => {
          const aside = document.querySelector('.sidebar');
          const toggles = [...document.querySelectorAll('[data-sb-toggle]')];
          return {
            open: document.getElementById('app-shell')?.classList.contains('sb-open'),
            notInert: !!aside && !aside.hasAttribute('inert'),
            expanded: toggles.length > 0 && toggles.every(b => b.getAttribute('aria-expanded') === 'true'),
            closeLabels: toggles.length > 0 && toggles.every(b => b.getAttribute('aria-label') === 'Close navigation'),
            focusInNav: !!document.activeElement.closest('.sidebar .sb-item'),
          };
        });
        if (!openedNav.open || !openedNav.notInert || !openedNav.expanded || !openedNav.closeLabels || !openedNav.focusInNav)
          row.mobileNavKeyboard.push('Enter did not open navigation, update ARIA, and focus a navigation item');

        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 25));
        const closedNav = await page.evaluate(() => {
          const aside = document.querySelector('.sidebar');
          const toggles = [...document.querySelectorAll('[data-sb-toggle]')];
          return {
            open: document.getElementById('app-shell')?.classList.contains('sb-open'),
            inert: !!aside && aside.hasAttribute('inert'),
            expandedClosed: toggles.length > 0 && toggles.every(b => b.getAttribute('aria-expanded') === 'false'),
            openLabels: toggles.length > 0 && toggles.every(b => b.getAttribute('aria-label') === 'Open navigation'),
            focusReturned: document.activeElement === window.__gateNavOpener,
          };
        });
        if (closedNav.open || !closedNav.inert || !closedNav.expandedClosed || !closedNav.openLabels || !closedNav.focusReturned)
          row.mobileNavKeyboard.push('Escape did not close the drawer, reset ARIA/inert, and restore opener focus');

        await page.setViewport({ width: 1024, height: 900 });
        await new Promise(r => setTimeout(r, 60));
        const desktopClosed = await page.evaluate(() => {
          const aside = document.querySelector('.sidebar');
          const toggles = [...document.querySelectorAll('[data-sb-toggle]')];
          return {
            inert: !!aside && aside.hasAttribute('inert'),
            expandedClosed: toggles.length > 0 && toggles.every(b => b.getAttribute('aria-expanded') === 'false'),
            notOnHiddenToggle: !document.activeElement.matches('[data-sb-toggle]'),
          };
        });
        if (desktopClosed.inert || !desktopClosed.expandedClosed || !desktopClosed.notOnHiddenToggle)
          row.mobileNavKeyboard.push('desktop breakpoint did not clear mobile inert/ARIA state or left focus on a hidden toggle');

        await page.evaluate(() => {
          const first = document.querySelector('.sidebar .sb-item');
          if (first) first.focus({ preventScroll: true });
        });
        await page.setViewport({ width: 390, height: 844 });
        await new Promise(r => setTimeout(r, 60));
        const phoneClosedAgain = await page.evaluate(() => {
          const aside = document.querySelector('.sidebar');
          const toggle = document.querySelector('[data-sb-toggle]');
          return !!aside && aside.hasAttribute('inert') && document.activeElement === toggle;
        });
        if (!phoneClosedAgain) row.mobileNavKeyboard.push('returning to phone width did not inert the closed rail and focus its opener');

        await page.keyboard.press('Enter');
        await page.setViewport({ width: 1024, height: 900 });
        await new Promise(r => setTimeout(r, 60));
        const desktopFromOpen = await page.evaluate(() => {
          const aside = document.querySelector('.sidebar');
          const first = aside && aside.querySelector('.sb-item');
          const toggles = [...document.querySelectorAll('[data-sb-toggle]')];
          return {
            closed: !document.getElementById('app-shell')?.classList.contains('sb-open'),
            inert: !!aside && aside.hasAttribute('inert'),
            expandedClosed: toggles.length > 0 && toggles.every(b => b.getAttribute('aria-expanded') === 'false'),
            focusInRail: !!first && document.activeElement === first,
          };
        });
        if (!desktopFromOpen.closed || desktopFromOpen.inert || !desktopFromOpen.expandedClosed || !desktopFromOpen.focusInRail)
          row.mobileNavKeyboard.push('desktop resize while open did not close navigation into the visible rail');

        await page.setViewport({ width: 390, height: 844 });
        await new Promise(r => setTimeout(r, 60));
        const finalPhone = await page.evaluate(() => {
          const aside = document.querySelector('.sidebar');
          const toggle = document.querySelector('[data-sb-toggle]');
          return !!aside && aside.hasAttribute('inert') && document.activeElement === toggle
            && !document.getElementById('app-shell')?.classList.contains('sb-open');
        });
        if (!finalPhone) row.mobileNavKeyboard.push('closed navigation did not resynchronize after the final breakpoint change');
      }
    }

    const m = await page.evaluate(PROBE);
    row.mobileOverflow = m.ov;
    row.mobileTargets = m.targets;
    // reduced motion: force the preference and confirm nothing is animating in
    await page.setViewport({ width: 1440, height: 900 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 200));
    row.animating = await page.evaluate(() =>
      [...document.querySelectorAll('body *')].filter(el => {
        const s = getComputedStyle(el);
        return s.animationName !== 'none' && s.animationDuration !== '0s';
      }).length);
    checked++;
  } catch (e) { row.error = String(e.message).slice(0, 90); }
  await page.close();

  const problems = [];
  if (row.h1 !== 1) problems.push(`h1=${row.h1}`);
  if (row.skips && row.skips.length) problems.push(`heading skip ${row.skips.slice(0,2).join(',')}`);
  if (row.small > 0) problems.push(`${row.small} text run(s) below 11px (min ${row.minFont}px)`);
  if (row.ov > 2) problems.push(`1440px overflow +${row.ov}px`);
  if (row.mobileOverflow > 2) problems.push(`390px overflow +${row.mobileOverflow}px`);
  if (!row.darkTheme) problems.push('light/dark body surface did not change');
  if (row.mobileTargets && row.mobileTargets.length) problems.push(`${row.mobileTargets.length} control(s) under 44px`);
  if (row.noAlt > 0) problems.push(`${row.noAlt}/${row.imgs} image(s) without alt`);
  if (row.unlabeled > 0) problems.push(`${row.unlabeled}/${row.fields} field(s) unlabeled`);
  if (row.animating > 0) problems.push(`${row.animating} element(s) still animating under reduced-motion`);
  if (row.keyboard && row.keyboard.length) problems.push(...row.keyboard.map(x => `keyboard: ${x}`));
  if (row.themeKeyboard && row.themeKeyboard.length) problems.push(...row.themeKeyboard.map(x => `theme keyboard: ${x}`));
  if (row.mobileNavKeyboard && row.mobileNavKeyboard.length) problems.push(...row.mobileNavKeyboard.map(x => `mobile nav keyboard: ${x}`));
  if (row.dialogKeyboard && row.dialogKeyboard.length) problems.push(...row.dialogKeyboard.map(x => `dialog keyboard: ${x}`));
  if (row.error) problems.push(row.error);
  if (problems.length) fails.push({ page: pageName, problems, detail: row });
}

console.log(`gate sweep — ${checked}/${pages.length} page(s) checked${pages.length > graded.length ? ' (--all)' : ''}\n`);
console.log(`interaction coverage — theme: ${themeRoutesChecked} route(s) / ${themeControlsChecked} toggle(s); mobile navigation: ${mobileNavRoutesChecked} route(s); native dialog: ${dialogRoutesChecked} route(s)`);
if (!fails.length) console.log('all gates pass on every page');
for (const f of fails) {
  console.log(`  ${f.page}`);
  for (const p of f.problems) console.log(`      ${p}`);
  if (f.detail.mobileTargets?.length) console.log(`      targets: ${f.detail.mobileTargets.slice(0, 8).join(', ')}`);
}
const total = fails.reduce((n, f) => n + f.problems.length, 0);
console.log(`\n${fails.length} page(s) with findings · ${total} finding(s)`);
await browser.close();
