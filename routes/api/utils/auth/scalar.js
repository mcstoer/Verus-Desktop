const { secp256k1 } = require('@noble/curves/secp256k1');
const crypto = require('crypto');
const bigi = require('bigi');

// Derive 32-byte hash, optional clamp, and validate scalar range.
// - Throws on zero scalar
// - Warns but continues on scalar >= n (for legacy compatibility)
// Returns: { bytes: Buffer, dBigi: bigi.BigInteger }
function deriveScalarFromSeed(input, { iguana = false, logWarn } = {}) {
  const bytes = crypto.createHash('sha256').update(input).digest();
  if (bytes.length !== 32) {
    throw new Error('sha256 must return 32 bytes');
  }

  if (iguana) {           // kept for legacy compatibility
    bytes[0] &= 248;
    bytes[31] &= 127;
    bytes[31] |= 64;
  }

  const dBig = BigInt('0x' + bytes.toString('hex'));
  const n = secp256k1.CURVE.n;

  if (dBig === BigInt(0)) {
    throw new Error('derived private key scalar is out of range (zero)');
  }
  if (dBig >= n) {
    // compatibility: warn but do not alter bytes/scalar
    const warn = 'Warning: derived private key scalar is ≥ secp256k1 order; some wallets may behave inconsistently when importing it, and it is less secure. Consider generating a new seed.';
    if (typeof logWarn === 'function') {
      logWarn(warn);
    } else {
      console.warn(warn);
    }
  }

  return {
    bytes,
    dBigi: bigi.fromBuffer(bytes),
  };
}

module.exports = deriveScalarFromSeed