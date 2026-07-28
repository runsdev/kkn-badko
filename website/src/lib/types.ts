// Domain types (SRS §3.2.10 data constructs). All *Html fields are
// sanitized in the service layer before they leave it (FR-008).

export interface PostSummary {
  /**
   * Blogger's author display name. Optional on a summary because it is only
   * requested on list endpoints, where it rides along free; `Post` narrows it
   * to required. May be "" — never render a dangling separator for it.
   */
  author?: string;
  /**
   * First image found in the post body, upsized to card width. Absent on the
   * 15 of 35 archive posts that carry no image — every consumer must handle
   * that, and no layout may depend on a thumbnail existing.
   */
  image?: string;
  id: string;
  title: string;
  slug: string;
  published: string; // ISO 8601
  labels: string[];
  excerpt: string; // plain text
}

export interface Post extends PostSummary {
  author: string;
  contentHtml: string; // sanitized
  /**
   * The post's canonical Blogger URL. Kept on the detail view because Blogger's
   * comment editor is the only surface that can accept a new comment, and it
   * lives at this address — see lib/comments.ts.
   */
  url: string;
}

export interface PostComment {
  id: string;
  author: string;
  published: string;
  contentHtml: string; // sanitized
}

export interface StaticPage {
  id: string;
  title: string;
  contentHtml: string; // sanitized
}

export interface PostListResult {
  posts: PostSummary[];
  page: number;
  totalPages: number;
  totalPosts: number;
}
