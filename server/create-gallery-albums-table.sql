-- Gallery Albums Table
-- Run this script to add album support to the gallery

-- Create gallery_albums table
CREATE TABLE gallery_albums (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(1000),
    sort_order INT DEFAULT 0,
    is_published BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Add album_id column to gallery_items
ALTER TABLE gallery_items ADD album_id UNIQUEIDENTIFIER NULL;

-- Add foreign key constraint
ALTER TABLE gallery_items
ADD CONSTRAINT FK_gallery_items_album
FOREIGN KEY (album_id) REFERENCES gallery_albums(id) ON DELETE SET NULL;

-- Create default album for existing items
INSERT INTO gallery_albums (name, description, sort_order, is_published)
VALUES ('Main Gallery', 'Default gallery album', 0, 1);

-- Assign existing gallery items to default album
UPDATE gallery_items SET album_id = (SELECT TOP 1 id FROM gallery_albums WHERE name = 'Main Gallery') WHERE album_id IS NULL;

-- Create index for album lookups
CREATE INDEX IX_gallery_items_album_id ON gallery_items(album_id);
CREATE INDEX IX_gallery_albums_published ON gallery_albums(is_published, sort_order);
