// ============================================================================
// ROUTES — apps/web auth pages (client) · login/register/forgot/reset/verify-email
// ============================================================================
import { linkTo as LT } from '../lib/util.mjs';
import { icon } from '../lib/icons.mjs';

const fieldRow = (label, inner, extra = '') => `
<div class="field mb-4"><label class="label">${label} <span class="req">*</span></label>${inner}${extra}</div>`;

export default [
  {
    path: 'apps/web/login/', title: 'Sign In · Nestlancer Client Portal', auth: 'split',
    form: (r) => `
<div class="mb-7">
  <span class="avatar sq mb-4" style="width:42px;height:42px;border-radius:12px;background:var(--brand-2);color:var(--brand-11)">${icon('logIn',18)}</span>
  <h1 class="h2" style="font-size:30px">Sign in</h1>
  <p class="text-sm muted mt-2" style="line-height:1.6">For clients only. Administrator and operator accounts must use the operator console — not this page.</p>
</div>
${fieldRow('Email','<input class="input" type="email" placeholder="you@company.com" autocomplete="email">')}
${fieldRow('Password','<div class="input-wrap"><input class="input" type="password" placeholder="Enter your password" autocomplete="current-password"><span class="in-kbd" style="right:12px;font-size:12px;font-weight:600;color:var(--ink-3);font-family:var(--font-sans)">Show</span></div>')}
<div class="flex items-center justify-between mb-5">
  <label class="check" style="gap:8px"><input type="checkbox"> Keep me signed in</label>
  <a class="link text-sm" href="${LT(r,'apps/web/forgot-password/')}">Forgot password?</a>
</div>
<form action="${LT(r,'apps/web/dashboard/')}" method="get"><button class="btn btn-primary w-full btn-lg" type="submit">Sign in</button></form>
<div class="text-center text-xs dim mt-5 mb-4">Staff or platform operator? <a class="link" href="${LT(r,'apps/admin/login/')}">Operator sign-in</a></div>
<div class="text-center text-xs dim mb-5">Administrator accounts cannot finish signing in here.</div>
<div class="divider mb-5"></div>
<div class="text-center text-sm">Don&#39;t have an account? <a class="link" href="${LT(r,'apps/web/register/')}">Sign up</a></div>`,
  },

  {
    path: 'apps/web/register/', title: 'Create account · Nestlancer', auth: 'split',
    form: (r) => `
<div class="mb-7">
  <h1 class="h2" style="font-size:30px">Sign up</h1>
  <p class="text-sm muted mt-2">Create your client account for the Nestlancer studio.</p>
</div>
<div class="grid g2 gap-3 mb-4">
  <div class="field"><label class="label">First name <span class="req">*</span> ${icon('help-circle',12)}</label><input class="input" placeholder="Your first name"></div>
  <div class="field"><label class="label">Last name <span class="req">*</span> ${icon('help-circle',12)}</label><input class="input" placeholder="Your last name"></div>
</div>
${fieldRow(`Email ${icon('help-circle',12)}`,'<input class="input" type="email" placeholder="you@company.com">')}
${fieldRow(`Password ${icon('help-circle',12)}`,'<input class="input" type="password" placeholder="Create a password">')}
${fieldRow(`Confirm password ${icon('help-circle',12)}`,'<input class="input" type="password" placeholder="Re-enter your password">')}
<label class="check mb-3"><input type="checkbox"> <span>I agree to the <a class="link" href="${LT(r,'apps/web/terms/')}">Terms of Service</a> and <a class="link" href="${LT(r,'apps/web/privacy/')}">Privacy Policy</a>.</span></label>
<label class="check mb-5"><input type="checkbox"> <span>Send me product updates and announcements.</span></label>
<form action="${LT(r,'apps/web/verify-email/')}" method="get"><button class="btn btn-primary w-full btn-lg" type="submit">Sign up</button></form>
<div class="text-center text-xs dim mt-4">Administrator and operator accounts are issued by your team — this form is only for new client accounts.</div>
<div class="text-center text-sm mt-4">Already have an account? <a class="link" href="${LT(r,'apps/web/login/')}">Sign in</a></div>`,
  },

  {
    path: 'apps/web/forgot-password/', title: 'Forgot password · Nestlancer', auth: 'split',
    form: (r) => `
<div class="mb-7">
  <span class="avatar sq mb-4" style="width:42px;height:42px;border-radius:12px;background:var(--brand-2);color:var(--brand-11)">${icon('lock',18)}</span>
  <h1 class="h2" style="font-size:30px">Reset your password</h1>
  <p class="text-sm muted mt-2" style="line-height:1.6">Enter the email on your client account. We&#39;ll send a secure reset link valid for 30 minutes.</p>
</div>
${fieldRow('Email','<input class="input" type="email" placeholder="you@company.com">')}
<form action="${LT(r,'apps/web/reset-password/')}" method="get"><button class="btn btn-primary w-full btn-lg" type="submit">Send reset link</button></form>
<div class="note info mt-5">${icon('info',15)}<div>If the address exists in our records, mail headed your way — check spam if nothing arrives in 2 minutes.</div></div>
<div class="text-center text-sm mt-5"><a class="link-arrow" href="${LT(r,'apps/web/login/')}">${icon('arrow-left',13)} Back to sign in</a></div>`,
  },

  {
    path: 'apps/web/reset-password/', title: 'Set a new password · Nestlancer', auth: 'split',
    form: (r) => `
<div class="mb-7">
  <span class="avatar sq mb-4" style="width:42px;height:42px;border-radius:12px;background:var(--t-success-bg);color:var(--t-success-tx)">${icon('shield-check',18)}</span>
  <h1 class="h2" style="font-size:30px">Choose a new password</h1>
  <p class="text-sm muted mt-2" style="line-height:1.6">Reset link verified for <b>ananya.iyer@nestlancer.com</b>. This link expires in 28 minutes.</p>
</div>
${fieldRow('New password','<input class="input" type="password" placeholder="At least 10 characters">')}
${fieldRow('Confirm new password','<input class="input" type="password" placeholder="Repeat the new password">')}
<div class="panel mb-5" style="padding:14px 16px">
  <div class="text-xs uppercase dim mb-2" style="letter-spacing:.08em">Password requirements</div>
  ${[['10+ characters',true],['One uppercase &amp; one number',true],['Not your email name',true],['Not a breached password (k-Anonymity check)',false]].map(([l,ok])=>`<div class="flex items-center gap-2 text-sm" style="padding:3px 0;color:${ok?'var(--t-success-tx)':'var(--ink-3)'}">${icon(ok?'check':'x',13)}<span>${l}</span></div>`).join('')}
</div>
<form action="${LT(r,'apps/web/login/')}" method="get"><button class="btn btn-primary w-full btn-lg" type="submit">Update password &amp; sign in</button></form>
<div class="text-center text-sm mt-5"><a class="link" href="${LT(r,'apps/web/login/')}">Cancel — I remembered it</a></div>`,
  },

  {
    path: 'apps/web/verify-email/', title: 'Verify email · Nestlancer', auth: 'split',
    form: (r) => `
<div class="mb-7">
  <span class="avatar sq mb-4" style="width:42px;height:42px;border-radius:12px;background:var(--brand-2);color:var(--brand-11)">${icon('mail',18)}</span>
  <h1 class="h2" style="font-size:30px">Check your inbox</h1>
  <p class="text-sm muted mt-2" style="line-height:1.6">We sent a 6-digit code to <b>ananya.iyer@nestlancer.com</b>. Enter it to finish creating your client account.</p>
</div>
<div class="flex gap-2 mb-4">
  ${['','','','','',''].map(()=>`<input class="input mono text-center" maxlength="1" style="width:52px;height:56px;font-size:22px;font-weight:600">`).join('')}
</div>
<form action="${LT(r,'apps/web/dashboard/')}" method="get"><button class="btn btn-primary w-full btn-lg" type="submit">Verify &amp; continue</button></form>
<div class="flex items-center justify-between mt-4 text-xs dim">
  <span>Code expires in <b class="mono">14:32</b></span><a class="link" href="#">Resend code</a>
</div>
<div class="note warn mt-5">${icon('alert-triangle',15)}<div>Used a work email? Your IT may quarantine our mail — allowlist <b class="mono">no-reply@nestlancer.com</b>.</div></div>
<div class="text-center text-sm mt-5">Wrong address? <a class="link" href="${LT(r,'apps/web/register/')}">Go back</a></div>`,
  },
];
