-- Create no_series table
CREATE TABLE IF NOT EXISTS no_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  starting_no INTEGER NOT NULL DEFAULT 1,
  ending_no INTEGER NOT NULL DEFAULT 999999,
  last_no_used INTEGER NOT NULL DEFAULT 0,
  warning_no INTEGER,
  increment_by_no INTEGER NOT NULL DEFAULT 1,
  allow_gaps BOOLEAN DEFAULT FALSE,
  date_order BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_no_series_code ON no_series(code);

-- Add comment
COMMENT ON TABLE no_series IS 'Number series configuration for auto-generating sequential numbers';
