import type { Metadata } from "next";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/contact" } };

// WF-06: mailto only — no form, no submission endpoint, no storage
// (FEAT-008 / FR-019 / FR-020 / BR-009).
export default function ContactPage() {
  const email = contactEmail();
  return (
    <>
      <h1 className="text-2xl font-bold sm:text-3xl">Contact</h1>
      <p className="mt-6">Questions or feedback? Email us:</p>
      <p className="mt-4">
        <a
          href={`mailto:${email}`}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface/40 px-4 py-2.5 text-accent transition-colors hover:border-accent"
        >
          <span aria-hidden>&#9993;</span> {email}
        </a>
      </p>
      <p className="mt-8 text-sm text-muted">
        (There is no contact form; nothing you type is stored here.)
      </p>
    </>
  );
}
