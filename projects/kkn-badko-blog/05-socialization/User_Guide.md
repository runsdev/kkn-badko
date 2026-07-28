# User & Publishing Guide — kkn-badko-blog

*(PROJECT_PLAN task 3.1.1 — for the Content Owner. No technical background needed.)*

## The one thing to remember

**You publish in Google Blogger; the website updates itself.** Everything you post at [blogger.com](https://www.blogger.com) on the blog *Badan Koordinasi TPA Moyudan* appears on **https://kkn-badko.vercel.app/** automatically within **10 minutes**. You never edit the website directly.

## Publishing a post

1. Sign in at blogger.com → select the blog → **+ New post**.
2. Write the title and content. Add photos with the image button (Blogger hosts them).
3. **Labels** (right sidebar): add one or more — e.g. `BERITA`, `FOTO`, `TIPS`. Readers can filter by these on the website (`/labels/...`), so reuse existing labels when it fits.
4. Click **Publish**. Within 10 minutes it appears at the top of **"Seluruh catatan"** on the website's **Arsip** page (`/arsip`), and as one of the three "Catatan terbaru" on the home page.

Editing or deleting a post in Blogger updates/removes it on the website the same way, within the same 10 minutes.

## Where a new post shows up

The website has two front pages with different jobs: **Beranda** (`/`) introduces the organisation, and **Arsip** (`/arsip`) is the archive itself with the full list of posts. A new post can appear in several places at once. All of it is automatic — there is nothing to switch on.

| Where | What lands there |
|---|---|
| **Seluruh catatan** (Arsip page) | Every post, newest first, 10 per page |
| **Kabar & kegiatan** (Arsip page) | Posts labelled `BERITA` |
| **Bahan mengajar** (Arsip page, yellow panel) | Posts labelled `TIPS` or `BCM` |
| **Papan Arsip** (Arsip page), **Direktori TPA** (`/tpa`), and the **roll call** on the home page | Posts labelled `FOTO` whose **title starts with `TPA `** |
| The coloured dots on the Arsip page banner | One per label, with a live count |
| `/labels/…` | Every post, filed under each of its labels |
| **Arsip per bulan** (Arsip page) + `/arsip/2010/11` | Every post, filed under the month it was published |
| **Kontributor** (footer, every page) | Whoever is named as the post's author in Blogger |
| **Catatan terbaru** (home page) | The three newest posts |

Two consequences worth knowing:

- **To add a TPA to the directory**, label the post `FOTO` and start the title with `TPA ` — for example `TPA AL-HUDA KALIDUREN 3`. Put the village name last; the directory shows it as a small heading above the name. A `FOTO` post whose title starts any other way still appears everywhere else, just not in the directory.
- **A new label works immediately** but has no colour of its own; it shows in neutral grey until one is assigned in the site's code.

## Tips for good posts on the website

- **Add labels** — unlabeled posts appear only in the main list, not in any category.
- **Images**: insert at "Large" or "Original" size so they look sharp on the site; smaller sizes can look blurry. The **first** image in a post becomes its large picture at the top of the post page and its thumbnail in lists, so lead with the photo you want seen.
- The first ~200 characters become the excerpt shown in lists — start with a sentence that summarizes the post.
- Scripts, embedded widgets, and unusual HTML are **removed by the website for security** — plain text, headings, lists, images, and links all work.

## The About page

Website's **Tentang** page shows the Blogger *page* titled "About": blogger.com → **Pages** → edit **About**. *(It currently contains placeholder text — please replace it.)* Titles "About", "About us", "Tentang", or "Tentang Kami" all work.

## About Blogger's Layout tab and its gadgets

The website does **not** read Blogger's **Layout** tab. Adding, removing or rearranging a gadget there changes `tpamoyudan.blogspot.com`, not this site. Google's Blogger API simply does not expose layout information, so there is nothing for the website to read.

Instead the website builds its own versions of the same things, from your posts:

| Blogger gadget | On the website |
|---|---|
| Blog Search | the search box in the header |
| Blog Archive | the "Arsip per bulan" panel, and a page per month |
| Labels | the coloured dots in the opening banner, the filter row, the footer |
| Profile / Kontributor | the Kontributor line in the footer |
| Blog posts, Header, Attribution | the post list, the site name, the footer note |
| **Popular Posts** | **not available.** Blogger keeps view statistics to itself, and its own Popular Posts gadget is empty for this blog. |

So there is nothing to configure. Publish a post with a label and it appears in all of the above automatically.

**One thing you *can* change from Blogger that the website will pick up:** the **author display name**. Every post currently reads "oleh Harun664", the account used to import the archive, and that same name is the only entry under Kontributor. Changing the display name on that Blogger account — Blogger → your avatar → **Manage your Google account** / Blogger profile — updates every post byline and the footer on the website within 10 minutes. The archive's original author was *Badko Rayon TKA-TPA Kecamatan Moyudan*, which is probably what it should say.

## A note on the website's language

The website's own wording is **Indonesian** — the menu reads *Beranda, Arsip, Direktori TPA, Tentang, Kontak*, the search button says *Cari*, and page numbers read *Halaman 1 dari 4*. Nothing you write in Blogger is translated; only the site's own labels and buttons changed.

## Comments

Comments are written and moderated **in Blogger** (Blogger → Comments). The website shows them read-only under each post; there is deliberately no comment form or contact form on the website — the Contact page is just an email link.

## If something looks wrong on the website

1. Check the post in Blogger first (typo, missing label, missing image).
2. Fix it in Blogger, wait 10 minutes, refresh the website.
3. Still wrong after 15 minutes? Contact the site administrator (see Runbook).
