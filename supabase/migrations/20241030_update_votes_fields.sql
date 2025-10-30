-- Migración: Actualizar campos de la tabla votes
-- Fecha: 2024-10-30
-- Descripción: Hacer que DNI, department, province y district sean obligatorios
--              y hacer que email sea opcional

-- Hacer que email sea opcional (nullable)
ALTER TABLE votes 
  ALTER COLUMN email DROP NOT NULL;

-- Asegurarse de que los nuevos campos obligatorios no sean nulos
-- (si ya existen votos con estos campos nulos, primero actualizar con valores por defecto)

-- Actualizar registros existentes que tengan valores nulos
UPDATE votes 
SET dni = 'NO_REGISTRADO'
WHERE dni IS NULL;

UPDATE votes 
SET department = 'NO_ESPECIFICADO'
WHERE department IS NULL;

UPDATE votes 
SET province = 'NO_ESPECIFICADO'
WHERE province IS NULL;

UPDATE votes 
SET district = 'NO_ESPECIFICADO'
WHERE district IS NULL;

-- Ahora hacer que estos campos sean obligatorios
ALTER TABLE votes 
  ALTER COLUMN dni SET NOT NULL;

ALTER TABLE votes 
  ALTER COLUMN department SET NOT NULL;

ALTER TABLE votes 
  ALTER COLUMN province SET NOT NULL;

ALTER TABLE votes 
  ALTER COLUMN district SET NOT NULL;

-- Agregar índice para DNI para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_votes_dni ON votes(dni);

-- Agregar índice para ubicación geográfica
CREATE INDEX IF NOT EXISTS idx_votes_location ON votes(department, province, district);

-- Agregar comentarios a las columnas
COMMENT ON COLUMN votes.dni IS 'Documento Nacional de Identidad del votante (8 dígitos)';
COMMENT ON COLUMN votes.department IS 'Departamento de residencia del votante';
COMMENT ON COLUMN votes.province IS 'Provincia de residencia del votante';
COMMENT ON COLUMN votes.district IS 'Distrito de residencia del votante';
COMMENT ON COLUMN votes.email IS 'Correo electrónico del votante (opcional)';

