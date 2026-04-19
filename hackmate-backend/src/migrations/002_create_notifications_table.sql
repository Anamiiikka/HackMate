-- 002_create_notifications_table.sql

CREATE TYPE notification_type AS ENUM (
  'new_request',
  'request_accepted',
  'new_message',
  'team_invite'
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

COMMENT ON TABLE notifications IS 'Stores notifications for users.';
COMMENT ON COLUMN notifications.user_id IS 'The user who receives the notification.';
COMMENT ON COLUMN notifications.type IS 'The type of notification (e.g., new_request, new_message).';
COMMENT ON COLUMN notifications.link IS 'A URL or path to the relevant content.';
COMMENT ON COLUMN notifications.is_read IS 'Whether the user has read the notification.';
