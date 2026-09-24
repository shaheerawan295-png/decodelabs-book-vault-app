-- Book Vault schema | Author: Muhammad Shaheer Haider
-- Relationship: categories (1) ──< books (many)

CREATE TABLE IF NOT EXISTS categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS books (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(150) NOT NULL CHECK (char_length(trim(title)) > 0),
  author      VARCHAR(100) NOT NULL CHECK (char_length(trim(author)) > 0),
  isbn        VARCHAR(17)  UNIQUE,
  year        SMALLINT     CHECK (year BETWEEN 1000 AND 2100),
  pages       INTEGER      CHECK (pages > 0),
  status      VARCHAR(12)  NOT NULL DEFAULT 'to_read'
              CHECK (status IN ('to_read', 'reading', 'finished')),
  rating      SMALLINT     CHECK (rating BETWEEN 1 AND 5),
  category_id INTEGER      REFERENCES categories(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_status   ON books(status);

INSERT INTO categories (name) VALUES
  ('Fiction'), ('Science'), ('Technology'), ('History'), ('Philosophy')
ON CONFLICT (name) DO NOTHING;
