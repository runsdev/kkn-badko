// Domain types (SRS §3.2.10 data constructs). All *Html fields are
// sanitized in the service layer before they leave it (FR-008).

export interface PostSummary {
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
