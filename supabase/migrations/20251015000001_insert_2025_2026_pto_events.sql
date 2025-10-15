-- =====================================================
-- CENTNER PTO 2025-2026 EVENTS
-- Migration: Insert all PTO events for school year 2025-2026
-- Created: October 15, 2025
-- =====================================================

-- Insert all PTO events for the 2025-2026 school year
INSERT INTO events (
    title,
    description,
    event_date,
    end_date,
    location,
    campus,
    event_type,
    status,
    max_attendees
) VALUES
-- 1. School Bash / Bee Green Uniform Program
(
    'School Bash / Bee Green Uniform Program',
    'Recycle gently used uniforms donated by school families. Sell at a discount. Proceeds benefit PTO. Chair: Karina Maggioni, Marica Morelli, Fiona Constain',
    '2025-08-23 09:00:00-04'::timestamptz, -- TBD Saturday, using late August as placeholder
    '2025-08-23 15:00:00-04'::timestamptz,
    '1911',
    ARRAY['all'],
    'fundraiser',
    'published',
    NULL
),

-- 2. Middle/High Pool Party
(
    'Middle/High Pool Party',
    'Pool Party for Middle and High School students. Chair: Karina Maggioni, Dania Maida, Florencia Galarraga',
    '2025-09-14 14:00:00-04'::timestamptz,
    '2025-09-14 18:00:00-04'::timestamptz,
    'Centner Residence',
    ARRAY['middle-high'],
    'student_event',
    'published',
    NULL
),

-- 3. Fall Decor
(
    'Fall Decor',
    'Decorate the School for Fall. Chair: Kiana Lowrance, Anika Djordjic. Volunteers needed: 6 (2 per campus)',
    '2025-10-03 09:00:00-04'::timestamptz,
    '2025-10-03 15:00:00-04'::timestamptz,
    'Preschool Campus (Lobby), Elem/HS (Cafe, Lobby & Hallways)',
    ARRAY['all'],
    'other',
    'published',
    6
),

-- 4. Tents of Treasure - Elementary
(
    'Tents of Treasure - Elementary',
    '6 tents decorated. Giant circus Tent with DJ/Entertainment. Chair: Kiana Lowrance. Volunteers needed: 5 per car',
    '2025-10-31 09:00:00-04'::timestamptz,
    '2025-10-31 13:00:00-04'::timestamptz,
    'Elementary Campus Tennis Courts',
    ARRAY['elementary'],
    'student_event',
    'published',
    NULL
),

-- 5. Tents of Treasure - Preschool
(
    'Tents of Treasure - Preschool',
    '6 tents will be decorated in Preschool front atrium. Chair: Sara Monahan, Kristel Diaz. Volunteers needed: 5 per car',
    '2025-10-31 09:00:00-04'::timestamptz,
    '2025-10-31 13:00:00-04'::timestamptz,
    'Preschool Campus front atrium',
    ARRAY['preschool'],
    'student_event',
    'published',
    NULL
),

-- 6. Fall Bash on Wheels
(
    'Fall Bash on Wheels',
    'Party Bus for Middle and High School students. Chair: Dania Maida, Florencia Galarraga',
    '2025-11-15 14:00:00-05'::timestamptz, -- TBD Saturday, using mid-November as placeholder
    '2025-11-15 20:00:00-05'::timestamptz,
    'Middle & High School Campus',
    ARRAY['middle-high'],
    'student_event',
    'published',
    NULL
),

-- 7. Community Service Events
(
    'Community Service Events',
    'With the help of the PTO, a Chair will organize emergency or pre-arranged community events. 4 events per year. Chair: Student Gov Involvement, Erika Lisman',
    '2025-11-01 09:00:00-04'::timestamptz, -- First event placeholder
    '2025-11-01 15:00:00-04'::timestamptz,
    'All Campuses',
    ARRAY['all'],
    'volunteer',
    'published',
    NULL
),

-- 8. Winter Holiday Decor
(
    'Winter Holiday Decor',
    'Decorate all campuses for winter holidays. Chair: Kiana Lowrance, Anika Djordjic',
    '2025-12-05 09:00:00-05'::timestamptz,
    '2025-12-05 15:00:00-05'::timestamptz,
    'All Campuses',
    ARRAY['all'],
    'other',
    'published',
    NULL
),

-- 9. School Spirit Week
(
    'School Spirit Week',
    'Sell themed items during Spirit Week. Classroom Spirit Points/Spirit Jars. Classroom with the most raised gets to choose from the Mystery Prize. Chair: Sara Monahan, Kiana (Elementary), MS/HS Chair needed',
    '2025-12-15 09:00:00-05'::timestamptz,
    '2025-12-19 15:00:00-05'::timestamptz,
    'All Campuses',
    ARRAY['all'],
    'fundraiser',
    'published',
    NULL
),

-- 10. Holiday Gift for Faculty & Staff
(
    'Holiday Gift for Faculty & Staff',
    'Collected funds to be gifted to each faculty & staff member. Write out holiday cards and hand distribute them. Chair: Karina Maggioni, Kristel Diaz, Kiana Lowrance, Dania Maida, Marica Morelli',
    '2025-12-17 09:00:00-05'::timestamptz,
    '2025-12-17 15:00:00-05'::timestamptz,
    'All Campuses',
    ARRAY['all'],
    'other',
    'published',
    NULL
),

-- 11. Bee Green Uniform Sale
(
    'Bee Green Uniform Sale',
    'Bee Green Uniform Sale. Chair: Karina Maggioni, Marica Morelli, Fiona Constain. Volunteers needed: 1 per sale',
    '2026-01-12 09:00:00-05'::timestamptz,
    '2026-01-16 15:00:00-05'::timestamptz,
    'All Campuses',
    ARRAY['all'],
    'fundraiser',
    'published',
    NULL
),

-- 12. Movie Night Under the Stars
(
    'Movie Night Under the Stars',
    'Movie Night Under the Stars. Chair: Dania Maida',
    '2026-02-28 18:00:00-05'::timestamptz,
    '2026-02-28 22:00:00-05'::timestamptz,
    'Elementary School',
    ARRAY['elementary'],
    'student_event',
    'published',
    NULL
),

-- 13. Spring Decor
(
    'Spring Decor',
    'Decorate all campuses for spring. Chair: Kiana Lowrance, Anika Djordjic',
    '2026-03-02 09:00:00-05'::timestamptz,
    '2026-03-02 15:00:00-05'::timestamptz,
    'All Campuses',
    ARRAY['all'],
    'other',
    'published',
    NULL
),

-- 14. Book Fair & Read Across America - Preschool
(
    'Book Fair & Read Across America - Preschool',
    'Hosted by Scholastics. Book Fair for Preschool campus. Chair: Ayssa DiPietro, Valerie Slone. Volunteers needed: 6 per day',
    '2026-03-02 09:00:00-05'::timestamptz,
    '2026-03-06 15:00:00-05'::timestamptz,
    'Preschool',
    ARRAY['preschool'],
    'student_event',
    'published',
    NULL
),

-- 15. Book Fair & Read Across America - Elementary
(
    'Book Fair & Read Across America - Elementary',
    'Hosted by Scholastics. Book Fair for Elementary campus. Chair: Ayssa DiPietro, Marica Morelli. Volunteers needed: 6 per day',
    '2026-03-02 09:00:00-05'::timestamptz,
    '2026-03-06 15:00:00-05'::timestamptz,
    'Elementary',
    ARRAY['elementary'],
    'student_event',
    'published',
    NULL
),

-- 16. Curated Book Fair
(
    'Curated Book Fair',
    'Curated Book Fair for Middle and High School students. Chair: Marcela Gasanz, Branka Vargas',
    '2026-03-02 09:00:00-05'::timestamptz,
    '2026-03-06 15:00:00-05'::timestamptz,
    'Middle & High School, Big Ideas Room',
    ARRAY['middle-high'],
    'student_event',
    'published',
    NULL
),

-- 17. Faculty & Staff Appreciation Week
(
    'Faculty & Staff Appreciation Week',
    'A week of events including breakfast, lunch, snacks, personalized gifts & cash gifts. Chair: Ayssa DiPietro, Valerie Slone (Preschool), Erika Lisman (Elementary), Florencia Galarraga, Ewelina Santino (Middle/High)',
    '2026-04-13 09:00:00-04'::timestamptz, -- Using first week option
    '2026-04-17 15:00:00-04'::timestamptz,
    'All Campuses',
    ARRAY['all'],
    'other',
    'published',
    NULL
),

-- 18. End of Year Middle & High School Party
(
    'End of Year Middle & High School Party',
    'DJ, Food and Drinks. Chair: Dania Maida, Florencia Galarraga, Ewelina Santino',
    '2026-05-30 18:00:00-04'::timestamptz,
    '2026-05-30 23:00:00-04'::timestamptz,
    'MIA 79',
    ARRAY['middle-high'],
    'student_event',
    'published',
    NULL
),

-- 19. Bee Green Uniform Collection & Cap & Gown
(
    'Bee Green Uniform Collection & Cap & Gown',
    'We will start collecting donated uniform and spirit wear items. These items will be for resale to school families at a discounted rate. Chair: Karina Maggioni, Marica Morelli',
    '2026-06-08 09:00:00-04'::timestamptz,
    '2026-06-11 15:00:00-04'::timestamptz,
    'All Campuses',
    ARRAY['all'],
    'fundraiser',
    'published',
    NULL
),

-- 20. End of Year Gift
(
    'End of Year Gift',
    'Collected funds to be gifted to each faculty & staff member. Write out thank you cards and hand distribute. Chair: Karina Maggioni, Kristel Diaz, Kiana Lowrance, Dania Maida, Marica Morelli',
    '2026-06-09 09:00:00-04'::timestamptz,
    '2026-06-09 15:00:00-04'::timestamptz,
    'All Campuses',
    ARRAY['all'],
    'other',
    'published',
    NULL
);

-- Add comment to events table for tracking
COMMENT ON TABLE events IS 'PTO events for 2025-2026 school year added on October 15, 2025';
