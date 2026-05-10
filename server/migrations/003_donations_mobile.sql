-- Add mobile number column for donations (Home Phone remains in phone)
IF NOT EXISTS (
  SELECT 1 FROM sys.columns
  WHERE object_id = OBJECT_ID(N'dbo.donations') AND name = N'mobile'
)
BEGIN
  ALTER TABLE dbo.donations ADD mobile NVARCHAR(50) NULL;
END
GO
