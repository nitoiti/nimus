CREATE TABLE public.beta_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('bcba','therapist','parent','interested')),
  years_experience integer,
  wants_to_codesign boolean NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.beta_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anon + authenticated) to insert an application
CREATE POLICY "Anyone can submit a beta application"
  ON public.beta_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 200
    AND char_length(email) BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND (years_experience IS NULL OR (years_experience >= 0 AND years_experience <= 80))
  );

-- No SELECT/UPDATE/DELETE policies → table is private to service role only