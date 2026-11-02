DROP TABLE IF EXISTS comments, tickets, users;

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'customer'
                CHECK (role IN ('customer', 'agent', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tickets (
  id          SERIAL PRIMARY KEY,
  subject     TEXT NOT NULL,
  description TEXT NOT NULL,
  priority    TEXT NOT NULL DEFAULT 'normal'
              CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'claimed', 'resolved', 'closed')),
  customer_id INTEGER NOT NULL REFERENCES users(id),
  assignee_id INTEGER REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tickets_status_idx ON tickets (status);
CREATE INDEX tickets_customer_id_idx ON tickets (customer_id);
CREATE INDEX tickets_assignee_id_idx ON tickets (assignee_id);

CREATE TABLE comments (
  id         SERIAL PRIMARY KEY,
  ticket_id  INTEGER NOT NULL REFERENCES tickets(id),
  author_id  INTEGER NOT NULL REFERENCES users(id),
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX comments_ticket_id_idx ON comments (ticket_id);
