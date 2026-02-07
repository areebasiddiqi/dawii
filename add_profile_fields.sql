-- Add dialect field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS dialect TEXT CHECK (dialect IN ('hijazi', 'najdi', 'shimali', 'sharqawi', 'janoubi'));

-- Add bank info fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.dialect IS 'User dialect: hijazi, najdi, shimali, sharqawi, or janoubi';
COMMENT ON COLUMN profiles.iban IS 'User IBAN for payments';
COMMENT ON COLUMN profiles.bank_name IS 'User bank name';
