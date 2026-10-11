// ============================================================================
// Canonical prototype data — one story, consistent across all three surfaces
// ============================================================================
export const CLIENTS = [
  { name: 'Arjun Mehta', company: 'Mehta Consulting Group', city: 'Mumbai', email: 'arjun.mehta@nestlancer.com' },
  { name: 'Samira Patel', company: 'Patel Digital Agency', city: 'Ahmedabad', email: 'samira.patel@nestlancer.com' },
  { name: 'Rahul Desai', company: 'Desai Logistics', city: 'Surat', email: 'rahul.desai@nestlancer.com' },
  { name: 'Ananya Iyer', company: 'Iyer FinTech Solutions', city: 'Chennai', email: 'ananya.iyer@nestlancer.com' },
  { name: 'Priya Nair', company: 'Nair Learning Systems', city: 'Kochi', email: 'priya.nair@nestlancer.com' },
  { name: 'Vikram Shah', company: 'Shah Retail Ventures', city: 'Mumbai', email: 'vikram.shah@nestlancer.com' },
  { name: 'Kavya Reddy', company: 'Reddy AgroTech', city: 'Hyderabad', email: 'kavya.reddy@nestlancer.com' },
  { name: 'Rajan Kumar', company: 'Kumar Textiles', city: 'Coimbatore', email: 'rajan.kumar@nestlancer.com' },
  { name: 'Divya Sharma', company: 'Sharma Health Services', city: 'Delhi', email: 'divya.sharma@nestlancer.com' },
  { name: 'Amit Verma', company: 'Verma Properties', city: 'Delhi', email: 'amit.verma@nestlancer.com' },
  { name: 'Neha Gupta', company: 'Gupta HR Cloud', city: 'Noida', email: 'neha.gupta@nestlancer.com' },
  { name: 'Suresh Iyer', company: 'Iyer Agro Supplies', city: 'Coimbatore', email: 'suresh.iyer@nestlancer.com' },
  { name: 'Pooja Kulkarni', company: 'Kulkarni Clinic Chain', city: 'Pune', email: 'pooja.kulkarni@nestlancer.com' },
  { name: 'Karthik Menon', company: 'Menon PayTech', city: 'Bengaluru', email: 'karthik.menon@nestlancer.com' },
  { name: 'Sandeep Chopra', company: 'Chopra Fleet Logistics', city: 'Chandigarh', email: 'sandeep.chopra@nestlancer.com' },
];

// VERIFIED against https://app.nestlancer.com/blog (page 1 of 7, "All articles" = 110)
// and the Blog article page. Read time = "N min read". Views as shown on the listing.
export const POSTS = [
  { slug: 'cutting-deploy-time-from-45-minutes-to-five', t: 'Cutting Deploy Time from 45 Minutes to Five', cat: 'Case Studies', min: 2, views: 4, featured: true, excerpt: 'CI caching, smaller artifacts, and service-level pipelines after monolith split.' },
  { slug: 'scaling-a-freelance-marketplace-architecture', t: 'Scaling a Freelance Marketplace Architecture', cat: 'Case Studies', min: 3, views: 1, excerpt: 'Matching algorithms, escrow flows, and dispute resolution at growing GMV.' },
  { slug: 'gdpr-compliance-platform-rebuild', t: 'GDPR Compliance Platform Rebuild', cat: 'Case Studies', min: 2, views: 1, excerpt: 'Data maps, deletion workflows, and consent logging across microservices.' },
  { slug: 'migrating-from-websockets-to-sse', t: 'Migrating from WebSockets to SSE', cat: 'Case Studies', min: 2, views: 2, excerpt: 'Simpler infra, CDN friendliness, and trade-offs for one-way realtime feeds.' },
  { slug: 'elasticsearch-migration-for-search-features', t: 'Elasticsearch Migration for Search Features', cat: 'Case Studies', min: 2, views: 1, excerpt: 'Reindex strategies, zero-downtime aliases, and relevance tuning.' },
  { slug: 'api-versioning-without-breaking-mobile-clients', t: 'API Versioning Without Breaking Mobile Clients', cat: 'Case Studies', min: 2, views: 1, excerpt: 'Sunset headers, parallel versions, and contract tests with consumer teams.' },
  { slug: 'multi-region-deployment-case-study', t: 'Multi-Region Deployment Case Study', cat: 'Case Studies', min: 2, views: 1, excerpt: 'Latency goals, data residency, and failover drills across EU and US.' },
  { slug: 'event-sourcing-for-order-management', t: 'Event Sourcing for Order Management', cat: 'Case Studies', min: 3, views: 1, featured: true, excerpt: 'Auditability wins, projection rebuilds, and complexity costs in production.' },
  { slug: 'kubernetes-migration-cost-analysis', t: 'Kubernetes Migration Cost Analysis', cat: 'Case Studies', min: 3, views: 1, featured: true, excerpt: 'Real infra bills, engineer time, and when managed services beat self-hosted clusters.' },
  { slug: 'building-an-incident-response-culture', t: 'Building an Incident Response Culture', cat: 'Case Studies', min: 2, views: 2, excerpt: 'Blameless postmortems, severity definitions, and action item tracking.' },
  { slug: 'splitting-a-monorepo-into-microservices', t: 'Splitting a Monorepo into Microservices', cat: 'Case Studies', min: 2, views: 1, excerpt: 'Repository boundaries, CI pipelines, and contract tests during extraction.' },
  { slug: 'legacy-php-to-nestjs-migration-story', t: 'Legacy PHP to NestJS Migration Story', cat: 'Case Studies', min: 2, views: 1, excerpt: 'Strangling admin APIs first, shared database phase, and team retraining.' },
];

