CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS public.places (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  area text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Area',
  city text NOT NULL DEFAULT 'Bengaluru',
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  capacity numeric NOT NULL DEFAULT 1500,
  vehicles numeric NOT NULL DEFAULT 0,
  speed numeric NOT NULL DEFAULT 0,
  signal numeric NOT NULL DEFAULT 0,
  samples integer NOT NULL DEFAULT 0,
  search text NOT NULL DEFAULT ''
);

GRANT SELECT ON public.places TO anon;
GRANT SELECT ON public.places TO authenticated;
GRANT ALL ON public.places TO service_role;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public read places" ON public.places;
CREATE POLICY "public read places" ON public.places FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS places_search_trgm ON public.places USING gin (search public.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS places_name_idx ON public.places (name);
CREATE INDEX IF NOT EXISTS places_geo_idx ON public.places (lat, lng);