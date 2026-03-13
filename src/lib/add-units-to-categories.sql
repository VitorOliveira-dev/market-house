/**
 * Category Units Migration
 * Adds units field to categories table
 * Execute this in your Supabase SQL Editor
 */

-- Add units column to categories table
-- JSONB is perfect for storing array of strings
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS units JSONB DEFAULT '["un"]'::jsonb;

-- Add index for better query performance on units
CREATE INDEX IF NOT EXISTS idx_categories_units ON categories USING GIN (units);

-- Update existing categories to have default unit
-- This ensures all existing categories have at least 'un' (unidade) as available unit
UPDATE categories 
SET units = '["un"]'::jsonb 
WHERE units IS NULL OR jsonb_array_length(units) = 0;

-- Example: Update specific categories with appropriate units
-- You can customize these based on your existing categories

-- Example for Bebidas (Drinks)
UPDATE categories 
SET units = '["L", "ml", "lata", "garrafa", "un"]'::jsonb 
WHERE LOWER(name) LIKE '%bebida%';

-- Example for Limpeza (Cleaning)
UPDATE categories 
SET units = '["L", "ml", "un"]'::jsonb 
WHERE LOWER(name) LIKE '%limpeza%';

-- Example for Alimentos (Food)
UPDATE categories 
SET units = '["kg", "g", "L", "ml", "un", "pct"]'::jsonb 
WHERE LOWER(name) LIKE '%alimento%' OR LOWER(name) LIKE '%comida%';

-- Example for Laticínios (Dairy)
UPDATE categories 
SET units = '["L", "ml", "kg", "g", "un"]'::jsonb 
WHERE LOWER(name) LIKE '%latic%';

-- Example for Carnes (Meat)
UPDATE categories 
SET units = '["kg", "g", "bandeja", "un"]'::jsonb 
WHERE LOWER(name) LIKE '%carne%';

-- Example for Frutas/Legumes (Fruits/Vegetables)
UPDATE categories 
SET units = '["kg", "g", "un"]'::jsonb 
WHERE LOWER(name) LIKE '%fruta%' OR LOWER(name) LIKE '%legume%' OR LOWER(name) LIKE '%verdura%';

-- Example for Higiene (Hygiene)
UPDATE categories 
SET units = '["un", "ml", "L", "g"]'::jsonb 
WHERE LOWER(name) LIKE '%higiene%';

-- Verification query - See all categories with their units
SELECT 
  id,
  name,
  units,
  jsonb_array_length(units) as unit_count
FROM categories
ORDER BY name;
