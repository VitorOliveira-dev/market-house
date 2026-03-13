/**
 * Household Migration SQL
 * Adds multi-household support to the existing schema
 * Run this in your Supabase SQL Editor AFTER the base schema
 */

-- Create households table
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_households junction table (many-to-many)
CREATE TABLE IF NOT EXISTS user_households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, household_id)
);

-- Add household_id to existing tables
ALTER TABLE categories 
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE CASCADE;

ALTER TABLE items 
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE CASCADE;

ALTER TABLE shopping_list_items 
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE CASCADE;

ALTER TABLE cart_items 
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE CASCADE;

ALTER TABLE purchases 
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE CASCADE;

ALTER TABLE purchase_items 
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE CASCADE;

ALTER TABLE pantry_items 
  ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE CASCADE;

-- Create indexes for household_id columns
CREATE INDEX IF NOT EXISTS idx_categories_household_id ON categories(household_id);
CREATE INDEX IF NOT EXISTS idx_items_household_id ON items(household_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_household_id ON shopping_list_items(household_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_household_id ON cart_items(household_id);
CREATE INDEX IF NOT EXISTS idx_purchases_household_id ON purchases(household_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_household_id ON purchase_items(household_id);
CREATE INDEX IF NOT EXISTS idx_pantry_items_household_id ON pantry_items(household_id);
CREATE INDEX IF NOT EXISTS idx_user_households_user_id ON user_households(user_id);
CREATE INDEX IF NOT EXISTS idx_user_households_household_id ON user_households(household_id);

-- Enable RLS on new tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_households ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (we'll recreate them with household checks)
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

DROP POLICY IF EXISTS "Users can view their own items" ON items;
DROP POLICY IF EXISTS "Users can insert their own items" ON items;
DROP POLICY IF EXISTS "Users can update their own items" ON items;
DROP POLICY IF EXISTS "Users can delete their own items" ON items;

DROP POLICY IF EXISTS "Users can view their own shopping list items" ON shopping_list_items;
DROP POLICY IF EXISTS "Users can insert their own shopping list items" ON shopping_list_items;
DROP POLICY IF EXISTS "Users can update their own shopping list items" ON shopping_list_items;
DROP POLICY IF EXISTS "Users can delete their own shopping list items" ON shopping_list_items;

DROP POLICY IF EXISTS "Users can view their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON cart_items;

DROP POLICY IF EXISTS "Users can view their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can insert their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can update their own purchases" ON purchases;
DROP POLICY IF EXISTS "Users can delete their own purchases" ON purchases;

DROP POLICY IF EXISTS "Users can view their own purchase items" ON purchase_items;
DROP POLICY IF EXISTS "Users can insert their own purchase items" ON purchase_items;
DROP POLICY IF EXISTS "Users can update their own purchase items" ON purchase_items;
DROP POLICY IF EXISTS "Users can delete their own purchase items" ON purchase_items;

DROP POLICY IF EXISTS "Users can view their own pantry items" ON pantry_items;
DROP POLICY IF EXISTS "Users can insert their own pantry items" ON pantry_items;
DROP POLICY IF EXISTS "Users can update their own pantry items" ON pantry_items;
DROP POLICY IF EXISTS "Users can delete their own pantry items" ON pantry_items;

-- Helper function to check if user has access to household
-- SECURITY DEFINER permite que a função execute com privilégios do owner
CREATE OR REPLACE FUNCTION user_has_household_access(household_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  -- Usar query direta sem depender de RLS
  SELECT EXISTS (
    SELECT 1 FROM user_households
    WHERE user_id = auth.uid()
    AND household_id = household_uuid
  ) INTO has_access;
  
  RETURN COALESCE(has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for user_households (sem recursão)
-- Política simples: usuário só vê/gerencia suas próprias associações
CREATE POLICY "Users can view own memberships" ON user_households
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own memberships" ON user_households
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own memberships" ON user_households
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own memberships" ON user_households
  FOR DELETE 
  USING (user_id = auth.uid());

-- RLS Policies for households (usando IN subquery para evitar recursão)
CREATE POLICY "Users view households they belong to" ON households
  FOR SELECT 
  USING (
    id IN (
      SELECT household_id 
      FROM user_households 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create households" ON households
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update households" ON households
  FOR UPDATE 
  USING (
    id IN (
      SELECT household_id 
      FROM user_households 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners can delete households" ON households
  FOR DELETE 
  USING (
    id IN (
      SELECT household_id 
      FROM user_households 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- Updated RLS Policies for categories (with household check)
CREATE POLICY "Users can view categories in their households" ON categories
  FOR SELECT USING (user_has_household_access(household_id));

CREATE POLICY "Users can insert categories in their households" ON categories
  FOR INSERT WITH CHECK (user_has_household_access(household_id));

CREATE POLICY "Users can update categories in their households" ON categories
  FOR UPDATE USING (user_has_household_access(household_id));

CREATE POLICY "Users can delete categories in their households" ON categories
  FOR DELETE USING (user_has_household_access(household_id));

-- Updated RLS Policies for items (with household check)
CREATE POLICY "Users can view items in their households" ON items
  FOR SELECT USING (user_has_household_access(household_id));

CREATE POLICY "Users can insert items in their households" ON items
  FOR INSERT WITH CHECK (user_has_household_access(household_id));

CREATE POLICY "Users can update items in their households" ON items
  FOR UPDATE USING (user_has_household_access(household_id));

CREATE POLICY "Users can delete items in their households" ON items
  FOR DELETE USING (user_has_household_access(household_id));

-- Updated RLS Policies for shopping_list_items (with household check)
CREATE POLICY "Users can view shopping list items in their households" ON shopping_list_items
  FOR SELECT USING (user_has_household_access(household_id));

CREATE POLICY "Users can insert shopping list items in their households" ON shopping_list_items
  FOR INSERT WITH CHECK (user_has_household_access(household_id));

CREATE POLICY "Users can update shopping list items in their households" ON shopping_list_items
  FOR UPDATE USING (user_has_household_access(household_id));

CREATE POLICY "Users can delete shopping list items in their households" ON shopping_list_items
  FOR DELETE USING (user_has_household_access(household_id));

-- Updated RLS Policies for cart_items (with household check)
CREATE POLICY "Users can view cart items in their households" ON cart_items
  FOR SELECT USING (user_has_household_access(household_id));

CREATE POLICY "Users can insert cart items in their households" ON cart_items
  FOR INSERT WITH CHECK (user_has_household_access(household_id));

CREATE POLICY "Users can update cart items in their households" ON cart_items
  FOR UPDATE USING (user_has_household_access(household_id));

CREATE POLICY "Users can delete cart items in their households" ON cart_items
  FOR DELETE USING (user_has_household_access(household_id));

-- Updated RLS Policies for purchases (with household check)
CREATE POLICY "Users can view purchases in their households" ON purchases
  FOR SELECT USING (user_has_household_access(household_id));

CREATE POLICY "Users can insert purchases in their households" ON purchases
  FOR INSERT WITH CHECK (user_has_household_access(household_id));

CREATE POLICY "Users can update purchases in their households" ON purchases
  FOR UPDATE USING (user_has_household_access(household_id));

CREATE POLICY "Users can delete purchases in their households" ON purchases
  FOR DELETE USING (user_has_household_access(household_id));

-- Updated RLS Policies for purchase_items (with household check)
CREATE POLICY "Users can view purchase items in their households" ON purchase_items
  FOR SELECT USING (user_has_household_access(household_id));

CREATE POLICY "Users can insert purchase items in their households" ON purchase_items
  FOR INSERT WITH CHECK (user_has_household_access(household_id));

CREATE POLICY "Users can update purchase items in their households" ON purchase_items
  FOR UPDATE USING (user_has_household_access(household_id));

CREATE POLICY "Users can delete purchase items in their households" ON purchase_items
  FOR DELETE USING (user_has_household_access(household_id));

-- Updated RLS Policies for pantry_items (with household check)
CREATE POLICY "Users can view pantry items in their households" ON pantry_items
  FOR SELECT USING (user_has_household_access(household_id));

CREATE POLICY "Users can insert pantry items in their households" ON pantry_items
  FOR INSERT WITH CHECK (user_has_household_access(household_id));

CREATE POLICY "Users can update pantry items in their households" ON pantry_items
  FOR UPDATE USING (user_has_household_access(household_id));

CREATE POLICY "Users can delete pantry items in their households" ON pantry_items
  FOR DELETE USING (user_has_household_access(household_id));

-- Triggers for updated_at on new tables
CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON households
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: Auto-adding user to household only works when creating via authenticated app
-- When creating households via SQL Editor, you must manually insert into user_households
-- See HOUSEHOLD_SETUP.md for instructions

-- Optional: If you want to migrate existing data to a default household
-- Uncomment and run this after creating your first household
/*
DO $$
DECLARE
  default_household_id UUID;
BEGIN
  -- Replace this with your actual default household ID
  default_household_id := 'YOUR_DEFAULT_HOUSEHOLD_ID_HERE';
  
  UPDATE categories SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE items SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE shopping_list_items SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE cart_items SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE purchases SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE purchase_items SET household_id = default_household_id WHERE household_id IS NULL;
  UPDATE pantry_items SET household_id = default_household_id WHERE household_id IS NULL;
END $$;
*/
