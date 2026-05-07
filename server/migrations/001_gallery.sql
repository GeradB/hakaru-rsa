-- Gallery metadata (image bytes live in Azure Blob Storage)
IF OBJECT_ID(N'dbo.gallery_items', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.gallery_items (
    id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT (NEWSEQUENTIALID()),
    title NVARCHAR(255) NULL,
    caption NVARCHAR(1000) NULL,
    blob_name NVARCHAR(500) NOT NULL,
    public_url NVARCHAR(2000) NOT NULL,
    sort_order INT NOT NULL CONSTRAINT DF_gallery_items_sort DEFAULT (0),
    is_published BIT NOT NULL CONSTRAINT DF_gallery_items_published DEFAULT (0),
    created_at DATETIME2 NOT NULL CONSTRAINT DF_gallery_items_created DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_gallery_items_updated DEFAULT (SYSUTCDATETIME())
  );

  CREATE INDEX IX_gallery_items_published_sort
    ON dbo.gallery_items (is_published, sort_order, created_at);
END
GO
