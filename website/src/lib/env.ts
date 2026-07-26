import "server-only";

// Server-side environment access (SRS §2.1.8 / NFR-018).
// BLOGGER_API_KEY and BLOG_ID must never reach the client bundle (BR-004);
// importing this module from client code fails the build via "server-only".

function required(name: "BLOGGER_API_KEY" | "BLOG_ID"): string {
  const value = process.env[name];
  if (!value || value.startsWith("REPLACE_WITH")) {
    throw new Error(
      `Environment variable ${name} is not set — copy website/.env.example to .env.local and fill it in`,
    );
  }
  return value;
}

export const env = {
  get bloggerApiKey(): string {
    return required("BLOGGER_API_KEY");
  },
  get blogId(): string {
    return required("BLOG_ID");
  },
  // BR-003 / BR-007 — decided value 600 s (SRS §3.2.9)
  get revalidateSeconds(): number {
    const n = Number(process.env.ISR_REVALIDATE);
    return Number.isFinite(n) && n > 0 ? n : 600;
  },
};
