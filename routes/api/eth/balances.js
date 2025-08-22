const ethers = require('ethers');

module.exports = (api) => {  
  api.setGet("/eth/get_balances", async (req, res, next) => {
    try {
      res.send(
        JSON.stringify({
          msg: "success",
          result: {
            native: {
              public: {
                //TODO: Return string instead
                confirmed: Number(ethers.formatEther(
                  await api.eth.get_wallet_balance()
                )),
                unconfirmed: null,
                immature: null,
                interest: null,
              },
              private: {
                confirmed: null,
              },
            },
            reserve: {},
          },
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

  api.eth.get_address_balance = async (address) => {
    if (api.eth.interface != null) {
      return api.eth.interface.DefaultProvider.getBalance(address)
    } else {
      throw new Error("Cannot get balance for inactive coin ETH")
    }
  }

  api.eth.get_wallet_balance = async () => {
    if (api.eth.wallet != null) {
      return await api.eth.get_address_balance(api.eth.wallet.address)
    } else {
      throw new Error("No wallet authenticated, cannot get wallet balance for ETH")
    }
  }

  return api;
};