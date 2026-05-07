import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.SQL_SERVER_HOST || 'localhost',
  port: parseInt(process.env.SQL_SERVER_PORT) || 1433,
  database: process.env.SQL_SERVER_DATABASE || 'hakaru_rsa',
  user: process.env.SQL_SERVER_USER || 'sa',
  password: process.env.SQL_SERVER_PASSWORD || '',
  options: {
    encrypt: process.env.SQL_SERVER_ENCRYPT === 'true',
    trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT === 'true' || true,
  },
};

const createTableSql = `
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'donations')
BEGIN
    CREATE TABLE [dbo].[donations] (
        [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
        [amount] DECIMAL(10, 2) NOT NULL,
        [timing] NVARCHAR(20) NOT NULL,
        [interval] NVARCHAR(20) NULL,
        [donor_type] NVARCHAR(20) NOT NULL,
        [is_anonymous] BIT NOT NULL DEFAULT 0,
        [full_name] NVARCHAR(255) NULL,
        [organisation_name] NVARCHAR(255) NULL,
        [email] NVARCHAR(255) NOT NULL,
        [phone] NVARCHAR(50) NULL,
        [mailing_address] NVARCHAR(500) NULL,
        [mailing_town] NVARCHAR(100) NULL,
        [mailing_postcode] NVARCHAR(20) NULL,
        [stripe_payment_intent_id] NVARCHAR(255) NULL,
        [payment_status] NVARCHAR(50) NULL,
        [amount_paid] DECIMAL(10, 2) NULL,
        [paid_at] DATETIME2 NULL,
        [status] NVARCHAR(50) NOT NULL DEFAULT 'pending',
        [created_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [updated_at] DATETIME2 NULL,
        CONSTRAINT [PK_donations] PRIMARY KEY CLUSTERED ([id])
    );

    PRINT 'Donations table created successfully';
END
ELSE
BEGIN
    PRINT 'Donations table already exists';
END

-- Create index on email for lookup
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_donations_email')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_donations_email] ON [dbo].[donations] ([email]);
    PRINT 'Email index created';
END

-- Create index on payment status
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_donations_payment_status')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_donations_payment_status] ON [dbo].[donations] ([payment_status]);
    PRINT 'Payment status index created';
END
`;

async function run() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(config);
    console.log('Connected successfully');

    console.log('Creating donations table...');
    const result = await pool.request().query(createTableSql);

    if (result.output) {
      console.log(result.output);
    }

    console.log('Done');
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
