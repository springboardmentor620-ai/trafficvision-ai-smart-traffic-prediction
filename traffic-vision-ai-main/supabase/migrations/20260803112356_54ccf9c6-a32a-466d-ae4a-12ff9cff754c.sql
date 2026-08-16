
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','operator','analyst','viewer');
CREATE TYPE public.congestion_category AS ENUM ('Low','Medium','High');
CREATE TYPE public.road_status AS ENUM ('Free flow','Moderate','Heavy','Gridlock');
CREATE TYPE public.alert_severity AS ENUM ('Critical','High','Medium','Low');
CREATE TYPE public.alert_status AS ENUM ('Active','Acknowledged','Resolved');

-- ============ SHARED ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  mobile TEXT,
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- new user -> profile + default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, mobile)
  VALUES (NEW.id,
          COALESCE(NEW.raw_user_meta_data->>'full_name',''),
          COALESCE(NEW.email,''),
          NEW.raw_user_meta_data->>'mobile')
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id,'operator')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ROADS ============
CREATE TABLE public.roads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  area TEXT NOT NULL,
  road_type TEXT NOT NULL DEFAULT 'Arterial',
  lanes INT NOT NULL DEFAULT 4,
  road_width_m NUMERIC NOT NULL DEFAULT 12,
  length_km NUMERIC NOT NULL DEFAULT 5,
  signals INT NOT NULL DEFAULT 2,
  cameras INT NOT NULL DEFAULT 4,
  condition TEXT NOT NULL DEFAULT 'Good',
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ TRAFFIC DATA ============
CREATE TABLE public.traffic_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  road_id UUID NOT NULL REFERENCES public.roads(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  hour_of_day INT NOT NULL,
  day_of_week INT NOT NULL,
  is_holiday BOOLEAN NOT NULL DEFAULT false,
  is_peak BOOLEAN NOT NULL DEFAULT false,
  weather TEXT NOT NULL DEFAULT 'Clear',
  vehicle_count INT NOT NULL,
  avg_speed NUMERIC NOT NULL,
  occupancy NUMERIC NOT NULL,
  congestion NUMERIC NOT NULL,
  travel_time_min NUMERIC NOT NULL DEFAULT 0,
  signal_delay_sec INT NOT NULL DEFAULT 0,
  accident_flag BOOLEAN NOT NULL DEFAULT false,
  status public.road_status NOT NULL DEFAULT 'Moderate'
);
CREATE INDEX idx_traffic_road_time ON public.traffic_data(road_id, recorded_at DESC);
CREATE INDEX idx_traffic_hour ON public.traffic_data(hour_of_day);

CREATE TABLE public.vehicle_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  road_id UUID NOT NULL REFERENCES public.roads(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cars INT NOT NULL DEFAULT 0,
  buses INT NOT NULL DEFAULT 0,
  bikes INT NOT NULL DEFAULT 0,
  autos INT NOT NULL DEFAULT 0,
  trucks INT NOT NULL DEFAULT 0,
  emergency INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_vc_road ON public.vehicle_counts(road_id, recorded_at DESC);

CREATE TABLE public.congestion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  road_id UUID NOT NULL REFERENCES public.roads(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  congestion_pct NUMERIC NOT NULL,
  category public.congestion_category NOT NULL DEFAULT 'Medium'
);

CREATE TABLE public.weather (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL DEFAULT 'Bengaluru',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  condition TEXT NOT NULL,
  temp_c NUMERIC NOT NULL,
  rain_mm NUMERIC NOT NULL DEFAULT 0,
  humidity INT NOT NULL DEFAULT 60,
  wind_kph NUMERIC NOT NULL DEFAULT 8
);

CREATE TABLE public.road_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  road_id UUID NOT NULL REFERENCES public.roads(id) ON DELETE CASCADE,
  condition TEXT NOT NULL,
  surface_score INT NOT NULL DEFAULT 80,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.accidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  road_id UUID REFERENCES public.roads(id) ON DELETE SET NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  severity public.alert_severity NOT NULL DEFAULT 'Medium',
  description TEXT NOT NULL DEFAULT '',
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  casualties INT NOT NULL DEFAULT 0
);

