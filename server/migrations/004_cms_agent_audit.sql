-- Audit log for Teams / future content agents
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'cms_agent_audit')
BEGIN
  CREATE TABLE cms_agent_audit (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    channel NVARCHAR(32) NOT NULL,
    actor_aad_object_id NVARCHAR(64) NULL,
    actor_name NVARCHAR(256) NULL,
    action NVARCHAR(32) NOT NULL,
    section NVARCHAR(64) NULL,
    slug NVARCHAR(64) NULL,
    item_summary NVARCHAR(512) NULL,
    payload_json NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
  CREATE INDEX IX_cms_agent_audit_created ON cms_agent_audit (created_at DESC);
END
