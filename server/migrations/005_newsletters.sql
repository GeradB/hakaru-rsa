-- Newsletters: published PDF issues for the public newsletter page
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = N'newsletters' AND schema_id = SCHEMA_ID(N'dbo'))
BEGIN
  CREATE TABLE dbo.newsletters (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_newsletters PRIMARY KEY DEFAULT NEWSEQUENTIALID(),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(1000) NULL,
    blob_name NVARCHAR(500) NOT NULL,
    public_url NVARCHAR(2000) NOT NULL,
    published_at DATE NULL,
    is_published BIT NOT NULL CONSTRAINT DF_newsletters_is_published DEFAULT (1),
    created_at DATETIME2 NOT NULL CONSTRAINT DF_newsletters_created_at DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_newsletters_updated_at DEFAULT (SYSUTCDATETIME())
  );

  CREATE INDEX IX_newsletters_published
    ON dbo.newsletters (is_published, published_at DESC, created_at DESC);
END
GO
