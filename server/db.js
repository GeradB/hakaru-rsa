import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

let pool = null;

export const SITE_IMAGES_ALBUM_NAME = 'Site images';

export const getPool = async () => {
  if (pool) return pool;

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

  const newPool = new sql.ConnectionPool(config);
  await newPool.connect();
  pool = newPool;
  return pool;
};

export const createMembership = async (data) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('full_name', sql.NVarChar(255), data.fullName || null)
    .input('full_name2', sql.NVarChar(255), data.fullName2 || null)
    .input('dob', sql.Date, data.dob || null)
    .input('dob2', sql.Date, data.dob2 || null)
    .input('mailing_address', sql.NVarChar(500), data.mailingAddress || null)
    .input('mailing_town', sql.NVarChar(100), data.mailingTown || null)
    .input('mailing_postcode', sql.NVarChar(20), data.mailingPostCode || null)
    .input('physical_address', sql.NVarChar(500), data.physicalAddress || null)
    .input('physical_town', sql.NVarChar(100), data.physicalTown || null)
    .input('physical_postcode', sql.NVarChar(20), data.physicalPostCode || null)
    .input('home_phone', sql.NVarChar(50), data.homePhone || null)
    .input('mobile', sql.NVarChar(50), data.mobile || null)
    .input('email', sql.NVarChar(255), data.email || null)
    .input('membership_type', sql.NVarChar(100), data.membershipType || null)
    .input('transfer_from', sql.NVarChar(255), data.transferFrom || null)
    .input('consent_email', sql.NVarChar(10), data.consentEmail || null)
    .input('consent_agm', sql.NVarChar(10), data.consentAGM || null)
    .input('consent_womens', sql.NVarChar(10), data.consentWomens || null)
    .input('skills', sql.NVarChar, data.skills || null)
    .input('willing_tasks', sql.NVarChar(10), data.willingTasks || null)
    .input('willing_working_bee', sql.NVarChar(10), data.willingWorkingBee || null)
    .input('willing_donate', sql.NVarChar(10), data.willingDonate || null)
    .input('service_name', sql.NVarChar(255), data.serviceName || null)
    .input('service_dob', sql.Date, data.serviceDob || null)
    .input('services_branch', sql.NVarChar, data.servicesBranch ? JSON.stringify(data.servicesBranch) : null)
    .input('service_type', sql.NVarChar, data.serviceType ? JSON.stringify(data.serviceType) : null)
    .input('trade_corp', sql.NVarChar(255), data.tradeCorp || null)
    .input('service_number', sql.NVarChar(50), data.serviceNumber || null)
    .input('rank', sql.NVarChar(100), data.rank || null)
    .input('confirmation_military', sql.NVarChar(500), data.confirmationMilitary || null)
    .input('year_enlisted', sql.NVarChar(20), data.yearEnlisted || null)
    .input('year_discharged', sql.NVarChar(20), data.yearDischarged || null)
    .input('where_served', sql.NVarChar, data.wherServed || null)
    .input('nominated_by', sql.NVarChar(255), data.nominatedBy || null)
    .input('seconded_by', sql.NVarChar(255), data.secondedBy || null)
    .input('donation', sql.Decimal(10, 2), data.donation ? parseFloat(data.donation) : null)
    .query(`
      INSERT INTO memberships (
        full_name, full_name2, dob, dob2,
        mailing_address, mailing_town, mailing_postcode,
        physical_address, physical_town, physical_postcode,
        home_phone, mobile, email,
        membership_type, transfer_from,
        consent_email, consent_agm, consent_womens,
        skills, willing_tasks, willing_working_bee, willing_donate,
        service_name, service_dob, services_branch, service_type,
        trade_corp, service_number, rank, confirmation_military,
        year_enlisted, year_discharged, where_served,
        nominated_by, seconded_by, donation,
        status, created_at
      )
      OUTPUT INSERTED.id
      VALUES (
        @full_name, @full_name2, @dob, @dob2,
        @mailing_address, @mailing_town, @mailing_postcode,
        @physical_address, @physical_town, @physical_postcode,
        @home_phone, @mobile, @email,
        @membership_type, @transfer_from,
        @consent_email, @consent_agm, @consent_womens,
        @skills, @willing_tasks, @willing_working_bee, @willing_donate,
        @service_name, @service_dob, @services_branch, @service_type,
        @trade_corp, @service_number, @rank, @confirmation_military,
        @year_enlisted, @year_discharged, @where_served,
        @nominated_by, @seconded_by, @donation,
        'pending', GETDATE()
      )
    `);

  return result.recordset[0].id;
};

