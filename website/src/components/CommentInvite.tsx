/**
 * The invitation to comment, pointing at Blogger's own editor.
 *
 * This is navigation, not a comment-submission control: nothing is typed here,
 * nothing is posted from this origin, and no reader data is collected — so
 * FR-017 ("no interface to create, edit, or delete comments"), BR-008
 * (comments live and are moderated in Blogger) and NFR-012 (no personal data)
 * all continue to hold. It exists because Blogger's editor is the only surface
 * that still accepts a comment; see lib/comments.ts for what was probed.
 *
 * Opens in a new tab because the reader is mid-article, and blogger.com is a
 * different site with its own sign-in flow — losing the post to a login screen
 * would be the wrong trade. The destination is announced for screen readers.
 */
export default function CommentInvite({ href }: { href: string }) {
  return (
    <div className="mt-6 rounded-lg border border-hairline bg-surface-soft p-5">
      <p className="text-[15px] leading-relaxed text-charcoal">
        Punya cerita, koreksi, atau kenangan tentang catatan ini? Tulis di Blogger — komentarnya
        akan muncul di halaman ini juga, beberapa saat kemudian.
      </p>

      <p className="mt-4">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="lift inline-flex items-center gap-2.5 rounded-lg border border-hairline bg-tint-sky px-5 py-3 text-[15px] font-medium text-link-pressed"
        >
          <span aria-hidden="true">&#9998;</span>
          <span>Tulis komentar di Blogger</span>
          <span aria-hidden="true">&#8599;</span>
          <span className="sr-only">(buka di tab baru)</span>
        </a>
      </p>

      <p className="mt-3 text-[13px] leading-relaxed text-slate">
        Blogger mungkin meminta Anda masuk dengan akun Google. Komentar dikelola di sana, bukan di
        situs ini.
      </p>
    </div>
  );
}
