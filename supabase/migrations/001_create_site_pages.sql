CREATE TABLE IF NOT EXISTS site_pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  seo_title text,
  seo_description text,
  og_image text,
  canonical_url text,
  no_index boolean NOT NULL DEFAULT false,
  show_in_nav boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published pages"
  ON site_pages FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can manage pages"
  ON site_pages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
