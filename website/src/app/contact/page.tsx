import type { Metadata } from "next";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

// WF-06: mailto only — no form, no submission endpoint, no storage
// (FEAT-008 / FR-019 / FR-020 / BR-009).
export default function ContactPage() {
  const email = contactEmail();
  return (
    <>
      <h1 className="text-2xl font-bold">Contact</h1>
      <p className="mt-4">Questions or feedback? Email us:</p>
      <p className="mt-4">
        <a href={`mailto:${email}`} className="underline">
          &#9993; {email}
        </a>
      </p>
      <p className="mt-6 text-sm opacity-70">
        (There is no contact form; nothing you type is stored here.)
      </p>
    </>
  );
}
