const { LoginConsentRequest } = require("verus-typescript-primitives")

module.exports = (api) => {
  /**
   * Verifies a login request
   * @param {LoginConsentRequest} Request
   */
  api.native.verusid.login.verify_request = async (request) => {
    const loginConsentRequest = new LoginConsentRequest(request);

    let chain_id

    switch (loginConsentRequest.system_id) {
      case "i5w5MuNik5NtLcYmNzcvaoixooEebB6MGV":
        chain_id = "VRSC";
        break;
      case "iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq":
        chain_id = "VRSCTEST";
        break;
      default:
        throw new Error("Unknown system id.")
    }

    const verified = await api.native.verify_hash(
      chain_id,
      loginConsentRequest.signing_id,
      loginConsentRequest.challenge.toSha256().toString('hex'),
      loginConsentRequest.signature.signature
    );

    return verified ? { verified } : { verified, message: "Failed to verify signature" };
  };

  api.setPost("/native/verusid/login/verify_request", async (req, res, next) => {
    const { request } = req.body;

    try {
      res.send(
        JSON.stringify({
          msg: "success",
          result: await api.native.verusid.login.verify_request(request),
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
