-- Site content patches (merged with shared/siteContent.defaults.js in the API)
-- Run against your Hakaru RSA database after core tables exist.

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cms_content_patches')
BEGIN
  CREATE TABLE cms_content_patches (
    slug NVARCHAR(64) NOT NULL PRIMARY KEY,
    payload_json NVARCHAR(MAX) NOT NULL,
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO
