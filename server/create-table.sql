-- SQL Server table creation script for Hakaru RSA memberships
-- Run this in SQL Server Management Studio or Azure Data Studio

USE hakaru_rsa;
GO

CREATE TABLE memberships (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2,
  status NVARCHAR(50) DEFAULT 'pending',

  -- Personal Details
  full_name NVARCHAR(255),
  full_name2 NVARCHAR(255),
  dob DATE,
  dob2 DATE,
  mailing_address NVARCHAR(500),
  mailing_town NVARCHAR(100),
  mailing_postcode NVARCHAR(20),
  physical_address NVARCHAR(500),
  physical_town NVARCHAR(100),
  physical_postcode NVARCHAR(20),
  home_phone NVARCHAR(50),
  mobile NVARCHAR(50),
  email NVARCHAR(255),

  -- Membership
  membership_type NVARCHAR(100),
  transfer_from NVARCHAR(255),

  -- Consents & Skills
  consent_email NVARCHAR(10),
  consent_agm NVARCHAR(10),
  consent_womens NVARCHAR(10),
  skills NVARCHAR(MAX),
  willing_tasks NVARCHAR(10),
  willing_working_bee NVARCHAR(10),
  willing_donate NVARCHAR(10),

  -- Service Details
  service_name NVARCHAR(255),
  service_dob DATE,
  services_branch NVARCHAR(MAX),
  service_type NVARCHAR(MAX),
  trade_corp NVARCHAR(255),
  service_number NVARCHAR(50),
  rank NVARCHAR(100),
  confirmation_military NVARCHAR(500),
  year_enlisted NVARCHAR(20),
  year_discharged NVARCHAR(20),
  where_served NVARCHAR(MAX),

  -- Nomination & Payment
  nominated_by NVARCHAR(255),
  seconded_by NVARCHAR(255),
  donation DECIMAL(10,2),

  -- Stripe Payment
  stripe_payment_intent_id NVARCHAR(255),
  payment_status NVARCHAR(50),
  amount_paid DECIMAL(10,2),
  paid_at DATETIME2
);
GO

-- Create index on email for lookups
CREATE INDEX IX_memberships_email ON memberships(email);
GO

-- Create index on status for filtering
CREATE INDEX IX_memberships_status ON memberships(status);
GO