// Category counts shown in the blog rail (verified): All 110 · Business 27 · Case Studies 26 · Design 27 · Technology 30
export const BLOG_COUNTS = { all: 110, Business: 27, 'Case Studies': 26, Design: 27, Technology: 30 };

// VERIFIED against https://app.nestlancer.com/portfolio (8 projects, 2026)
export const WORKS = [
  { id: 'b2b-portal-ux', t: 'B2B Client Portal UX', sector: 'UI/UX Design', result: 'Information architecture and UI for a client self-serve portal.', v: 1, tags: ['Figma', 'User Interviews', 'Prototyping'], date: 'Oct 2026' },
  { id: 'fitness-tracking-app', t: 'Fitness Tracking App', sector: 'Mobile App', result: 'iOS/Android workout tracker with coach dashboards.', v: 2, tags: ['React Native', 'NestJS', 'PostgreSQL'], date: 'Oct 2026' },
  { id: 'marketplace-redesign', t: 'Marketplace Redesign', sector: 'E-Commerce', result: 'Conversion-focused UX overhaul for a multi-vendor storefront.', v: 3, tags: ['Figma', 'Next.js', 'Analytics'], date: 'Oct 2026' },
  { id: 'brand-identity-system', t: 'Brand Identity System', sector: 'UI/UX Design', result: 'Design tokens, type, and component foundations for a B2B brand.', v: 4, tags: ['Figma', 'Storybook', 'CSS Tokens'], date: 'Oct 2026' },
  { id: 'fintech-payments-hub', t: 'Fintech Payments Hub', sector: 'E-Commerce', result: 'Unified payouts and reconciliation for a lending platform.', v: 5, tags: ['NestJS', 'PostgreSQL', 'RabbitMQ', 'Razorpay'], date: 'Oct 2026', featured: true },
  { id: 'saas-analytics-platform', t: 'SaaS Analytics Platform', sector: 'Web Development', result: 'Business intelligence platform with custom dashboards.', v: 6, tags: ['Vue.js', 'FastAPI', 'PostgreSQL', 'Redis'], date: 'Oct 2026', featured: true },
  { id: 'ecommerce-mobile-app', t: 'E-Commerce Mobile App', sector: 'Mobile App', result: 'Cross-platform shopping app with Razorpay integration.', v: 1, tags: ['React Native', 'Node.js', 'MongoDB', 'Razorpay'], date: 'Oct 2026', featured: true },
  { id: 'healthtech-dashboard', t: 'HealthTech Dashboard', sector: 'Web Development', result: 'Real-time patient monitoring dashboard for hospitals.', v: 2, tags: ['Next.js', 'NestJS', 'PostgreSQL', 'Redis'], date: 'Oct 2026', featured: true },
];

