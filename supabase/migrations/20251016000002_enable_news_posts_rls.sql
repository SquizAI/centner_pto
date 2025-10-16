-- Enable RLS on news_posts table
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

-- POLICY 1: Public Read Access
-- Anonymous and authenticated users can view published posts that have reached their publish_date
CREATE POLICY "Public users can view published posts"
    ON news_posts
    FOR SELECT
    USING (
        published = TRUE
        AND publish_date IS NOT NULL
        AND publish_date <= NOW()
    );

-- POLICY 2: Admin Full Access
-- Users with 'admin' or 'super_admin' role can perform all operations
CREATE POLICY "Admins can manage all posts"
    ON news_posts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- POLICY 3: Author Edit Own Drafts
-- Authors can update their own draft posts (not yet published)
CREATE POLICY "Authors can edit own drafts"
    ON news_posts
    FOR UPDATE
    USING (
        auth.uid() = author_id
        AND published = FALSE
    )
    WITH CHECK (
        auth.uid() = author_id
        AND published = FALSE
    );

-- POLICY 4: Admin Insert
-- Only admins can create new posts
CREATE POLICY "Admins can create posts"
    ON news_posts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- POLICY 5: Admin Delete
-- Only admins can delete posts
CREATE POLICY "Admins can delete posts"
    ON news_posts
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );
