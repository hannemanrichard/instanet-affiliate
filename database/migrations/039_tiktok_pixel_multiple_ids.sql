-- TikTok analytics setting: value may contain multiple pixel IDs separated by commas.
UPDATE settings
SET description = 'TikTok Pixel ID(s) for tracking conversions; use a comma to separate multiple IDs (e.g. ID1, ID2)'
WHERE key = 'tiktok_pixel_id';