export const REQ_LIST = [
  { id: '01a10fa4-8fd5-712e-97d7-7d3d12f94976', t: 'AUDIT-P23-LINE-20261005-7r0l Request', status: 'Submitted', tone: 'info', cat: 'Web Development', client: 'arjun.mehta@nestlancer.com', date: 'Oct 6, 2026' },
  { id: '01a10fa3-acfd-702b-a224-a956a39a7bc6', t: 'AUDIT-P23-SUPP-20261005-6grw Request', status: 'Submitted', tone: 'info', cat: 'Web Development', client: 'arjun.mehta@nestlancer.com', date: 'Oct 6, 2026' },
  { id: '01a10f84-ddf5-75c8-9110-113258a17674', t: 'AUDIT-P24-20261005-6y6fa-draft Request', status: 'Submitted', tone: 'info', cat: 'Web Development', client: 'arjun.mehta@nestlancer.com', date: 'Oct 6, 2026' },
  { id: '01a10f82-0e1a-7f3e-9a42-9c4a52c12bc1', t: 'AUDIT-P24-20261005-6v89t-draft Request', status: 'Submitted', tone: 'info', cat: 'Web Development', client: 'arjun.mehta@nestlancer.com', date: 'Oct 6, 2026' },
  { id: '01a10cc1-41b9-7d2e-a5c8-2f91e06dd7a2', t: 'AUDIT-P23-LINE-20261005-di5p Request', status: 'Submitted', tone: 'info', cat: 'Web Development', client: 'arjun.mehta@nestlancer.com', date: 'Oct 5, 2026' },
  { id: '01a10cc0-77de-7421-a4f3-0a5b55e7c1b3', t: 'AUDIT-P23-SUPP-20261005-bwm Request', status: 'Submitted', tone: 'info', cat: 'Web Development', client: 'arjun.mehta@nestlancer.com', date: 'Oct 5, 2026' },
  { id: '01a10b3a-2f60-79c4-83a1-93ab52a7f6c0', t: 'AUDIT-P24-20261005-03ipf-draft Request', status: 'Submitted', tone: 'info', cat: 'Web Development', client: 'arjun.mehta@nestlancer.com', date: 'Oct 5, 2026' },
  { id: '01a10abe-5202-70cf-95e2-b2f8a10a2a18', t: 'AUDIT-P23-LINE-20261005-aazy Request', status: 'Submitted', tone: 'info', cat: 'Web Development', client: 'arjun.mehta@nestlancer.com', date: 'Oct 5, 2026' },
  { id: '01a10abd-5ce0-72dd-abf2-2f8d9b33110f', t: 'AUDIT-P23-SUPP-20261005-8p13 Request', status: 'Submitted', tone: 'info', cat: 'Web Development', client: 'arjun.mehta@nestlancer.com', date: 'Oct 5, 2026' },
  { id: '01a10aa7-1e5b-70bc-a78b-d1c41804e5cb', t: 'AUDIT-P24-20261005-uc3d4-draft Request', status: 'Submitted', tone: 'info', cat: 'Web Development', client: 'arjun.mehta@nestlancer.com', date: 'Oct 5, 2026' },
  { id: '01a10a2c-90f2-78ea-b84f-a5269ee40a11', t: 'UPI Merchant Collections Mobile App', status: 'Under Review', tone: 'warning', cat: 'Mobile App', client: 'ananya.iyer@nestlancer.com', date: 'Oct 5, 2026' },
  { id: '01a10a2c-cb83-71df-9f8d-d7ea61123e44', t: 'Live Shipment Tracking Dashboard', status: 'Under Review', tone: 'warning', cat: 'Web Development', client: 'rahul.desai@nestlancer.com', date: 'Oct 5, 2026' },
  { id: '01a10a2b-28c6-79fe-9739-b82ce4b2c501', t: 'Patel Digital Agency Website Redesign', status: 'Submitted', tone: 'info', cat: 'Design', client: 'samira.patel@nestlancer.com', date: 'Oct 5, 2026' },
];

// Client (Priya Nair) workspace data
export const PRIYA = {
  request: {
    id: '01A10A2C-530E-7354-B21B-F5ECDAB54F7A',
    title: 'Corporate LMS for 200 Employees',
    sub: 'Custom · Full project brief and delivery timeline',
    desc: 'Internal learning platform for Nair Learning Systems staff across Kochi, Bangalore, and Chennai — course builder with video modules, quiz engine, completion tracking, PDF certificate generation, and SAML SSO via our existing Okta tenant. Must support Malayalam subtitles on select compliance courses.',
    budget: '₹35,00,000.00 – ₹50,00,000.00',
    start: 'Aug 1, 2026',
    deadline: 'Oct 31, 2026',
    timeline: 'Fixed dates',
    reqs: ['Course builder with video upload', 'Quiz engine with pass/fail thresholds', 'SAML SSO via Okta', 'Admin reporting — completion rates by department', 'Malayalam subtitles on compliance modules'],
  },
  quote: {
    id: '01a10f80',
    amount: '₹52,200.00',
    status: 'Accepted',
  },
  project: {
    id: 'NL-204',
    title: 'Corporate LMS for 200 Employees',
    progress: 40,
    next: 'Mid-project payment',
    due: '₹20,880.00',
  },
};
