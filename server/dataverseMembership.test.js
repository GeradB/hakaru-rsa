import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapMembershipToDataverse,
  computeRenewalExpiry,
  addOneYear,
} from './dataverseMembership.js';

describe('mapMembershipToDataverse', () => {
  it('maps to attributes that exist on the entity', () => {
    const attrs = new Map([
      ['cre8c_name', { LogicalName: 'cre8c_name', AttributeType: 'String' }],
      ['cre8c_email', { LogicalName: 'cre8c_email', AttributeType: 'String' }],
      ['cre8c_mobile', { LogicalName: 'cre8c_mobile', AttributeType: 'String' }],
      ['cre8c_websiteid', { LogicalName: 'cre8c_websiteid', AttributeType: 'String' }],
    ]);
    const payload = mapMembershipToDataverse(
      {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        mobile: '021000000',
      },
      'abc-123',
      { primaryNameAttribute: 'cre8c_name', attributes: attrs },
    );
    assert.equal(payload.cre8c_name, 'Jane Doe');
    assert.equal(payload.cre8c_email, 'jane@example.com');
    assert.equal(payload.cre8c_mobile, '021000000');
    assert.equal(payload.cre8c_websiteid, 'abc-123');
  });

  it('skips attributes that are not on the entity', () => {
    const attrs = new Map([
      ['cre8c_name', { LogicalName: 'cre8c_name', AttributeType: 'String' }],
    ]);
    const payload = mapMembershipToDataverse(
      { fullName: 'Jane', email: 'jane@example.com' },
      'id',
      { primaryNameAttribute: 'cre8c_name', attributes: attrs },
    );
    assert.equal(payload.cre8c_name, 'Jane');
    assert.equal(payload.cre8c_email, undefined);
  });

  it('does not write website id into cre8c_membershipnumber', () => {
    const attrs = new Map([
      ['cre8c_firstname', { LogicalName: 'cre8c_firstname', AttributeType: 'String' }],
      ['cre8c_membershipnumber', { LogicalName: 'cre8c_membershipnumber', AttributeType: 'String' }],
    ]);
    const payload = mapMembershipToDataverse(
      { fullName: 'Jane Doe' },
      'website-uuid',
      { primaryNameAttribute: 'cre8c_firstname', attributes: attrs },
    );
    assert.equal(payload.cre8c_membershipnumber, undefined);
    assert.equal(payload.cre8c_firstname, 'Jane');
  });

  it('splits name and maps website membership type to picklist int', () => {
    const attrs = new Map([
      ['cre8c_firstname', { LogicalName: 'cre8c_firstname', AttributeType: 'String' }],
      ['cre8c_lastname', { LogicalName: 'cre8c_lastname', AttributeType: 'String' }],
      [
        'cre8c_membershiptype',
        {
          LogicalName: 'cre8c_membershiptype',
          AttributeType: 'Picklist',
          options: new Map([
            ['member', 0],
            ['life member', 1],
            ['returned member', 3],
            ['youth member', 6],
          ]),
        },
      ],
      [
        'cre8c_membershipstatus',
        {
          LogicalName: 'cre8c_membershipstatus',
          AttributeType: 'Picklist',
          options: new Map([
            ['expired', 0],
            ['active', 1],
          ]),
        },
      ],
    ]);
    const payload = mapMembershipToDataverse(
      {
        fullName: 'Robert Noel McLachlan',
        membershipType: 'Associate (Non-Military)',
      },
      'mid',
      { primaryNameAttribute: 'cre8c_firstname', attributes: attrs },
    );
    assert.equal(payload.cre8c_firstname, 'Robert');
    assert.equal(payload.cre8c_lastname, 'Noel McLachlan');
    assert.equal(payload.cre8c_membershiptype, 0);
    assert.equal(payload.cre8c_membershipstatus, 1);
  });
});

describe('computeRenewalExpiry', () => {
  it('adds one year to the current expiry', () => {
    assert.equal(computeRenewalExpiry('2026-03-31T00:00:00.000Z'), '2027-03-31T00:00:00.000Z');
  });

  it('falls back to now + 1 year when expiry is missing', () => {
    const now = new Date('2026-07-22T12:00:00.000Z');
    assert.equal(computeRenewalExpiry(null, now), '2027-07-22T12:00:00.000Z');
  });

  it('addOneYear returns null for invalid dates', () => {
    assert.equal(addOneYear('not-a-date'), null);
  });
});
