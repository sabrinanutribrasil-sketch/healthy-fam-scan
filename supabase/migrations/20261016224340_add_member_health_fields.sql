-- Add detailed health profile columns to family_members
-- Supports README spec item 3: weight, height, sex, activity level, occupation, medical conditions

ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS weight_kg numeric(5,2),
  ADD COLUMN IF NOT EXISTS height_cm integer,
  ADD COLUMN IF NOT EXISTS sex text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS activity_level text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS occupation text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS medical_conditions text[] DEFAULT '{}';

-- Add a check constraint for activity_level values
ALTER TABLE family_members
  DROP CONSTRAINT IF EXISTS chk_activity_level;
ALTER TABLE family_members
  ADD CONSTRAINT chk_activity_level
  CHECK (activity_level IS NULL OR activity_level IN ('Sedentário', 'Leve', 'Moderado', 'Ativo', 'Muito ativo'));

-- Add a check constraint for sex values
ALTER TABLE family_members
  DROP CONSTRAINT IF EXISTS chk_sex;
ALTER TABLE family_members
  ADD CONSTRAINT chk_sex
  CHECK (sex IS NULL OR sex IN ('Feminino', 'Masculino', 'Outro'));

-- Add check constraints for reasonable ranges
ALTER TABLE family_members
  DROP CONSTRAINT IF EXISTS chk_weight;
ALTER TABLE family_members
  ADD CONSTRAINT chk_weight
  CHECK (weight_kg IS NULL OR (weight_kg >= 0.5 AND weight_kg <= 500));

ALTER TABLE family_members
  DROP CONSTRAINT IF EXISTS chk_height;
ALTER TABLE family_members
  ADD CONSTRAINT chk_height
  CHECK (height_cm IS NULL OR (height_cm >= 30 AND height_cm <= 250));
