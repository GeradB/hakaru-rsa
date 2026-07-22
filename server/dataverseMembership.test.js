import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapMembershipToDataverse } from './dataverseMembership.js';

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
});