export const updateMembership = async (id, formData, paymentData) => {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .input('full_name', sql.NVarChar(255), formData.fullName || null)
    .input('full_name2', sql.NVarChar(255), formData.fullName2 || null)
    .input('dob', sql.Date, formData.dob || null)
    .input('dob2', sql.Date, formData.dob2 || null)
    .input('mailing_address', sql.NVarChar(500), formData.mailingAddress || null)
    .input('mailing_town', sql.NVarChar(100), formData.mailingTown || null)
    .input('mailing_postcode', sql.NVarChar(20), formData.mailingPostCode || null)
    .input('physical_address', sql.NVarChar(500), formData.physicalAddress || null)
    .input('physical_town', sql.NVarChar(100), formData.physicalTown || null)
    .input('physical_postcode', sql.NVarChar(20), formData.physicalPostCode || null)
    .input('home_phone', sql.NVarChar(50), formData.homePhone || null)
    .input('mobile', sql.NVarChar(50), formData.mobile || null)
    .input('email', sql.NVarChar(255), formData.email || null)
    .input('membership_type', sql.NVarChar(100), formData.membershipType || null)
    .input('transfer_from', sql.NVarChar(255), formData.transferFrom || null)
    .input('consent_email', sql.NVarChar(10), formData.consentEmail || null)
    .input('consent_agm', sql.NVarChar(10), formData.consentAGM || null)
    .input('consent_womens', sql.NVarChar(10), formData.consentWomens || null)
    .input('skills', sql.NVarChar, formData.skills || null)
    .input('willing_tasks', sql.NVarChar(10), formData.willingTasks || null)
    .input('willing_working_bee', sql.NVarChar(10), formData.willingWorkingBee || null)
    .input('willing_donate', sql.NVarChar(10), formData.willingDonate || null)
    .input('service_name', sql.NVarChar(255), formData.serviceName || null)
    .input('service_dob', sql.Date, formData.serviceDob || null)
    .input('services_branch', sql.NVarChar, formData.servicesBranch ? JSON.stringify(formData.servicesBranch) : null)
    .input('service_type', sql.NVarChar, formData.serviceType ? JSON.stringify(formData.serviceType) : null)
    .input('trade_corp', sql.NVarChar(255), formData.tradeCorp || null)
    .input('service_number', sql.NVarChar(50), formData.serviceNumber || null)
    .input('rank', sql.NVarChar(100), formData.rank || null)
    .input('confirmation_military', sql.NVarChar(500), formData.confirmationMilitary || null)
    .input('year_enlisted', sql.NVarChar(20), formData.yearEnlisted || null)
    .input('year_discharged', sql.NVarChar(20), formData.yearDischarged || null)
    .input('where_served', sql.NVarChar, formData.wherServed || null)
    .input('nominated_by', sql.NVarChar(255), formData.nominatedBy || null)
    .input('seconded_by', sql.NVarChar(255), formData.secondedBy || null)
    .input('donation', sql.Decimal(10, 2), formData.donation ? parseFloat(formData.donation) : null)
    .input('stripe_payment_intent_id', sql.NVarChar(255), paymentData.stripePaymentIntentId || null)
    .input('payment_status', sql.NVarChar(50), paymentData.paymentStatus || null)
    .input('amount_paid', sql.Decimal(10, 2), paymentData.amountPaid ? parseFloat(paymentData.amountPaid) : null)
    .input('paid_at', sql.DateTime2, paymentData.paidAt || null)
    .input('status', sql.NVarChar(50), paymentData.status || null)
    .query(`
      UPDATE memberships
      SET
        full_name = @full_name,
        full_name2 = @full_name2,
        dob = @dob,
        dob2 = @dob2,
        mailing_address = @mailing_address,
        mailing_town = @mailing_town,
        mailing_postcode = @mailing_postcode,
        physical_address = @physical_address,
        physical_town = @physical_town,
        physical_postcode = @physical_postcode,
        home_phone = @home_phone,
        mobile = @mobile,
        email = @email,
        membership_type = @membership_type,
        transfer_from = @transfer_from,
        consent_email = @consent_email,
        consent_agm = @consent_agm,
        consent_womens = @consent_womens,
        skills = @skills,
        willing_tasks = @willing_tasks,
        willing_working_bee = @willing_working_bee,
        willing_donate = @willing_donate,
        service_name = @service_name,
        service_dob = @service_dob,
        services_branch = @services_branch,
        service_type = @service_type,
        trade_corp = @trade_corp,
        service_number = @service_number,
        rank = @rank,
        confirmation_military = @confirmation_military,
        year_enlisted = @year_enlisted,
        year_discharged = @year_discharged,
        where_served = @where_served,
        nominated_by = @nominated_by,
        seconded_by = @seconded_by,
        donation = @donation,
        stripe_payment_intent_id = @stripe_payment_intent_id,
        payment_status = @payment_status,
        amount_paid = @amount_paid,
        paid_at = @paid_at,
        status = @status,
        updated_at = GETDATE()
      WHERE id = @id
    `);
};

