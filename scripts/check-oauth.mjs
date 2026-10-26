import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createPkce,base64url,validVerifier} from '../lib/oauth.ts';
assert.equal(base64url(new Uint8Array([255,254,253])),'__79');
const a=await createPkce(),b=await createPkce();
assert.ok(validVerifier(a.verifier));assert.equal(a.verifier.length,43);assert.notEqual(a.verifier,b.verifier);
assert.equal(a.challenge,createHash('sha256').update(a.verifier).digest('base64url'));
assert.equal(validVerifier(undefined),false);assert.equal(validVerifier('short'),false);assert.equal(validVerifier('!'.repeat(43)),false);
console.log('PASS: PKCE randomness, SHA-256 challenge, URL-safe encoding, and verifier validation.');
