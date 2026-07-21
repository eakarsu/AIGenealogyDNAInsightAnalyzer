'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate } = require('../domain');

test('domain workflow accepts a reviewable, grounded case', () => {
  const evaluation = evaluate({
  consent: { id: 'consent-1', policyVersion: 'v3', grantedAt: '2026-01-01T00:00:00Z' },
  samples: [{ id: 'sample-1', providerRef: 'provider:opaque', sha256: 'c'.repeat(64),
    encryptionKeyRef: 'kms:key-alias', sourceRef: 'upload:1' }],
  matches: [{ id: 'match-1', sampleId: 'sample-1', matchSubjectRef: 'subject:opaque',
    sharedCm: 820, confidence: 0.91, medicalClaim: false }]
});
  assert.deepEqual(evaluation.errors, []);
  assert.equal(evaluation.result.decision, 'reviewable');
  assert.ok(Array.isArray(evaluation.assumptions));
  assert.equal(typeof evaluation.uncertainty, 'object');
});

test('domain workflow fails closed on unsafe or incomplete input', () => {
  const evaluation = evaluate({ consent: { id: 'revoked', policyVersion: 'v1', grantedAt: '2025-01-01', revokedAt: '2025-02-01' }, samples: [], matches: [] });
  assert.ok(evaluation.errors.length > 0);
  assert.notEqual(evaluation.result.decision, 'reviewable');
});
