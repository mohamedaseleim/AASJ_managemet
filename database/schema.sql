-- ==============================================================================
-- مجلة أرشيف العلوم الزراعية (AASJ) - جامعة الأزهر، كلية الزراعة بأسيوط
-- Archives of Agriculture Sciences Journal - Relational Database Schema (PostgreSQL)
-- ==============================================================================

-- 1. تفعيل الامتدادات الضرورية (Extensions)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. جدول المستخدمين وحسابات هيئة التحرير والمحكمين (Users & Roles)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'general_supervisor',
        'editor_in_chief',
        'advisory_head',
        'managing_editor',
        'secretary',
        'executive_editor',
        'editor',
        'layout_editor',
        'reviewer',
        'author',
        'admin'
    )),
    title VARCHAR(50) DEFAULT 'د.',
    affiliation TEXT DEFAULT 'كلية الزراعة (فرع أسيوط)، جامعة الأزهر',
    assigned_section VARCHAR(255) NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. جدول الأبحاث والمخطوطات العلمية (Manuscripts)
CREATE TABLE IF NOT EXISTS manuscripts (
    id VARCHAR(64) PRIMARY KEY, -- مثال: AASJ-2026-001
    title TEXT NOT NULL,
    arabic_title TEXT,
    document_type VARCHAR(100) DEFAULT 'Research Article',
    discipline VARCHAR(255) NOT NULL, -- القسم العلمي من الأقسام السبعة
    status VARCHAR(100) NOT NULL,
    comment TEXT,
    author_comments TEXT,
    is_waiting_list BOOLEAN DEFAULT FALSE,
    waiting_reason TEXT,
    waiting_order INTEGER,
    
    -- بيانات الباحث المراسل (Corresponding Author)
    correspond_author_title VARCHAR(50) DEFAULT 'Dr.',
    correspond_author_first_name VARCHAR(100) NOT NULL,
    correspond_author_last_name VARCHAR(100) NOT NULL,
    correspond_author_degree VARCHAR(50) DEFAULT 'PhD',
    correspond_author_position VARCHAR(100) DEFAULT 'Assistant Professor',
    correspond_author_specialty VARCHAR(255),
    correspond_author_email VARCHAR(255) NOT NULL,
    correspond_author_institution TEXT NOT NULL,
    correspond_author_country VARCHAR(100) DEFAULT 'Egypt',
    correspond_author_phone VARCHAR(50),
    
    -- بيانات النشر والمجلد والعدد
    volume_no INTEGER,
    issue_no INTEGER,
    publication_year INTEGER DEFAULT 2026,
    pages_count INTEGER DEFAULT 12,
    doi_code VARCHAR(100),
    
    -- الملفات والمستندات (روابط التخزين السحابي)
    manuscript_file_url TEXT,
    cover_letter_url TEXT,
    similarity_report_url TEXT,
    
    received_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    accepted_date TIMESTAMP WITH TIME ZONE,
    published_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. جدول الباحثين المشاركين في البحث (Manuscript Co-Authors)
CREATE TABLE IF NOT EXISTS manuscript_coauthors (
    id SERIAL PRIMARY KEY,
    manuscript_id VARCHAR(64) REFERENCES manuscripts(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    institution TEXT,
    degree VARCHAR(50),
    author_order INTEGER DEFAULT 1
);

-- 5. جدول مهام ومراجعات التحكيم العلمي (Peer Reviews)
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    manuscript_id VARCHAR(64) REFERENCES manuscripts(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(255) NOT NULL,
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'declined')),
    recommendation VARCHAR(50) CHECK (recommendation IN ('accept', 'minor_revision', 'major_revision', 'reject', 'none')),
    evaluation_score INTEGER CHECK (evaluation_score BETWEEN 0 AND 100),
    comments_to_author TEXT,
    confidential_comments_to_editor TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. جدول الحركات والتدفقات المالية ورسوم النشر (Financial Transactions)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id VARCHAR(64) PRIMARY KEY,
    manuscript_id VARCHAR(64) REFERENCES manuscripts(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('submission_fee', 'publication_fee', 'fast_track', 'reviewer_remuneration', 'layout_fee', 'other')),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EGP',
    status VARCHAR(50) DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'refunded', 'cancelled')),
    payment_method VARCHAR(50) DEFAULT 'bank_transfer',
    receipt_no VARCHAR(100),
    payer_name VARCHAR(255) NOT NULL,
    payer_affiliation TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    recorded_by VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. جدول خطابات القبول الرسمية والوثائق (Acceptance Letters & Certificates)
CREATE TABLE IF NOT EXISTS certificates (
    id VARCHAR(64) PRIMARY KEY,
    manuscript_id VARCHAR(64) REFERENCES manuscripts(id) ON DELETE CASCADE,
    letter_serial_no VARCHAR(100) UNIQUE NOT NULL,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author_name VARCHAR(255) NOT NULL,
    paper_title TEXT NOT NULL,
    volume_no INTEGER,
    issue_no INTEGER,
    scheduled_month VARCHAR(50),
    barcode_data TEXT,
    signed_by_eic VARCHAR(255) DEFAULT 'Prof. Dr. Editor in Chief',
    signed_by_dean VARCHAR(255) DEFAULT 'Prof. Dr. General Supervisor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. جدول سجل تدقيق نشاطات النظام (Audit Activity Logs)
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    manuscript_id VARCHAR(64),
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. إنشاء المؤشرات لتحسين سرعة الاستعلام والبحث (Indexes)
CREATE INDEX IF NOT EXISTS idx_manuscripts_status ON manuscripts(status);
CREATE INDEX IF NOT EXISTS idx_manuscripts_discipline ON manuscripts(discipline);
CREATE INDEX IF NOT EXISTS idx_manuscripts_is_waiting ON manuscripts(is_waiting_list);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_reviews_manuscript ON reviews(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_financial_manuscript ON financial_transactions(manuscript_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp ON activity_logs(timestamp DESC);

-- 10. الحساب الافتراضي للمسؤول (Default Secure Admin Record)
-- ملاحظة: كلمة المرور يتم تشفيرها باستخدام pgcrypto
INSERT INTO users (id, username, password_hash, full_name, email, role, title, affiliation, phone, is_active)
VALUES (
    'USR-ADMIN-01',
    'admin',
    crypt('ChangeThisSecurely2026!', gen_salt('bf')),
    'مدير البوابة الرقمية والنظام (System Admin)',
    'admin.aasj@azhar.edu.eg',
    'admin',
    'م.',
    'وحدة تكنولوجيا المعلومات، كلية الزراعة (أسيوط)، جامعة الأزهر',
    '+20 100 000 0001',
    TRUE
) ON CONFLICT (username) DO NOTHING;
