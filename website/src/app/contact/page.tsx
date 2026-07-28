import type { Metadata } from "next";
import Shell from "@/components/Shell";
import Transition from "@/components/Transition";
import { contactEmail } from "@/lib/site";

export const metadata: Metadata = { title: "Kontak", alternates: { canonical: "/contact" } };

// WF-06: mailto only — no form, no submission endpoint, no storage
// (FEAT-008 / FR-019 / FR-020 / BR-009).
export default function ContactPage() {
  const email = contactEmail();

  return (
    <Transition>
      <Shell className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-[-0.5px] text-ink sm:text-[42px]">
            Kontak
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-charcoal">
            Ada pertanyaan, koreksi, atau foto yang ingin ditambahkan ke arsip? Kirim surel.
          </p>

          {email ? (
            <p className="mt-6">
              <a
                href={`mailto:${email}`}
                className="lift inline-flex items-center gap-2.5 rounded-lg border border-hairline bg-tint-lavender px-5 py-3 text-[15px] font-medium text-purple-800"
              >
                <span aria-hidden="true">&#9993;</span>
                <span translate="no">{email}</span>
              </a>
            </p>
          ) : (
            <p className="mt-6 rounded-lg border border-dashed border-hairline-strong bg-surface-soft px-5 py-4 text-[15px] text-charcoal">
              Alamat surel belum disetel untuk situs ini.
            </p>
          )}

          <p className="mt-10 text-sm leading-relaxed text-slate">
            Tidak ada formulir di halaman ini, dan tidak ada apa pun yang Anda tulis di sini yang
            disimpan.
          </p>
        </div>
      </Shell>
    </Transition>
  );
}