CREATE TABLE public.heatmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer TEXT NOT NULL,
  grid_x INT NOT NULL,
  grid_y INT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  value NUMERIC NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_heatmaps_layer ON public.heatmaps(layer);

CREATE TABLE public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric TEXT NOT NULL,
  period TEXT NOT NULL,
  bucket TEXT NOT NULL,
  bucket_index INT NOT NULL DEFAULT 0,
  value NUMERIC NOT NULL,
  dims JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX idx_analytics_metric ON public.analytics(metric, period, bucket_index);

CREATE TABLE public.ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  algorithm TEXT NOT NULL DEFAULT 'RandomForestRegressor',
  status TEXT NOT NULL DEFAULT 'Serving',
  accuracy NUMERIC, precision_score NUMERIC, recall NUMERIC, f1 NUMERIC,
  mae NUMERIC, rmse NUMERIC, r2 NUMERIC,
  dataset_rows INT NOT NULL DEFAULT 0,
  trained_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  confusion JSONB NOT NULL DEFAULT '[]'::jsonb,
  artifact TEXT
);

CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  road_id UUID REFERENCES public.roads(id) ON DELETE SET NULL,
  area TEXT NOT NULL DEFAULT '',
  severity public.alert_severity NOT NULL DEFAULT 'Medium',
  status public.alert_status NOT NULL DEFAULT 'Active',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_alerts_created ON public.alerts(created_at DESC);

-- public/reference read
GRANT SELECT ON public.roads, public.traffic_data, public.vehicle_counts, public.congestion,
  public.weather, public.road_conditions, public.accidents, public.heatmaps, public.analytics,
  public.ai_models, public.alerts TO anon, authenticated;
GRANT ALL ON public.roads, public.traffic_data, public.vehicle_counts, public.congestion,
  public.weather, public.road_conditions, public.accidents, public.heatmaps, public.analytics,
  public.ai_models, public.alerts TO service_role;

ALTER TABLE public.roads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.congestion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.road_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.heatmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read roads" ON public.roads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read traffic" ON public.traffic_data FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read vc" ON public.vehicle_counts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read congestion" ON public.congestion FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read weather" ON public.weather FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read rc" ON public.road_conditions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read accidents" ON public.accidents FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read heatmaps" ON public.heatmaps FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read analytics" ON public.analytics FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read models" ON public.ai_models FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read alerts" ON public.alerts FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admin write roads" ON public.roads FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write alerts" ON public.alerts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'operator')) WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'operator'));

-- ============ USER OWNED ============
CREATE TABLE public.traffic_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_area TEXT NOT NULL,
  destination_area TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  traffic_density NUMERIC NOT NULL,
  congestion_pct NUMERIC NOT NULL,
  travel_time_min NUMERIC NOT NULL,
  expected_delay_min NUMERIC NOT NULL,
  vehicle_flow INT NOT NULL,
  category public.congestion_category NOT NULL,
  confidence NUMERIC NOT NULL,
  explanation TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended JSONB NOT NULL DEFAULT '{}'::jsonb,
  reasoning TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  period TEXT NOT NULL DEFAULT 'daily',
  format TEXT NOT NULL DEFAULT 'pdf',
  status TEXT NOT NULL DEFAULT 'ready',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_name TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.traffic_predictions, public.routes,
  public.notifications, public.reports, public.settings, public.logs TO authenticated;
GRANT ALL ON public.traffic_predictions, public.routes, public.notifications,
  public.reports, public.settings, public.logs TO service_role;

ALTER TABLE public.traffic_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own predictions" ON public.traffic_predictions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own routes" ON public.routes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own reports" ON public.reports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own settings" ON public.settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own logs read" ON public.logs FOR SELECT TO authenticated USING (auth.uid() = actor_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own logs insert" ON public.logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id);
