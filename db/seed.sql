INSERT INTO users (email, password_hash, role) VALUES
  ('admin@example.com',     '$2b$10$psbiQV1n9IDrwMs/g1D6oO900pQs7rBSquVuExPH.v1xGNmin.vhW', 'admin'),
  ('agent1@example.com',    '$2b$10$psbiQV1n9IDrwMs/g1D6oO900pQs7rBSquVuExPH.v1xGNmin.vhW', 'agent'),
  ('agent2@example.com',    '$2b$10$psbiQV1n9IDrwMs/g1D6oO900pQs7rBSquVuExPH.v1xGNmin.vhW', 'agent'),
  ('customer1@example.com', '$2b$10$psbiQV1n9IDrwMs/g1D6oO900pQs7rBSquVuExPH.v1xGNmin.vhW', 'customer'),
  ('customer2@example.com', '$2b$10$psbiQV1n9IDrwMs/g1D6oO900pQs7rBSquVuExPH.v1xGNmin.vhW', 'customer');

INSERT INTO tickets (subject, description, priority, status, customer_id, assignee_id) VALUES
  ('Can''t log in to my account', 'I reset my password but it still says invalid credentials.', 'urgent', 'open', 4, NULL),
  ('Invoice shows the wrong amount', 'My October invoice charged me twice for the same plan.', 'high', 'claimed', 4, 2),
  ('How do I change my email?', 'I want to use my work email instead.', 'low', 'resolved', 5, 3),
  ('App crashes when uploading a photo', 'Every time I attach a photo the app closes.', 'normal', 'open', 5, NULL),
  ('Feature request: dark mode', 'Would love a dark mode option.', 'low', 'closed', 4, 2);

INSERT INTO comments (ticket_id, author_id, body) VALUES
  (2, 2, 'Looking into this now.'),
  (2, 4, 'Thanks, let me know if you need anything.'),
  (3, 3, 'You can change it under Settings > Account.');
