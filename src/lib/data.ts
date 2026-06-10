export const profile = {
  name: "Bidipto Bose",
  firstName: "Bidipto",
  lastName: "Bose",
  role: "Senior Software Engineer",
  tagline: "Senior SDE @ SaffronStays — Ex Nykaa, Trell",
  location: "Kolkata, India",
  email: "bidiptobose123@gmail.com",
  phone: "+91 8017077650",
  linkedin: "https://www.linkedin.com/in/bidipto-bose-981b541b6",
  github: "https://github.com/bdbose",
  website: "https://bdbose.in",
  summary:
    "I architect the systems behind a hospitality platform — Go services, booking engines, custom DNS servers, AI search — and the interfaces on top of them. Backend-heavy, frontend-fluent, owner of things end to end.",
};

export const stats = [
  { value: 5, suffix: "+", label: "Years of experience" },
  { value: 150, suffix: "%", label: "API response time improved" },
  { value: 40, suffix: "%", label: "Google impressions growth" },
  { value: 95, suffix: "+", label: "Lighthouse scores shipped" },
];

export type Experience = {
  company: string;
  role: string;
  period: string;
  location?: string;
  highlights: string[];
};

export const experience: Experience[] = [
  {
    company: "SaffronStays",
    role: "Senior Software Engineer",
    period: "Jul 2024 — Present",
    location: "India",
    highlights: [
      "Architected the complete 1MH backend from scratch in Go — booking, guest management, pricing, calendar, coupon, rating and listing APIs.",
      "Built a cost-efficient custom DNS proxy with reverse proxying and automatic SSL, powering white-label domain hosting for listing websites.",
      "Built the fastest in-company Airbnb scraper — fully structured listings in seconds, drastically cutting property onboarding time.",
      "Developed a scalable, low-latency chat server with connection pooling and optimized real-time message handling.",
      "Stood up centralized ELK logging across all servers, plus internal logger services tracking listing and date-wise changes.",
      "Engineered booking recalculation handling dynamic pricing, guest counts, taxes, discounts and availability.",
      "Led critical projects end-to-end — architecture to deployment — while mentoring junior developers and interns.",
    ],
  },
  {
    company: "SaffronStays",
    role: "Software Development Engineer",
    period: "Jul 2022 — Jul 2024",
    location: "India",
    highlights: [
      "Migrated core Node.js APIs to Go (Gin), improving API response times by more than 150%.",
      "Built the AI chatbot and NLP villa recommendation engine with Python and Elasticsearch; integrated OpenAI into internal products.",
      "Created SYNC — a full inventory management dashboard with a custom calendar system built from scratch for rates, blocking and availability.",
      "Built coupon and promotional systems and the complete Finance module, backend APIs through frontend.",
      "Led SEO initiatives that grew Google impressions and clicks by ~40% through technical SEO across the platform.",
      "Worked across PostgreSQL, MariaDB, RabbitMQ, Docker and Nginx in production.",
    ],
  },
  {
    company: "SaffronStays",
    role: "Software Developer Intern",
    period: "Mar 2021 — Jul 2022",
    location: "India",
    highlights: [
      "Contributed across the CMS dashboard, main website and internal tooling.",
    ],
  },
  {
    company: "Nykaa",
    role: "SDE Intern",
    period: "May 2022 — Jul 2022",
    highlights: ["Worked with the engineering team on consumer-facing commerce systems."],
  },
  {
    company: "Trell",
    role: "SDE Intern",
    period: "Sep 2021 — Apr 2022",
    highlights: ["Built features for a lifestyle social commerce platform at scale."],
  },
  {
    company: "Dcoder",
    role: "Full Stack Engineer",
    period: "Nov 2020 — Feb 2021",
    highlights: ["Full-stack product work on a mobile code compiler platform."],
  },
];

export type Project = {
  index: string;
  title: string;
  description: string;
  tags: string[];
  accent?: boolean;
};

