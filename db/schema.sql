DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS parties;
DROP TABLE IF EXISTS voters;

CREATE TABLE parties (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE candidates (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    party_id INTEGER,
    industry_connected BOOLEAN NOT NULL,
    -- No ID can be inserted into candidates if it doesn't also exist in parties table
    -- parties table MUST be defined first before candidates table
    -- candidates table MUST be dropped beofre parties table
    CONSTRAINT fk_party FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL
);

CREATE TABLE voters(
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    email VARCHAR(50) NOT NULL,
    -- if don't specify NOT NULL, field can be NULL if value not provided in INSERT
    -- DEFAULT can specify what the value should be if no value provided
    -- CURRENT_TIMESTAMP is DEFAULT value
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);