export const getMembership = async (id) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .query('SELECT * FROM memberships WHERE id = @id');

  return result.recordset[0] || null;
};

export const listPublishedGalleryItems = async (albumId = null) => {
  const pool = await getPool();
  const query = `
    SELECT id, title, caption, blob_name, public_url, sort_order, is_published, created_at, updated_at, album_id
    FROM gallery_items
    WHERE is_published = 1
    ${
      albumId
        ? `AND album_id = @album_id
           AND EXISTS (
             SELECT 1
             FROM gallery_albums a
             WHERE a.id = @album_id
               AND a.is_published = 1
               AND a.name <> @site_images_album_name
           )`
        : ''
    }
    ORDER BY sort_order ASC, created_at ASC
  `;
  const request = pool.request();
  if (albumId) request.input('album_id', sql.UniqueIdentifier, albumId);
  if (albumId) request.input('site_images_album_name', sql.NVarChar(255), SITE_IMAGES_ALBUM_NAME);
  const result = await request.query(query);
  return result.recordset;
};

export const listAllGalleryItems = async (albumId = null) => {
  const pool = await getPool();
  const query = `
    SELECT id, title, caption, blob_name, public_url, sort_order, is_published, created_at, updated_at, album_id
    FROM gallery_items
    ${albumId ? 'WHERE album_id = @album_id' : ''}
    ORDER BY sort_order ASC, created_at ASC
  `;
  const request = pool.request();
  if (albumId) request.input('album_id', sql.UniqueIdentifier, albumId);
  const result = await request.query(query);
  return result.recordset;
};

// Album functions
export const listPublishedAlbums = async () => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('site_images_album_name', sql.NVarChar(255), SITE_IMAGES_ALBUM_NAME)
    .query(`
      SELECT id, name, description, sort_order, is_published, created_at, updated_at
      FROM gallery_albums
      WHERE is_published = 1
        AND name <> @site_images_album_name
      ORDER BY sort_order ASC, created_at ASC
    `);
  return result.recordset;
};

