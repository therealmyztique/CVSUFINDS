-- RLS policies for image_emb column updates on lost_reports and found_reports
-- These policies allow users to update the image_emb column on their own reports

-- Enable RLS if not already enabled
ALTER TABLE lost_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE found_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to update their own lost reports (including image_emb)
DROP POLICY IF EXISTS "Users can update own lost reports" ON lost_reports;
CREATE POLICY "Users can update own lost reports" ON lost_reports
    FOR UPDATE
    USING (auth.uid() = reporter_id)
    WITH CHECK (auth.uid() = reporter_id);

-- Policy: Allow users to update their own found reports (including image_emb)
DROP POLICY IF EXISTS "Users can update own found reports" ON found_reports;
CREATE POLICY "Users can update own found reports" ON found_reports
    FOR UPDATE
    USING (auth.uid() = reporter_id)
    WITH CHECK (auth.uid() = reporter_id);

-- Policy: Allow service role to update any report (for edge functions)
-- Note: Service role bypasses RLS by default, but this is here for documentation

-- Policy: Allow authenticated users to read all reports (for matching)
DROP POLICY IF EXISTS "Anyone can read lost reports" ON lost_reports;
CREATE POLICY "Anyone can read lost reports" ON lost_reports
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Anyone can read found reports" ON found_reports;
CREATE POLICY "Anyone can read found reports" ON found_reports
    FOR SELECT
    USING (true);

-- Policy: Allow authenticated users to insert their own reports
DROP POLICY IF EXISTS "Users can insert own lost reports" ON lost_reports;
CREATE POLICY "Users can insert own lost reports" ON lost_reports
    FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can insert own found reports" ON found_reports;
CREATE POLICY "Users can insert own found reports" ON found_reports
    FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);
