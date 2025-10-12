-- Create calendar_events table for game update notifications
CREATE TABLE IF NOT EXISTS calendar_events (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    game TEXT, -- Which game this event is for (optional)
    event_type TEXT NOT NULL CHECK (event_type IN ('update', 'maintenance', 'event', 'announcement', 'other')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(event_date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_game ON calendar_events(game);
CREATE INDEX IF NOT EXISTS idx_calendar_events_active ON calendar_events(is_active);

-- Insert some sample events
INSERT INTO calendar_events (title, description, event_date, event_time, game, event_type) VALUES
('Seven Knights Re:Birth Update', 'New hero and balance changes', '2025-10-15', '10:00:00', '7KRe', 'update'),
('Wuthering Waves Maintenance', 'Scheduled server maintenance', '2025-10-16', '02:00:00', 'WutheringWaves', 'maintenance'),
('LostSword Event', 'Special Halloween event begins', '2025-10-31', '00:00:00', 'LostSword', 'event');