/**
 * Email templates for Hakaru & Districts RSA
 * Generates formatted HTML emails for donations, membership applications, and renewals
 */

// Base email styles - inline for maximum email client compatibility
const baseStyles = {
  container: 'font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333;',
  header: 'background: linear-gradient(135deg, #1a365d 0%, #2d4a7c 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;',
  headerTitle: 'color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;',
  headerSubtitle: 'color: #fbbf24; font-size: 14px; margin-top: 8px; opacity: 0.9;',
  content: 'background: #ffffff; padding: 30px 20px;',
  section: 'margin-bottom: 25px;',
  sectionTitle: 'color: #1a365d; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 2px solid #fbbf24; padding-bottom: 8px;',
  row: 'display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb;',
  rowLabel: 'color: #6b7280; font-size: 14px;',
  rowValue: 'color: #1a365d; font-weight: 600; font-size: 14px;',
  highlightBox: 'background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;',
  warningBox: 'background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;',
  footer: 'background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; font-size: 12px; color: #6b7280;',
  button: 'display: inline-block; background: #fbbf24; color: #1a365d; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;',
};

/**
 * Generate donation confirmation email for donor
 */
export function createDonorDonationEmail(data) {
  const { fullName, email, amount, timing, interval, donorType, organisationName, isAnonymous, transactionRef, paidAt } = data;

  const displayAmount = typeof amount === 'number' ? amount.toFixed(2) : String(amount);
  const donorName = donorType === 'organisation' ? (organisationName || fullName) : (fullName || 'Valued Supporter');

  return {
    subject: `Thank You for Your Donation - Hakaru & Districts RSA`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Donation Confirmation</title>
      </head>
      <body style="margin: 0; padding: 20px; background: #f3f4f6;">
        <div style="${baseStyles.container}">
          <div style="${baseStyles.header}">
            <h1 style="${baseStyles.headerTitle}">Hakaru & Districts RSA</h1>
            <p style="${baseStyles.headerSubtitle}">Donation Confirmation</p>
          </div>

          <div style="${baseStyles.content}">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${donorName},</p>

            <p style="margin-bottom: 20px; line-height: 1.6;">
              Thank you for your generous donation to Hakaru & Districts RSA.
              Your support helps us continue our mission of serving our community and veterans.
            </p>

            ${isAnonymous ? `
              <div style="${baseStyles.warningBox}">
                <strong style="color: #92400e;">Anonymous Donation</strong><br>
                <span style="color: #6b7280; font-size: 13px;">You've chosen to make this donation anonymously. No receipt is required.</span>
              </div>
            ` : `
              <div style="${baseStyles.highlightBox}">
                <strong style="color: #166534;">Tax Receipt Information</strong><br>
                <span style="color: #6b7280; font-size: 13px;">A tax receipt will be sent to ${email} for tax purposes.</span>
              </div>
            `}

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Donation Details</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Donor</span>
                <span style="${baseStyles.rowValue}">${donorName}</span>
              </div>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Amount</span>
                <span style="${baseStyles.rowValue}; color: #16a34a; font-size: 16px;">$${displayAmount} NZD</span>
              </div>

              ${timing === 'recurring' ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Frequency</span>
                  <span style="${baseStyles.rowValue}">${interval || 'Monthly'}</span>
                </div>
              ` : `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Type</span>
                  <span style="${baseStyles.rowValue}">One-off Donation</span>
                </div>
              `}

              ${transactionRef ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Transaction Reference</span>
                  <span style="${baseStyles.rowValue}; font-family: monospace;">${transactionRef}</span>
                </div>
              ` : ''}

              ${paidAt ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Payment Date</span>
                  <span style="${baseStyles.rowValue}">${new Date(paidAt).toLocaleDateString('en-NZ')}</span>
                </div>
              ` : ''}
            </div>

            <p style="margin-top: 25px; line-height: 1.6;">
              Your contribution makes a real difference in our community. We are deeply grateful for your support.
            </p>

            <p style="margin-top: 20px; color: #1a365d; font-weight: 600;">
              Kind regards,<br>
              <span style="color: #fbbf24;">Hakaru & Districts RSA</span>
            </p>
          </div>

          <div style="${baseStyles.footer}">
            <p style="margin: 0;">Hakaru & Districts RSA Incorporated</p>
            <p style="margin: 5px 0;">Serving our community and veterans since 1946</p>
            <p style="margin: 10px 0 0;">
              <a href="mailto:admin@hakaru-rsa.org.nz" style="color: #6b7280; text-decoration: underline;">admin@hakaru-rsa.org.nz</a>
            </p>
            ${isAnonymous ? '' : `<p style="margin: 10px 0 0; font-size: 11px; color: #9ca3af;">This email serves as your donation receipt. Please keep it for your records.</p>`}
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

/**
 * Generate admin notification email for new donation
 */
export function createAdminDonationEmail(data) {
  const {
    fullName,
    email,
    amount,
    timing,
    interval,
    donorType,
    organisationName,
    homePhone,
    mobile,
    phone,
    mailingAddress,
    mailingTown,
    mailingPostCode,
    isAnonymous,
    transactionRef,
    paidAt,
  } = data;
  const homeTel = homePhone || phone;

  const displayAmount = typeof amount === 'number' ? amount.toFixed(2) : String(amount);
  const donorName = donorType === 'organisation' ? (organisationName || fullName) : (fullName || 'Unknown');

  return {
    subject: `New Donation: $${displayAmount} from ${donorName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Donation Notification</title>
      </head>
      <body style="margin: 0; padding: 20px; background: #f3f4f6;">
        <div style="${baseStyles.container}">
          <div style="${baseStyles.header}">
            <h1 style="${baseStyles.headerTitle}">New Donation Received</h1>
            <p style="${baseStyles.headerSubtitle}">Admin Notification</p>
          </div>

          <div style="${baseStyles.content}">
            <p style="font-size: 16px; margin-bottom: 20px;">A new donation has been received:</p>

            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #166534; font-size: 14px;">Total Amount</span>
                <span style="color: #16a34a; font-size: 24px; font-weight: bold;">$${displayAmount} NZD</span>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Donor Information</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Name</span>
                <span style="${baseStyles.rowValue}">${donorName}</span>
              </div>

              ${donorType === 'organisation' ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Type</span>
                  <span style="${baseStyles.rowValue}">Organisation</span>
                </div>
              ` : ''}

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Email</span>
                <span style="${baseStyles.rowValue}">${email || 'Not provided'}</span>
              </div>

              ${homeTel ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Home phone</span>
                  <span style="${baseStyles.rowValue}">${homeTel}</span>
                </div>
              ` : ''}

              ${mobile ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Mobile</span>
                  <span style="${baseStyles.rowValue}">${mobile}</span>
                </div>
              ` : ''}

              ${mailingAddress ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Address</span>
                  <span style="${baseStyles.rowValue}">${mailingAddress}${mailingTown ? ', ' + mailingTown : ''}${mailingPostCode ? ' ' + mailingPostCode : ''}</span>
                </div>
              ` : ''}

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Anonymous</span>
                <span style="${baseStyles.rowValue}">${isAnonymous ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Donation Details</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Type</span>
                <span style="${baseStyles.rowValue}">${timing === 'recurring' ? `Recurring (${interval || 'Monthly'})` : 'One-off'}</span>
              </div>

              ${transactionRef ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Transaction Reference</span>
                  <span style="${baseStyles.rowValue}; font-family: monospace;">${transactionRef}</span>
                </div>
              ` : ''}

              ${paidAt ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Paid At</span>
                  <span style="${baseStyles.rowValue}">${new Date(paidAt).toLocaleString('en-NZ')}</span>
                </div>
              ` : ''}
            </div>

            ${isAnonymous ? `
              <div style="${baseStyles.warningBox}">
                <strong style="color: #92400e;">Anonymous Donation</strong><br>
                <span style="color: #6b7280; font-size: 13px;">Do not send tax receipt. Donor has chosen to remain anonymous.</span>
              </div>
            ` : `
              <div style="${baseStyles.highlightBox}">
                <strong style="color: #166534;">Action Required</strong><br>
                <span style="color: #6b7280; font-size: 13px;">Send tax receipt to ${email} if not already automated.</span>
              </div>
            `}
          </div>

          <div style="${baseStyles.footer}">
            <p style="margin: 0;">This is an automated notification from Hakaru RSA</p>
            <p style="margin: 5px 0 0; font-size: 11px; color: #9ca3af;">Generated at ${new Date().toLocaleString('en-NZ')}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

/**
 * Generate membership application confirmation for applicant
 */
export function createMembershipConfirmationEmail(data) {
  const { fullName, fullName2, email, membershipType, fee, donation, total, transactionRef, mailingAddress, mailingTown, mailingPostCode } = data;

  const displayFee = typeof fee === 'number' ? fee.toFixed(2) : String(fee || 0);
  const displayDonation = typeof donation === 'number' ? donation.toFixed(2) : String(donation || 0);
  const displayTotal = typeof total === 'number' ? total.toFixed(2) : String(total || 0);
  const applicantName = fullName2 ? `${fullName} & ${fullName2}` : fullName;

  return {
    subject: `Membership Application Received - Hakaru & Districts RSA`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Membership Confirmation</title>
      </head>
      <body style="margin: 0; padding: 20px; background: #f3f4f6;">
        <div style="${baseStyles.container}">
          <div style="${baseStyles.header}">
            <h1 style="${baseStyles.headerTitle}">Hakaru & Districts RSA</h1>
            <p style="${baseStyles.headerSubtitle}">Membership Application Confirmation</p>
          </div>

          <div style="${baseStyles.content}">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${fullName},</p>

            <p style="margin-bottom: 20px; line-height: 1.6;">
              Thank you for your application for membership to Hakaru & Districts RSA.
              Your application has been received and will be processed at our next committee meeting.
            </p>

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <strong style="color: #1e40af;">Application Status: Pending Review</strong><br>
              <span style="color: #6b7280; font-size: 13px;">You will be notified once your application has been reviewed by our committee.</span>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Application Details</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Applicant(s)</span>
                <span style="${baseStyles.rowValue}">${applicantName}</span>
              </div>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Membership Type</span>
                <span style="${baseStyles.rowValue}">${membershipType || 'Not specified'}</span>
              </div>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Email</span>
                <span style="${baseStyles.rowValue}">${email}</span>
              </div>

              ${mailingAddress ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Address</span>
                  <span style="${baseStyles.rowValue}">${mailingAddress}${mailingTown ? ', ' + mailingTown : ''}${mailingPostCode ? ' ' + mailingPostCode : ''}</span>
                </div>
              ` : ''}

              ${transactionRef ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Reference</span>
                  <span style="${baseStyles.rowValue}; font-family: monospace;">${transactionRef}</span>
                </div>
              ` : ''}
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Payment Summary</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Membership Fee</span>
                <span style="${baseStyles.rowValue}">$${displayFee} NZD</span>
              </div>

              ${parseFloat(donation) > 0 ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Additional Donation</span>
                  <span style="${baseStyles.rowValue}; color: #16a34a;">$${displayDonation} NZD</span>
                </div>
              ` : ''}

              <div style="${baseStyles.row}; background: #fbbf24; margin: 10px -20px -20px; padding: 15px 20px; border-radius: 0 0 8px 8px;">
                <span style="color: #1a365d; font-weight: bold; font-size: 16px;">Total Paid</span>
                <span style="color: #1a365d; font-weight: bold; font-size: 18px;">$${displayTotal} NZD</span>
              </div>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <strong style="color: #92400e;">Next Steps</strong><br>
              <span style="color: #6b7280; font-size: 13px;">
                Your application requires nomination and seconding by current members.
                Once approved, you'll receive your membership card by post.
              </span>
            </div>

            <p style="margin-top: 25px; line-height: 1.6;">
              We look forward to welcoming you to our RSA community.
            </p>

            <p style="margin-top: 20px; color: #1a365d; font-weight: 600;">
              Kind regards,<br>
              <span style="color: #fbbf24;">Hakaru & Districts RSA</span>
            </p>
          </div>

          <div style="${baseStyles.footer}">
            <p style="margin: 0;">Hakaru & Districts RSA Incorporated</p>
            <p style="margin: 5px 0;">Serving our community and veterans since 1946</p>
            <p style="margin: 10px 0 0;">
              <a href="mailto:admin@hakaru-rsa.org.nz" style="color: #6b7280; text-decoration: underline;">admin@hakaru-rsa.org.nz</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

/**
 * Generate admin notification for new membership application
 */
export function createAdminMembershipEmail(data) {
  const {
    fullName, fullName2, email, mobile, homePhone,
    mailingAddress, mailingTown, mailingPostCode,
    physicalAddress, physicalTown, physicalPostCode,
    membershipType, transferFrom,
    consentEmail, consentAGM,
    skills, willingTasks, willingWorkingBee, willingDonate,
    serviceName, serviceDob, servicesBranch, serviceType, tradeCorp,
    serviceNumber, rank, confirmationMilitary, yearEnlisted, yearDischarged, wherServed,
    nominatedBy, secondedBy,
    fee, donation, total, transactionRef
  } = data;

  const displayFee = typeof fee === 'number' ? fee.toFixed(2) : String(fee || 0);
  const displayDonation = typeof donation === 'number' ? donation.toFixed(2) : String(donation || 0);
  const displayTotal = typeof total === 'number' ? total.toFixed(2) : String(total || 0);
  const applicantName = fullName2 ? `${fullName} & ${fullName2}` : fullName;

  return {
    subject: `New Membership Application: ${applicantName} (${membershipType})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Membership Application</title>
      </head>
      <body style="margin: 0; padding: 20px; background: #f3f4f6;">
        <div style="${baseStyles.container}">
          <div style="${baseStyles.header}">
            <h1 style="${baseStyles.headerTitle}">New Membership Application</h1>
            <p style="${baseStyles.headerSubtitle}">Admin Notification</p>
          </div>

          <div style="${baseStyles.content}">
            <p style="font-size: 16px; margin-bottom: 20px;">A new membership application has been received:</p>

            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #166534; font-size: 14px;">Total Payment Received</span>
                <span style="color: #16a34a; font-size: 24px; font-weight: bold;">$${displayTotal} NZD</span>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Applicant Information</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Applicant(s)</span>
                <span style="${baseStyles.rowValue}">${applicantName}</span>
              </div>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Membership Type</span>
                <span style="${baseStyles.rowValue}">${membershipType || 'Not specified'}</span>
              </div>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Email</span>
                <span style="${baseStyles.rowValue}">${email}</span>
              </div>

              ${mobile ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Mobile</span>
                  <span style="${baseStyles.rowValue}">${mobile}</span>
                </div>
              ` : ''}

              ${homePhone ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Home Phone</span>
                  <span style="${baseStyles.rowValue}">${homePhone}</span>
                </div>
              ` : ''}

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Mailing Address</span>
                <span style="${baseStyles.rowValue}">${mailingAddress}${mailingTown ? ', ' + mailingTown : ''}${mailingPostCode ? ' ' + mailingPostCode : ''}</span>
              </div>

              ${physicalAddress && physicalAddress !== mailingAddress ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Physical Address</span>
                  <span style="${baseStyles.rowValue}">${physicalAddress}${physicalTown ? ', ' + physicalTown : ''}${physicalPostCode ? ' ' + physicalPostCode : ''}</span>
                </div>
              ` : ''}

              ${transferFrom ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Transferring From</span>
                  <span style="${baseStyles.rowValue}">${transferFrom}</span>
                </div>
              ` : ''}
            </div>

            ${membershipType === 'Returned & Service' ? `
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #92400e; margin-top: 0; font-size: 16px;">Service Details</h3>

                ${serviceName ? `
                  <div style="${baseStyles.row}">
                    <span style="${baseStyles.rowLabel}">Service Name</span>
                    <span style="${baseStyles.rowValue}">${serviceName}</span>
                  </div>
                ` : ''}

                ${serviceDob ? `
                  <div style="${baseStyles.row}">
                    <span style="${baseStyles.rowLabel}">Date of Birth</span>
                    <span style="${baseStyles.rowValue}">${serviceDob}</span>
                  </div>
                ` : ''}

                ${servicesBranch && servicesBranch.length > 0 ? `
                  <div style="${baseStyles.row}">
                    <span style="${baseStyles.rowLabel}">Branch</span>
                    <span style="${baseStyles.rowValue}">${servicesBranch.join(', ')}</span>
                  </div>
                ` : ''}

                ${serviceType && serviceType.length > 0 ? `
                  <div style="${baseStyles.row}">
                    <span style="${baseStyles.rowLabel}">Service Type</span>
                    <span style="${baseStyles.rowValue}">${serviceType.join(', ')}</span>
                  </div>
                ` : ''}

                ${tradeCorp ? `
                  <div style="${baseStyles.row}">
                    <span style="${baseStyles.rowLabel}">Trade/Corp</span>
                    <span style="${baseStyles.rowValue}">${tradeCorp}</span>
                  </div>
                ` : ''}

                ${serviceNumber ? `
                  <div style="${baseStyles.row}">
                    <span style="${baseStyles.rowLabel}">Service Number</span>
                    <span style="${baseStyles.rowValue}">${serviceNumber}</span>
                  </div>
                ` : ''}

                ${rank ? `
                  <div style="${baseStyles.row}">
                    <span style="${baseStyles.rowLabel}">Rank</span>
                    <span style="${baseStyles.rowValue}">${rank}</span>
                  </div>
                ` : ''}

                ${yearEnlisted ? `
                  <div style="${baseStyles.row}">
                    <span style="${baseStyles.rowLabel}">Year Enlisted</span>
                    <span style="${baseStyles.rowValue}">${yearEnlisted}</span>
                  </div>
                ` : ''}

                ${yearDischarged ? `
                  <div style="${baseStyles.row}">
                    <span style="${baseStyles.rowLabel}">Year Discharged</span>
                    <span style="${baseStyles.rowValue}">${yearDischarged}</span>
                  </div>
                ` : ''}

                ${wherServed ? `
                  <div style="${baseStyles.row}">
                    <span style="${baseStyles.rowLabel}">Where Served</span>
                    <span style="${baseStyles.rowValue}">${wherServed}</span>
                  </div>
                ` : ''}
              </div>
            ` : ''}

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Consents & Skills</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Email Consent</span>
                <span style="${baseStyles.rowValue}">${consentEmail || 'No'}</span>
              </div>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">AGM/EGM Consent</span>
                <span style="${baseStyles.rowValue}">${consentAGM || 'No'}</span>
              </div>

              ${skills ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-size: 14px; display: block; margin-bottom: 5px;">Skills to Share:</span>
                  <span style="color: #1a365d;">${skills}</span>
                </div>
              ` : ''}

              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                <span style="color: #6b7280; font-size: 14px; display: block; margin-bottom: 5px;">Willing to Help:</span>
                <span style="color: #1a365d;">
                  ${[
                    willingTasks === 'Yes' ? 'Tasks' : null,
                    willingWorkingBee === 'Yes' ? 'Working Bees' : null,
                    willingDonate === 'Yes' ? 'Volunteer Time' : null
                  ].filter(Boolean).join(', ') || 'None specified'}
                </span>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Nomination</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Nominated By</span>
                <span style="${baseStyles.rowValue}">${nominatedBy || 'Not provided'}</span>
              </div>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Seconded By</span>
                <span style="${baseStyles.rowValue}">${secondedBy || 'Not provided'}</span>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Payment Summary</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Membership Fee</span>
                <span style="${baseStyles.rowValue}">$${displayFee} NZD</span>
              </div>

              ${parseFloat(donation) > 0 ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Donation</span>
                  <span style="${baseStyles.rowValue}; color: #16a34a;">$${displayDonation} NZD</span>
                </div>
              ` : ''}

              <div style="${baseStyles.row}; background: #fbbf24; margin: 10px -20px -20px; padding: 15px 20px; border-radius: 0 0 8px 8px;">
                <span style="color: #1a365d; font-weight: bold; font-size: 16px;">Total</span>
                <span style="color: #1a365d; font-weight: bold; font-size: 18px;">$${displayTotal} NZD</span>
              </div>
            </div>

            ${transactionRef ? `
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <span style="color: #6b7280; font-size: 13px;">Transaction Reference</span><br>
                <span style="color: #1a365d; font-family: monospace; font-size: 16px;">${transactionRef}</span>
              </div>
            ` : ''}

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <strong style="color: #1e40af;">Action Required</strong><br>
              <span style="color: #6b7280; font-size: 13px;">
                Review application at next committee meeting. Verify nominations and process membership card upon approval.
              </span>
            </div>
          </div>

          <div style="${baseStyles.footer}">
            <p style="margin: 0;">This is an automated notification from Hakaru RSA</p>
            <p style="margin: 5px 0 0; font-size: 11px; color: #9ca3af;">Generated at ${new Date().toLocaleString('en-NZ')}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

/**
 * Generate membership renewal confirmation for member
 */
export function createRenewalConfirmationEmail(data) {
  const { fullName, email, membershipType, fee, donation, total, transactionRef, mailingAddress, mailingTown, mailingPostCode } = data;

  const displayFee = typeof fee === 'number' ? fee.toFixed(2) : String(fee || 0);
  const displayDonation = typeof donation === 'number' ? donation.toFixed(2) : String(donation || 0);
  const displayTotal = typeof total === 'number' ? total.toFixed(2) : String(total || 0);

  return {
    subject: `Membership Renewal Confirmed - Hakaru & Districts RSA`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Renewal Confirmation</title>
      </head>
      <body style="margin: 0; padding: 20px; background: #f3f4f6;">
        <div style="${baseStyles.container}">
          <div style="${baseStyles.header}">
            <h1 style="${baseStyles.headerTitle}">Hakaru & Districts RSA</h1>
            <p style="${baseStyles.headerSubtitle}">Membership Renewal Confirmed</p>
          </div>

          <div style="${baseStyles.content}">
            <p style="font-size: 16px; margin-bottom: 20px;">Dear ${fullName},</p>

            <p style="margin-bottom: 20px; line-height: 1.6;">
              Thank you for renewing your membership with Hakaru & Districts RSA.
              Your renewal has been processed successfully.
            </p>

            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <strong style="color: #166534;">Renewal Status: Confirmed</strong><br>
              <span style="color: #6b7280; font-size: 13px;">Your membership is now active for the coming year.</span>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Renewal Details</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Member</span>
                <span style="${baseStyles.rowValue}">${fullName}</span>
              </div>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Membership Type</span>
                <span style="${baseStyles.rowValue}">${membershipType || 'Not specified'}</span>
              </div>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Email</span>
                <span style="${baseStyles.rowValue}">${email}</span>
              </div>

              ${mailingAddress ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Address</span>
                  <span style="${baseStyles.rowValue}">${mailingAddress}${mailingTown ? ', ' + mailingTown : ''}${mailingPostCode ? ' ' + mailingPostCode : ''}</span>
                </div>
              ` : ''}

              ${transactionRef ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Reference</span>
                  <span style="${baseStyles.rowValue}; font-family: monospace;">${transactionRef}</span>
                </div>
              ` : ''}
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Payment Summary</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Renewal Fee</span>
                <span style="${baseStyles.rowValue}">$${displayFee} NZD</span>
              </div>

              ${parseFloat(donation) > 0 ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Additional Donation</span>
                  <span style="${baseStyles.rowValue}; color: #16a34a;">$${displayDonation} NZD</span>
                </div>
              ` : ''}

              <div style="${baseStyles.row}; background: #fbbf24; margin: 10px -20px -20px; padding: 15px 20px; border-radius: 0 0 8px 8px;">
                <span style="color: #1a365d; font-weight: bold; font-size: 16px;">Total Paid</span>
                <span style="color: #1a365d; font-weight: bold; font-size: 18px;">$${displayTotal} NZD</span>
              </div>
            </div>

            <p style="margin-top: 25px; line-height: 1.6;">
              We appreciate your continued support and look forward to seeing you at our upcoming events.
            </p>

            <p style="margin-top: 20px; color: #1a365d; font-weight: 600;">
              Kind regards,<br>
              <span style="color: #fbbf24;">Hakaru & Districts RSA</span>
            </p>
          </div>

          <div style="${baseStyles.footer}">
            <p style="margin: 0;">Hakaru & Districts RSA Incorporated</p>
            <p style="margin: 5px 0;">Serving our community and veterans since 1946</p>
            <p style="margin: 10px 0 0;">
              <a href="mailto:admin@hakaru-rsa.org.nz" style="color: #6b7280; text-decoration: underline;">admin@hakaru-rsa.org.nz</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}

/**
 * Generate admin notification for membership renewal
 */
export function createAdminRenewalEmail(data) {
  const { fullName, email, mobile, homePhone, mailingAddress, mailingTown, mailingPostCode, membershipType, consentEmail, consentAGM, fee, donation, total, transactionRef } = data;

  const displayFee = typeof fee === 'number' ? fee.toFixed(2) : String(fee || 0);
  const displayDonation = typeof donation === 'number' ? donation.toFixed(2) : String(donation || 0);
  const displayTotal = typeof total === 'number' ? total.toFixed(2) : String(total || 0);

  return {
    subject: `Membership Renewal: ${fullName} (${membershipType})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Membership Renewal Notification</title>
      </head>
      <body style="margin: 0; padding: 20px; background: #f3f4f6;">
        <div style="${baseStyles.container}">
          <div style="${baseStyles.header}">
            <h1 style="${baseStyles.headerTitle}">Membership Renewal</h1>
            <p style="${baseStyles.headerSubtitle}">Admin Notification</p>
          </div>

          <div style="${baseStyles.content}">
            <p style="font-size: 16px; margin-bottom: 20px;">A member has renewed their membership:</p>

            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #166534; font-size: 14px;">Total Payment Received</span>
                <span style="color: #16a34a; font-size: 24px; font-weight: bold;">$${displayTotal} NZD</span>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Member Information</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Name</span>
                <span style="${baseStyles.rowValue}">${fullName}</span>
              </div>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Membership Type</span>
                <span style="${baseStyles.rowValue}">${membershipType || 'Not specified'}</span>
              </div>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Email</span>
                <span style="${baseStyles.rowValue}">${email}</span>
              </div>

              ${mobile ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Mobile</span>
                  <span style="${baseStyles.rowValue}">${mobile}</span>
                </div>
              ` : ''}

              ${homePhone ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Home Phone</span>
                  <span style="${baseStyles.rowValue}">${homePhone}</span>
                </div>
              ` : ''}

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Mailing Address</span>
                <span style="${baseStyles.rowValue}">${mailingAddress}${mailingTown ? ', ' + mailingTown : ''}${mailingPostCode ? ' ' + mailingPostCode : ''}</span>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Consents</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Email Consent</span>
                <span style="${baseStyles.rowValue}">${consentEmail || 'No'}</span>
              </div>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">AGM/EGM Consent</span>
                <span style="${baseStyles.rowValue}">${consentAGM || 'No'}</span>
              </div>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1a365d; margin-top: 0; font-size: 16px;">Payment Summary</h3>

              <div style="${baseStyles.row}">
                <span style="${baseStyles.rowLabel}">Renewal Fee</span>
                <span style="${baseStyles.rowValue}">$${displayFee} NZD</span>
              </div>

              ${parseFloat(donation) > 0 ? `
                <div style="${baseStyles.row}">
                  <span style="${baseStyles.rowLabel}">Donation</span>
                  <span style="${baseStyles.rowValue}; color: #16a34a;">$${displayDonation} NZD</span>
                </div>
              ` : ''}

              <div style="${baseStyles.row}; background: #fbbf24; margin: 10px -20px -20px; padding: 15px 20px; border-radius: 0 0 8px 8px;">
                <span style="color: #1a365d; font-weight: bold; font-size: 16px;">Total</span>
                <span style="color: #1a365d; font-weight: bold; font-size: 18px;">$${displayTotal} NZD</span>
              </div>
            </div>

            ${transactionRef ? `
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <span style="color: #6b7280; font-size: 13px;">Transaction Reference</span><br>
                <span style="color: #1a365d; font-family: monospace; font-size: 16px;">${transactionRef}</span>
              </div>
            ` : ''}

            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <strong style="color: #1e40af;">Action Required</strong><br>
              <span style="color: #6b7280; font-size: 13px;">
                Update membership records and issue new membership card if applicable.
              </span>
            </div>
          </div>

          <div style="${baseStyles.footer}">
            <p style="margin: 0;">This is an automated notification from Hakaru RSA</p>
            <p style="margin: 5px 0 0; font-size: 11px; color: #9ca3af;">Generated at ${new Date().toLocaleString('en-NZ')}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };
}
