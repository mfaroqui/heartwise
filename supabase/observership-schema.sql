-- ============================================================
-- OBSERVERSHIP STRATEGY ENGINE — Complete Database Schema
-- HeartWise Platform | PostgreSQL (Supabase)
-- ============================================================

-- 1. INSTITUTIONS
-- Major medical centers, hospitals, university programs
CREATE TABLE IF NOT EXISTS obs_institutions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  short_name text,                         -- "Mayo", "CCF", "MGH"
  city text NOT NULL,
  state text NOT NULL,                     -- 2-letter: "MN", "OH"
  region text,                             -- "Midwest", "Northeast", etc.
  type text NOT NULL DEFAULT 'academic',   -- academic, community, VA, private
  prestige_tier smallint DEFAULT 3,        -- 1=top 10, 2=top 25, 3=mid, 4=community, 5=other
  img_friendly boolean DEFAULT false,
  website text,
  logo_url text,
  lat numeric(9,6),
  lng numeric(9,6),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_inst_state ON obs_institutions(state);
CREATE INDEX idx_inst_type ON obs_institutions(type);
CREATE INDEX idx_inst_prestige ON obs_institutions(prestige_tier);
CREATE INDEX idx_inst_img ON obs_institutions(img_friendly);

-- 2. OBSERVERSHIP PROGRAMS
-- Individual observership offerings at institutions
CREATE TABLE IF NOT EXISTS obs_programs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id uuid REFERENCES obs_institutions(id) ON DELETE CASCADE,
  
  -- Core info
  name text NOT NULL,                      -- "Cardiology Observership Program"
  specialty text NOT NULL,                 -- normalized: "cardiology", "general_surgery"
  department text,                         -- "Division of Cardiovascular Medicine"
  description text,
  
  -- Eligibility
  img_eligible boolean DEFAULT true,
  us_student_eligible boolean DEFAULT true,
  visa_sponsorship boolean DEFAULT false,  -- J1/B1 visa support
  visa_types text[],                       -- ['J1','B1/B2','H1B']
  ecfmg_required boolean DEFAULT false,
  usmle_required boolean DEFAULT false,
  min_step1_score integer,                 -- null = not required
  min_step2_score integer,
  requires_us_lor boolean DEFAULT false,   -- needs existing US letters
  english_proficiency text,                -- "TOEFL 90+", "IELTS 7+", null
  
  -- Logistics
  duration_weeks_min smallint DEFAULT 2,
  duration_weeks_max smallint DEFAULT 4,
  is_paid boolean DEFAULT false,
  cost_usd integer DEFAULT 0,             -- application/program fee
  stipend_usd integer DEFAULT 0,
  housing_provided boolean DEFAULT false,
  housing_notes text,
  
  -- Experience quality
  experience_type text DEFAULT 'shadow',   -- shadow, hands_on, hybrid
  lor_provided boolean DEFAULT false,      -- will write LOR?
  lor_guarantee text,                      -- "guaranteed", "upon_request", "rarely", "never"
  patient_contact boolean DEFAULT false,
  emr_access boolean DEFAULT false,
  research_opportunity boolean DEFAULT false,
  teaching_included boolean DEFAULT false,
  certificate_provided boolean DEFAULT false,
  
  -- Application
  application_url text,
  application_email text,
  application_method text,                 -- "online", "email", "portal"
  application_deadline text,               -- "Rolling", "March 15", etc.
  start_dates text,                        -- "Year-round", "July, January"
  spots_per_cycle integer,
  acceptance_rate_est text,                -- "high", "medium", "low", "very_low"
  avg_response_days integer,               -- typical response time
  
  -- Scoring (internal)
  quality_score numeric(3,1) DEFAULT 5.0,  -- 1-10, computed
  img_friendliness_score numeric(3,1) DEFAULT 5.0, -- 1-10
  prestige_score numeric(3,1) DEFAULT 5.0, -- 1-10
  overall_rank integer,
  
  -- Meta
  status text DEFAULT 'active',            -- active, inactive, unverified, archived
  source text,                             -- "official", "user_submitted", "research"
  last_verified_at timestamptz,
  verified_by text,
  notes text,                              -- internal admin notes
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_prog_institution ON obs_programs(institution_id);
CREATE INDEX idx_prog_specialty ON obs_programs(specialty);
CREATE INDEX idx_prog_img ON obs_programs(img_eligible);
CREATE INDEX idx_prog_status ON obs_programs(status);
CREATE INDEX idx_prog_state ON obs_programs USING btree (
  (SELECT state FROM obs_institutions WHERE id = institution_id)
);
CREATE INDEX idx_prog_quality ON obs_programs(quality_score DESC);
CREATE INDEX idx_prog_cost ON obs_programs(cost_usd);
CREATE INDEX idx_prog_visa ON obs_programs(visa_sponsorship);

-- 3. PROGRAM TAGS (flexible tagging)
CREATE TABLE IF NOT EXISTS obs_tags (
  id serial PRIMARY KEY,
  name text NOT NULL UNIQUE,               -- "hands-on", "research-heavy", "networking"
  category text DEFAULT 'general'          -- "experience", "specialty", "visa", "tip"
);

CREATE TABLE IF NOT EXISTS obs_program_tags (
  program_id uuid REFERENCES obs_programs(id) ON DELETE CASCADE,
  tag_id integer REFERENCES obs_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (program_id, tag_id)
);

