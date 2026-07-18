-- ============================================================
-- Campus Connect — Post Section schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS campus_connect
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE campus_connect;

CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100)  NOT NULL,
  prn           VARCHAR(20)   NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('student','faculty') NOT NULL DEFAULT 'student',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS opportunities (
  id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title              VARCHAR(150)      NOT NULL,
  category           VARCHAR(50)       NOT NULL,
  company            VARCHAR(150)      NOT NULL,
  description        TEXT              NOT NULL,
  registration_link  VARCHAR(500)      NOT NULL,
  last_date          DATE              NOT NULL,
  location           ENUM('Online','Offline') NOT NULL DEFAULT 'Online',
  poster_path        VARCHAR(255)      NULL,
  posted_by          VARCHAR(100)      NOT NULL,
  posted_by_role     ENUM('student','faculty','admin') NOT NULL DEFAULT 'student',
  user_id            INT UNSIGNED      NULL,
  status             ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  featured           TINYINT(1)        NOT NULL DEFAULT 0,
  created_at         TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at        TIMESTAMP         NULL,

  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_last_date (last_date),
  CONSTRAINT fk_opportunities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
