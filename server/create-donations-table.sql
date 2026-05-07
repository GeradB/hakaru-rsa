-- Create donations table for Hakaru RSA donation page
USE [HakaruMainWebTrafiic];
GO

CREATE TABLE [dbo].[donations] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [amount] DECIMAL(10, 2) NOT NULL,
    [timing] NVARCHAR(20) NOT NULL, -- 'one-off' or 'recurring'
    [interval] NVARCHAR(20) NULL, -- 'weekly', 'monthly', '3-monthly', '6-monthly', 'annually'
    [donor_type] NVARCHAR(20) NOT NULL, -- 'me' or 'organisation'
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
GO

-- Create index on email for lookup
CREATE NONCLUSTERED INDEX [IX_donations_email] ON [dbo].[donations] ([email]);
GO

-- Create index on payment status
CREATE NONCLUSTERED INDEX [IX_donations_payment_status] ON [dbo].[donations] ([payment_status]);
GO

PRINT 'Donations table created successfully';
GO
