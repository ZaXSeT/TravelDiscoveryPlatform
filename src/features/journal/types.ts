export interface JournalSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  author_label: string;
  cover_path: string | null;
  is_seed: boolean;
}
