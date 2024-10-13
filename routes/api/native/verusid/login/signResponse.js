const {
  VerusIDSignature,
  LoginConsentResponse,
  LOGIN_CONSENT_RESPONSE_SIG_VDXF_KEY,
} = require("verus-typescript-primitives");

const {
  ECPair,
  networks,
  IdentitySignature
} = require("@bitgo/utxo-lib");

const ID_SIG_VERSION = 2
const ID_SIG_TYPE = 5

module.exports = (api) => {
  api.native.verusid.login.sign_response = async (response) => {
    const loginResponse = new LoginConsentResponse(response);

    const verificatonCheck = await api.native.verusid.login.verify_request(
      loginResponse.decision.request
    );

    if (!verificatonCheck.verified) {
      throw new Error(verificatonCheck.message);
    }

    // Sign the decision hash of the response not using the daemon since sign_hash is disabled.
    const info = await api.native.get_info(response.chain_id)

    const signingIdentity = await api.native.get_identity(response.chain_id, loginResponse.signing_id);

    const network = response.chain_id == "VRSC" ? networks.verus : networks.verustest;

    const wif = await api.native.get_privkey(response.chain_id, signingIdentity.identity.primaryaddresses[0])

    const keyPair = ECPair.fromWIF(wif, network);

    const sig = new IdentitySignature(
      network,
      ID_SIG_VERSION,
      ID_SIG_TYPE,
      info.longestchain,
      null,
      response.system_id,
      response.signing_id
    );

    sig.signHashOffline(loginResponse.getDecisionHash(info.longestchain), keyPair);

    const signedSig = sig.toBuffer().toString("base64");

    loginResponse.signature = new VerusIDSignature(
      { signature: signedSig },
      LOGIN_CONSENT_RESPONSE_SIG_VDXF_KEY
    );

    return { response: loginResponse};
  };

  api.setPost("/native/verusid/login/sign_response", async (req, res, next) => {
    const { response } = req.body;

    try {
      res.send(
        JSON.stringify({
          msg: "success",
          result: await api.native.verusid.login.sign_response(response),
        })
      );
    } catch (e) {
      res.send(
        JSON.stringify({
          msg: "error",
          result: e.message,
        })
      );
    }
  });

  return api;
};