export const listAllAlbums = async () => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT id, name, description, sort_order, is_published, created_at, updated_at
    FROM gallery_albums
    ORDER BY sort_order ASC, created_at ASC
  `);
  return result.recordset;
};

export const findAlbumByName = async (name) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('name', sql.NVarChar(255), name)
    .query(`
      SELECT TOP 1 id, name, description, sort_order, is_published, created_at, updated_at
      FROM gallery_albums
      WHERE name = @name
    `);
  return result.recordset[0] || null;
};

export const getAlbumById = async (id) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('id', sql.UniqueIdentifier, id)
    .query(`
      SELECT id, name, description, sort_order, is_published, created_at, updated_at
      FROM gallery_albums
      WHERE id = @id
    `);
  return result.recordset[0] || null;
};

export const ensureSiteImagesAlbum = async () => {
  const existing = await findAlbumByName(SITE_IMAGES_ALBUM_NAME);
  if (existing) return existing;
  const id = await createAlbum({
    name: SITE_IMAGES_ALBUM_NAME,
    description: 'Internal images for site content (not shown on public gallery).',
    sortOrder: -100,
    isPublished: false,
  });
  return getAlbumById(id);
};

export const createAlbum = async (data) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('name', sql.NVarChar(255), data.name)
    .input('description', sql.NVarChar(1000), data.description ?? null)
    .input('sort_order', sql.Int, data.sortOrder ?? 0)
    .input('is_published', sql.Bit, data.isPublished ? 1 : 0)
    .query(`
      INSERT INTO gallery_albums (name, description, sort_order, is_published)
      OUTPUT INSERTED.id
      VALUES (@name, @description, @sort_order, @is_published)
    `);
  return result.recordset[0].id;
};

export const updateAlbum = async (id, data) => {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .input('name', sql.NVarChar(255), data.name ?? null)
    .input('description', sql.NVarChar(1000), data.description ?? null)
    .input('sort_order', sql.Int, data.sortOrder)
    .input('is_published', sql.Bit, data.isPublished ? 1 : 0)
    .query(`
      UPDATE gallery_albums
      SET
        name = @name,
        description = @description,
        sort_order = @sort_order,
        is_published = @is_published,
        updated_at = GETDATE()
      WHERE id = @id
    `);
};

export const deleteAlbum = async (id) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .query('DELETE FROM gallery_albums OUTPUT DELETED.id WHERE id = @id');
  return result.recordset[0]?.id ?? null;
};

export const getGalleryItemById = async (id) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .query(`
      SELECT id, title, caption, blob_name, public_url, sort_order, is_published, created_at, updated_at
      FROM gallery_items
      WHERE id = @id
    `);
  return result.recordset[0] || null;
};

export const createGalleryItem = async (data) => {
  const pool = await getPool();
  const request = pool.request()
    .input('title', sql.NVarChar(255), data.title ?? null)
    .input('caption', sql.NVarChar(1000), data.caption ?? null)
    .input('blob_name', sql.NVarChar(500), data.blobName)
    .input('public_url', sql.NVarChar(2000), data.publicUrl)
    .input('sort_order', sql.Int, data.sortOrder === undefined || data.sortOrder === null ? null : data.sortOrder)
    .input('is_published', sql.Bit, data.isPublished ? 1 : 0);

  if (data.albumId) {
    request.input('album_id', sql.UniqueIdentifier, data.albumId);
  }

  const result = await request.query(`
    DECLARE @next INT = (SELECT ISNULL(MAX(sort_order), 0) + 1 FROM gallery_items);
    INSERT INTO gallery_items (title, caption, blob_name, public_url, sort_order, is_published${data.albumId ? ', album_id' : ''})
    OUTPUT INSERTED.id AS id
    VALUES (
      @title,
      @caption,
      @blob_name,
      @public_url,
      CASE WHEN @sort_order IS NULL THEN @next ELSE @sort_order END,
      @is_published
      ${data.albumId ? ', @album_id' : ''}
    )
  `);
  return result.recordset[0]?.id;
};

export const updateGalleryItem = async (id, data) => {
  const pool = await getPool();
  const request = pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .input('title', sql.NVarChar(255), data.title ?? null)
    .input('caption', sql.NVarChar(1000), data.caption ?? null)
    .input('sort_order', sql.Int, data.sortOrder)
    .input('is_published', sql.Bit, data.isPublished ? 1 : 0);

  const setClause = [
    'title = @title',
    'caption = @caption',
    'sort_order = @sort_order',
    'is_published = @is_published',
    'updated_at = SYSUTCDATETIME()',
  ];

  if (data.albumId !== undefined) {
    request.input('album_id', sql.UniqueIdentifier, data.albumId);
    setClause.push('album_id = @album_id');
  }

  await request.query(`
    UPDATE gallery_items
    SET ${setClause.join(',\n')}
    WHERE id = @id
  `);
};

/** @returns {Promise<string|null>} blob_name if a row was deleted */
export const deleteGalleryItem = async (id) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .query(`
      DELETE FROM gallery_items
      OUTPUT DELETED.blob_name AS blob_name
      WHERE id = @id
    `);
  return result.recordset[0]?.blob_name ?? null;
};

// Renewal functions
export const createRenewal = async (data) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('full_name', sql.NVarChar(255), data.fullName || null)
    .input('membership_number', sql.NVarChar(100), data.membershipNumber || null)
    .input('dob', sql.Date, data.dob || null)
    .input('email', sql.NVarChar(255), data.email || null)
    .input('home_phone', sql.NVarChar(50), data.homePhone || null)
    .input('mobile', sql.NVarChar(50), data.mobile || null)
    .input('mailing_address', sql.NVarChar(500), data.mailingAddress || null)
    .input('mailing_town', sql.NVarChar(100), data.mailingTown || null)
    .input('mailing_postcode', sql.NVarChar(20), data.mailingPostCode || null)
    .input('physical_address', sql.NVarChar(500), data.physicalAddress || null)
    .input('physical_town', sql.NVarChar(100), data.physicalTown || null)
    .input('physical_postcode', sql.NVarChar(20), data.physicalPostCode || null)
    .input('consent_email', sql.NVarChar(10), data.consentEmail || null)
    .input('consent_agm', sql.NVarChar(10), data.consentAGM || null)
    .input('consent_womens', sql.NVarChar(10), data.consentWomens || null)
    .input('membership_type', sql.NVarChar(100), data.membershipType || null)
    .input('donation', sql.Decimal(10, 2), data.donation ? parseFloat(data.donation) : null)
    .input('fee_amount', sql.Decimal(10, 2), data.fee || null)
    .input('total_amount', sql.Decimal(10, 2), data.total || null)
    .input('status', sql.NVarChar(50), 'pending')
    .query(`
      INSERT INTO membership_renewals (
        full_name, membership_number, dob, email, home_phone, mobile,
        mailing_address, mailing_town, mailing_postcode,
        physical_address, physical_town, physical_postcode,
        consent_email, consent_agm, consent_womens,
        membership_type, donation, fee_amount, total_amount,
        status, created_at
      )
      OUTPUT INSERTED.id
      VALUES (
        @full_name, @membership_number, @dob, @email, @home_phone, @mobile,
        @mailing_address, @mailing_town, @mailing_postcode,
        @physical_address, @physical_town, @physical_postcode,
        @consent_email, @consent_agm, @consent_womens,
        @membership_type, @donation, @fee_amount, @total_amount,
        @status, GETDATE()
      )
    `);

  return result.recordset[0].id;
};

export const updateRenewal = async (id, formData, paymentData) => {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .input('full_name', sql.NVarChar(255), formData.fullName || null)
    .input('membership_number', sql.NVarChar(100), formData.membershipNumber || null)
    .input('dob', sql.Date, formData.dob || null)
    .input('email', sql.NVarChar(255), formData.email || null)
    .input('home_phone', sql.NVarChar(50), formData.homePhone || null)
    .input('mobile', sql.NVarChar(50), formData.mobile || null)
    .input('mailing_address', sql.NVarChar(500), formData.mailingAddress || null)
    .input('mailing_town', sql.NVarChar(100), formData.mailingTown || null)
    .input('mailing_postcode', sql.NVarChar(20), formData.mailingPostCode || null)
    .input('physical_address', sql.NVarChar(500), formData.physicalAddress || null)
    .input('physical_town', sql.NVarChar(100), formData.physicalTown || null)
    .input('physical_postcode', sql.NVarChar(20), formData.physicalPostCode || null)
    .input('consent_email', sql.NVarChar(10), formData.consentEmail || null)
    .input('consent_agm', sql.NVarChar(10), formData.consentAGM || null)
    .input('consent_womens', sql.NVarChar(10), formData.consentWomens || null)
    .input('membership_type', sql.NVarChar(100), formData.membershipType || null)
    .input('donation', sql.Decimal(10, 2), formData.donation ? parseFloat(formData.donation) : null)
    .input('fee_amount', sql.Decimal(10, 2), paymentData.fee || null)
    .input('total_amount', sql.Decimal(10, 2), paymentData.total || null)
    .input('stripe_payment_intent_id', sql.NVarChar(255), paymentData.stripePaymentIntentId || null)
    .input('payment_status', sql.NVarChar(50), paymentData.paymentStatus || null)
    .input('amount_paid', sql.Decimal(10, 2), paymentData.amountPaid ? parseFloat(paymentData.amountPaid) : null)
    .input('paid_at', sql.DateTime2, paymentData.paidAt || null)
    .input('status', sql.NVarChar(50), paymentData.status || null)
    .query(`
      UPDATE membership_renewals
      SET
        full_name = @full_name,
        membership_number = @membership_number,
        dob = @dob,
        email = @email,
        home_phone = @home_phone,
        mobile = @mobile,
        mailing_address = @mailing_address,
        mailing_town = @mailing_town,
        mailing_postcode = @mailing_postcode,
        physical_address = @physical_address,
        physical_town = @physical_town,
        physical_postcode = @physical_postcode,
        consent_email = @consent_email,
        consent_agm = @consent_agm,
        consent_womens = @consent_womens,
        membership_type = @membership_type,
        donation = @donation,
        fee_amount = @fee_amount,
        total_amount = @total_amount,
        stripe_payment_intent_id = @stripe_payment_intent_id,
        payment_status = @payment_status,
        amount_paid = @amount_paid,
        paid_at = @paid_at,
        status = @status,
        updated_at = GETDATE()
      WHERE id = @id
    `);
};

// Donation functions
export const createDonation = async (data) => {
  const pool = await getPool();
  const result = await pool.request()
    .input('amount', sql.Decimal(10, 2), data.amount || null)
    .input('timing', sql.NVarChar(20), data.timing || null)
    .input('interval', sql.NVarChar(20), data.interval || null)
    .input('donor_type', sql.NVarChar(20), data.donorType || null)
    .input('is_anonymous', sql.Bit, data.isAnonymous ? 1 : 0)
    .input('full_name', sql.NVarChar(255), data.fullName || null)
    .input('organisation_name', sql.NVarChar(255), data.organisationName || null)
    .input('email', sql.NVarChar(255), data.email || null)
    .input('phone', sql.NVarChar(50), data.phone || null)
    .input('mailing_address', sql.NVarChar(500), data.mailingAddress || null)
    .input('mailing_town', sql.NVarChar(100), data.mailingTown || null)
    .input('mailing_postcode', sql.NVarChar(20), data.mailingPostCode || null)
    .query(`
      INSERT INTO donations (
        amount, timing, interval, donor_type, is_anonymous,
        full_name, organisation_name, email, phone,
        mailing_address, mailing_town, mailing_postcode,
        status, created_at
      )
      OUTPUT INSERTED.id
      VALUES (
        @amount, @timing, @interval, @donor_type, @is_anonymous,
        @full_name, @organisation_name, @email, @phone,
        @mailing_address, @mailing_town, @mailing_postcode,
        'pending', GETDATE()
      )
    `);

  return result.recordset[0].id;
};

export const updateDonation = async (id, formData, paymentData) => {
  const pool = await getPool();
  await pool.request()
    .input('id', sql.UniqueIdentifier, id)
    .input('amount', sql.Decimal(10, 2), formData.amount || null)
    .input('timing', sql.NVarChar(20), formData.timing || null)
    .input('interval', sql.NVarChar(20), formData.interval || null)
    .input('donor_type', sql.NVarChar(20), formData.donorType || null)
    .input('is_anonymous', sql.Bit, formData.isAnonymous ? 1 : 0)
    .input('full_name', sql.NVarChar(255), formData.fullName || null)
    .input('organisation_name', sql.NVarChar(255), formData.organisationName || null)
    .input('email', sql.NVarChar(255), formData.email || null)
    .input('phone', sql.NVarChar(50), formData.phone || null)
    .input('mailing_address', sql.NVarChar(500), formData.mailingAddress || null)
    .input('mailing_town', sql.NVarChar(100), formData.mailingTown || null)
    .input('mailing_postcode', sql.NVarChar(20), formData.mailingPostCode || null)
    .input('stripe_payment_intent_id', sql.NVarChar(255), paymentData.stripePaymentIntentId || null)
    .input('payment_status', sql.NVarChar(50), paymentData.paymentStatus || null)
    .input('amount_paid', sql.Decimal(10, 2), paymentData.amountPaid ? parseFloat(paymentData.amountPaid) : null)
    .input('paid_at', sql.DateTime2, paymentData.paidAt || null)
    .input('status', sql.NVarChar(50), paymentData.status || null)
    .query(`
      UPDATE donations
      SET
        amount = @amount,
        timing = @timing,
        interval = @interval,
        donor_type = @donor_type,
        is_anonymous = @is_anonymous,
        full_name = @full_name,
        organisation_name = @organisation_name,
        email = @email,
        phone = @phone,
        mailing_address = @mailing_address,
        mailing_town = @mailing_town,
        mailing_postcode = @mailing_postcode,
        stripe_payment_intent_id = @stripe_payment_intent_id,
        payment_status = @payment_status,
        amount_paid = @amount_paid,
        paid_at = @paid_at,
        status = @status,
        updated_at = GETDATE()
      WHERE id = @id
    `);
};

// --- CMS site content patches ---
export const listCmsPatches = async () => {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT slug, payload_json, updated_at
    FROM cms_content_patches
    ORDER BY slug
  `);
  return result.recordset.map((row) => ({
    slug: row.slug,
    payload: JSON.parse(row.payload_json || '{}'),
    updatedAt: row.updated_at,
  }));
};

export const upsertCmsPatch = async (slug, payloadObj) => {
  const pool = await getPool();
  const json = JSON.stringify(payloadObj);
  const exists = await pool
    .request()
    .input('slug', sql.NVarChar(64), slug)
    .query('SELECT 1 AS ok FROM cms_content_patches WHERE slug = @slug');

  if (exists.recordset.length > 0) {
    await pool
      .request()
      .input('slug', sql.NVarChar(64), slug)
      .input('payload', sql.NVarChar(sql.MAX), json)
      .query(`
        UPDATE cms_content_patches
        SET payload_json = @payload, updated_at = SYSUTCDATETIME()
        WHERE slug = @slug
      `);
  } else {
    await pool
      .request()
      .input('slug', sql.NVarChar(64), slug)
      .input('payload', sql.NVarChar(sql.MAX), json)
      .query(`
        INSERT INTO cms_content_patches (slug, payload_json, updated_at)
        VALUES (@slug, @payload, SYSUTCDATETIME())
      `);
  }
};
