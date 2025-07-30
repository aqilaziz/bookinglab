-- ================================================
-- SETUP SUPABASE DATABASE UNTUK LAB KOMPUTER MAM 1 PACIRAN
-- ================================================

-- 1. CREATE TABLES
-- ================

-- Tabel untuk data guru
CREATE TABLE IF NOT EXISTS teachers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel untuk jadwal peminjaman lab
CREATE TABLE IF NOT EXISTS lab_schedules (
  id BIGSERIAL PRIMARY KEY,
  hari VARCHAR(20) NOT NULL CHECK (hari IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')),
  jam INTEGER NOT NULL CHECK (jam >= 1 AND jam <= 9),
  tanggal DATE NOT NULL,
  mapel VARCHAR(255) NOT NULL,
  keperluan TEXT,
  teacher_id BIGINT REFERENCES teachers(id) ON DELETE CASCADE,
  teacher_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint untuk mencegah double booking
  UNIQUE(hari, jam, tanggal)
);

-- 2. CREATE INDEXES
-- =================

-- Index untuk pencarian cepat berdasarkan tanggal
CREATE INDEX IF NOT EXISTS idx_lab_schedules_tanggal ON lab_schedules(tanggal);

-- Index untuk pencarian berdasarkan guru
CREATE INDEX IF NOT EXISTS idx_lab_schedules_teacher_id ON lab_schedules(teacher_id);

-- Index untuk pencarian berdasarkan hari dan jam
CREATE INDEX IF NOT EXISTS idx_lab_schedules_hari_jam ON lab_schedules(hari, jam);

-- Index untuk email guru (untuk login)
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);

-- 3. CREATE FUNCTIONS
-- ===================

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. CREATE TRIGGERS
-- ==================

-- Trigger untuk auto-update updated_at pada tabel teachers
DROP TRIGGER IF EXISTS update_teachers_updated_at ON teachers;
CREATE TRIGGER update_teachers_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk auto-update updated_at pada tabel lab_schedules
DROP TRIGGER IF EXISTS update_lab_schedules_updated_at ON lab_schedules;
CREATE TRIGGER update_lab_schedules_updated_at
    BEFORE UPDATE ON lab_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. SETUP ROW LEVEL SECURITY (RLS)
-- ==================================

-- Enable RLS untuk kedua tabel
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_schedules ENABLE ROW LEVEL SECURITY;

-- Policies untuk tabel teachers
-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Allow read access for teachers" ON teachers;
DROP POLICY IF EXISTS "Allow insert for teachers" ON teachers;
DROP POLICY IF EXISTS "Allow update for teachers" ON teachers;
DROP POLICY IF EXISTS "Allow delete for teachers" ON teachers;

-- Create new policies
CREATE POLICY "Allow read access for teachers" 
ON teachers FOR SELECT 
USING (true);

CREATE POLICY "Allow insert for teachers" 
ON teachers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update for teachers" 
ON teachers FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete for teachers" 
ON teachers FOR DELETE 
USING (true);

-- Policies untuk tabel lab_schedules
-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Allow read access for schedules" ON lab_schedules;
DROP POLICY IF EXISTS "Allow insert for schedules" ON lab_schedules;
DROP POLICY IF EXISTS "Allow update for schedules" ON lab_schedules;
DROP POLICY IF EXISTS "Allow delete for schedules" ON lab_schedules;

-- Create new policies
CREATE POLICY "Allow read access for schedules" 
ON lab_schedules FOR SELECT 
USING (true);

CREATE POLICY "Allow insert for schedules" 
ON lab_schedules FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow update for schedules" 
ON lab_schedules FOR UPDATE 
USING (true);

CREATE POLICY "Allow delete for schedules" 
ON lab_schedules FOR DELETE 
USING (true);

-- 6. INSERT DEMO DATA
-- ===================

-- Insert demo teacher (jika belum ada)
INSERT INTO teachers (name, email, password) 
VALUES ('Guru Demo', 'guru1@sekolah.com', 'password123')
ON CONFLICT (email) DO NOTHING;

-- Insert beberapa guru demo lainnya
INSERT INTO teachers (name, email, password) VALUES 
('Budi Santoso', 'budi@sekolah.com', 'password123'),
('Siti Nurhaliza', 'siti@sekolah.com', 'password123'),
('Ahmad Fauzi', 'ahmad@sekolah.com', 'password123')
ON CONFLICT (email) DO NOTHING;

-- Insert beberapa jadwal demo untuk minggu ini
DO $$
DECLARE
    teacher_id_demo INTEGER;
    current_monday DATE;
BEGIN
    -- Dapatkan ID guru demo
    SELECT id INTO teacher_id_demo FROM teachers WHERE email = 'guru1@sekolah.com' LIMIT 1;
    
    -- Hitung tanggal Senin minggu ini
    current_monday := DATE_TRUNC('week', CURRENT_DATE);
    
    -- Insert jadwal demo jika guru demo ada
    IF teacher_id_demo IS NOT NULL THEN
        INSERT INTO lab_schedules (hari, jam, tanggal, mapel, keperluan, teacher_id, teacher_name) VALUES 
        ('Senin', 1, current_monday, 'Matematika', 'Pembelajaran dengan aplikasi GeoGebra', teacher_id_demo, 'Guru Demo'),
        ('Senin', 3, current_monday, 'Fisika', 'Simulasi gerak parabola', teacher_id_demo, 'Guru Demo'),
        ('Selasa', 2, current_monday + 1, 'Kimia', 'Tabel periodik interaktif', teacher_id_demo, 'Guru Demo'),
        ('Rabu', 4, current_monday + 2, 'Biologi', 'Anatomi tubuh manusia 3D', teacher_id_demo, 'Guru Demo'),
        ('Kamis', 1, current_monday + 3, 'Bahasa Inggris', 'Listening comprehension', teacher_id_demo, 'Guru Demo')
        ON CONFLICT (hari, jam, tanggal) DO NOTHING;
    END IF;
END $$;

-- 7. VERIFICATION QUERIES
-- ========================

-- Cek apakah tabel sudah dibuat dengan benar
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('teachers', 'lab_schedules');

-- Cek jumlah data yang sudah diinsert
SELECT 
    'teachers' as table_name, 
    COUNT(*) as row_count 
FROM teachers
UNION ALL
SELECT 
    'lab_schedules' as table_name, 
    COUNT(*) as row_count 
FROM lab_schedules;

-- ================================================
-- INSTRUKSI PENGGUNAAN:
-- ================================================
-- 1. Copy semua script di atas
-- 2. Buka Supabase Dashboard > SQL Editor
-- 3. Paste dan jalankan script ini
-- 4. Pastikan tidak ada error
-- 5. Cek di Table Editor bahwa tabel sudah terbuat
-- 6. Update SUPABASE_URL dan SUPABASE_ANON_KEY di utils/supabase.js
-- ================================================