export const projects: Project[] = [
  {
    index: "01",
    title: "1MH Platform",
    description:
      "Complete backend architecture in Go — bookings, guests, pricing, calendars, coupons, ratings, listings — plus a custom DNS server with automatic SSL for white-label hosting, a low-latency chat server, and SEO-optimized listing pages with runtime theming.",
    tags: ["Golang", "Gin", "DNS", "WebSockets", "Redis"],
    accent: true,
  },
  {
    index: "02",
    title: "Booking & Revenue Engine",
    description:
      "Recalculation engine at the heart of revenue — dynamic pricing, guest counts, taxes, discounts and availability resolved in real time, with calendar blocking and inventory management underneath.",
    tags: ["Golang", "MySQL", "Dynamic Pricing"],
    accent: true,
  },
  {
    index: "03",
    title: "Airbnb Scraper",
    description:
      "The fastest in-company scraper — generates fully structured property listings in seconds and drastically reduced property onboarding time.",
    tags: ["Golang", "Concurrency", "Scraping"],
  },
  {
    index: "04",
    title: "AI Chatbot & Recommendations",
    description:
      "NLP chatbot and villa recommendation engine powering the SaffronStays website, with OpenAI-based automation woven into internal hospitality products.",
    tags: ["Python", "NLP", "OpenAI", "Elasticsearch"],
  },
  {
    index: "05",
    title: "SYNC — Inventory Dashboard",
    description:
      "Full inventory management dashboard where owners manage rates, availability and block dates — featuring a fully custom calendar system built from scratch.",
    tags: ["React", "TypeScript", "Custom Calendar"],
  },
  {
    index: "06",
    title: "ELK Logging Infrastructure",
    description:
      "Centralized logging across every server with the ELK stack, plus internal logger services tracking listing and date-wise changes for full auditability.",
    tags: ["Elasticsearch", "Logstash", "Kibana", "Golang"],
  },
  {
    index: "07",
    title: "Analytics Dashboard",
    description:
      "Interactive dashboard for team-wise performance metrics, lead quality analysis and strategic insights for leadership.",
    tags: ["React", "Data Viz", "Golang"],
  },
  {
    index: "08",
    title: "Finance Module",
    description:
      "End-to-end finance management — complete backend APIs and frontend module handling payouts, statements and reconciliation.",
    tags: ["Golang", "MySQL", "React"],
  },
];

export const skills = {
  backend: ["Golang", "Gin", "Node.js", "Python", "Kafka", "RabbitMQ", "Redis", "PostgreSQL", "MariaDB", "MySQL", "Elasticsearch", "WebSockets"],
  frontend: ["React", "Next.js", "TypeScript", "Framer Motion", "Tailwind CSS", "SEO", "Lighthouse 95+"],
  infra: ["AWS EC2", "AWS S3", "Docker", "Nginx", "CI/CD", "ELK Stack", "DNS / Networking", "SSL Automation"],
  ai: ["NLP", "OpenAI APIs", "Recommendation Systems", "Chatbots", "Elasticsearch", "Python"],
};

export type Capability = {
  index: string;
  title: string;
  blurb: string;
  items: string[];
};

export const capabilities: Capability[] = [
  {
    index: "01",
    title: "Backend & Platform",
    blurb:
      "Go services built for scale — the platform core that everything else stands on.",
    items: [
      "Node.js → Go migrations, +150% faster APIs",
      "Booking, guest, pricing, calendar, coupon, rating & listing APIs",
      "Low-latency chat server with connection pooling",
      "PostgreSQL · MariaDB · RabbitMQ · Redis",
    ],
  },
  {
    index: "02",
    title: "Booking & Revenue Systems",
    blurb:
      "The money path — pricing, taxes, discounts and availability resolved correctly, every time.",
    items: [
      "Booking recalculation engine (pricing, guests, taxes, discounts)",
      "Calendar blocking & inventory management",
      "Coupon & promotional systems",
      "Finance module — payouts to reconciliation",
    ],
  },
  {
    index: "03",
    title: "AI, Search & Automation",
    blurb:
      "Hospitality automation that actually ships — search, recommendations, conversation.",
    items: [
      "NLP chatbot on the production website",
      "Villa recommendation engine",
      "OpenAI integrations in internal products",
      "Elasticsearch-powered search",
    ],
  },
  {
    index: "04",
    title: "Frontend Engineering",
    blurb:
      "Interfaces that operators live in daily — fast, custom, no off-the-shelf shortcuts.",
    items: [
      "React & Next.js applications",
      "SYNC inventory dashboard + custom calendar system",
      "CMS & internal management dashboards",
      "95+ Lighthouse, SEO-first builds",
    ],
  },
  {
    index: "05",
    title: "Infrastructure & DevOps",
    blurb:
      "From Dockerfile to DNS record — owning the path to production.",
    items: [
      "Custom DNS / subdomain mapping for hosted listing sites",
      "Nginx reverse proxies & automatic SSL",
      "Dockerized services, CI/CD deployments on AWS",
      "Centralized ELK log aggregation across servers",
    ],
  },
  {
    index: "06",
    title: "Leadership & Growth",
    blurb:
      "End-to-end ownership — architecture to deployment, with the team growing alongside.",
    items: [
      "Led critical, revenue-impacting projects end-to-end",
      "Mentored junior developers and interns",
      "Partnered with product & business on requirements",
      "SEO initiatives: ~40% growth in impressions & clicks",
    ],
  },
];

/** Mono ticker lines — real systems, real work. */
export const logLines = [
  "[GET] /api/bookings → 200 · 38ms",
  "migrate: node → go · -150ms p99",
  "dns.resolve(*.1mh.in) → OK · ssl auto-issued",
  "chat.pool: 1,024 conns · stable",
  "scraper: listing structured in 2.4s",
  "elk: 6 servers → 1 stream",
  "recalc: price+tax+discount → consistent",
  "seo: impressions +40% YoY",
];

export const education = {
  school: "Calcutta Institute of Engineering and Management",
  degree: "B.Tech, Computer Science",
  period: "2018 — 2022",
};