-- 4. USER SUBMISSIONS
-- Users can submit new programs they've found
CREATE TABLE IF NOT EXISTS obs_user_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text NOT NULL,
  user_name text,
  
  -- Program data (may become a real program after approval)
  institution_name text NOT NULL,
  city text,
  state text,
  specialty text NOT NULL,
  description text,
  website_url text,
  contact_email text,
  img_eligible boolean,
  cost_estimate integer,
  duration_weeks text,
  experience_type text,
  lor_provided boolean,
  
  -- Moderation
  status text DEFAULT 'pending',           -- pending, approved, rejected, duplicate
  admin_notes text,
  approved_program_id uuid REFERENCES obs_programs(id),
  
  -- Anti-spam
  ip_address text,
  submission_count integer DEFAULT 1,      -- track per user
  flagged boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_sub_status ON obs_user_submissions(status);
CREATE INDEX idx_sub_email ON obs_user_submissions(user_email);

-- 5. REVIEWS
-- User reviews of specific programs
CREATE TABLE IF NOT EXISTS obs_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id uuid REFERENCES obs_programs(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  user_name text,
  
  -- Review data
  overall_rating smallint NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  got_lor boolean,
  hands_on_level smallint CHECK (hands_on_level BETWEEN 1 AND 5), -- 1=pure shadow, 5=very hands-on
  worth_cost boolean,
  would_recommend boolean DEFAULT true,
  
  -- Detailed
  pros text,
  cons text,
  tips text,                               -- advice for future applicants
  attended_year smallint,                  -- 2024, 2025, etc.
  attended_duration_weeks smallint,
  is_img boolean,
  
  -- Moderation
  status text DEFAULT 'pending',           -- pending, approved, rejected
  flagged boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_rev_program ON obs_reviews(program_id);
CREATE INDEX idx_rev_status ON obs_reviews(status);
CREATE INDEX idx_rev_rating ON obs_reviews(overall_rating);

-- 6. APPLICATION TRACKING
-- Users track their observership applications
CREATE TABLE IF NOT EXISTS obs_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text NOT NULL,
  program_id uuid REFERENCES obs_programs(id) ON DELETE SET NULL,
  
  status text DEFAULT 'interested',        -- interested, applied, accepted, rejected, completed, withdrawn
  applied_date date,
  response_date date,
  start_date date,
  end_date date,
  notes text,
  
  -- Outcome
  got_lor boolean,
  lor_quality text,                        -- "strong", "generic", "none"
  experience_rating smallint,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_app_user ON obs_applications(user_email);
CREATE INDEX idx_app_program ON obs_applications(program_id);
CREATE INDEX idx_app_status ON obs_applications(status);

-- 7. MATCH SCORES (precomputed for performance)
-- Stores user-program match scores
CREATE TABLE IF NOT EXISTS obs_match_scores (
  user_email text NOT NULL,
  program_id uuid REFERENCES obs_programs(id) ON DELETE CASCADE,
  
  match_score numeric(4,1) NOT NULL,       -- 0-100
  breakdown jsonb,                         -- {"specialty":25, "location":15, "img":20, ...}
  reason text,                             -- human-readable recommendation
  
  computed_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_email, program_id)
);

CREATE INDEX idx_match_user ON obs_match_scores(user_email);
CREATE INDEX idx_match_score ON obs_match_scores(match_score DESC);

-- 8. SEED TAGS
INSERT INTO obs_tags (name, category) VALUES
  ('hands-on', 'experience'),
  ('shadow-only', 'experience'),
  ('research-opportunity', 'experience'),
  ('networking', 'experience'),
  ('lor-guaranteed', 'experience'),
  ('certificate', 'experience'),
  ('teaching-rounds', 'experience'),
  ('img-friendly', 'visa'),
  ('j1-visa', 'visa'),
  ('b1-visa', 'visa'),
  ('no-visa-needed', 'visa'),
  ('ecfmg-required', 'visa'),
  ('free', 'cost'),
  ('low-cost', 'cost'),
  ('paid-stipend', 'cost'),
  ('housing-included', 'cost'),
  ('competitive', 'difficulty'),
  ('moderate', 'difficulty'),
  ('easy-accept', 'difficulty'),
  ('rolling-apps', 'application'),
  ('deadline-based', 'application'),
  ('quick-response', 'application'),
  ('top-10-program', 'prestige'),
  ('top-25-program', 'prestige'),
  ('community-gem', 'prestige')
ON CONFLICT (name) DO NOTHING;

-- 9. RLS POLICIES
ALTER TABLE obs_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_user_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE obs_match_scores ENABLE ROW LEVEL SECURITY;

-- Public read for programs and institutions
CREATE POLICY "Public read institutions" ON obs_institutions FOR SELECT USING (true);
CREATE POLICY "Public read programs" ON obs_programs FOR SELECT USING (status = 'active');

-- Reviews: public read approved, users can insert
CREATE POLICY "Public read approved reviews" ON obs_reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can submit reviews" ON obs_reviews FOR INSERT WITH CHECK (true);

-- Submissions: users can insert, read own
CREATE POLICY "Users can submit" ON obs_user_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users read own submissions" ON obs_user_submissions FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::jsonb->>'email');

-- Applications: users CRUD own
CREATE POLICY "Users manage own applications" ON obs_applications FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::jsonb->>'email');

-- Match scores: users read own
CREATE POLICY "Users read own matches" ON obs_match_scores FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::jsonb->>'email');

