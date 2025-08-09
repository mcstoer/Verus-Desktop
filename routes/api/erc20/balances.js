const ethers = require('ethers');

module.exports = (api) => {  
  api.setGet("/erc20/get_balances", async (req, res, next) => {
    try {
      res.send(
        JSON.stringify({
          msg: "success",
          result: {
            native: {
              public: {
                //TODO: Return string instead
                confirmed: Number(ethers.formatUnits(
                  await api.erc20.get_wallet_balance(req.query.chainTicker),
                  api.erc20.contracts[req.query.chainTicker].decimals
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

  api.erc20.get_address_balance = async (contractId, address) => {
    if (api.erc20.contracts[contractId] != null) {
      if (api.erc20.contracts[contractId].contract.balanceOf) {
        return await api.erc20.contracts[contractId].contract.balanceOf(address)
      } else {
        throw new Error(`ERC20 contract ${contractId} does not support the balanceOf function`)
      }
    } else {
      throw new Error(`Cannot get balance for inactive coin ${contractId}`)
    }
  }

  api.erc20.get_wallet_balance = async (contractId) => {
    if (api.erc20.wallet != null) {
      return await api.erc20.get_address_balance(
        contractId,
        api.erc20.wallet.address
      );
    } else {
      throw new Error(`No wallet authenticated, cannot get wallet balance for ${contractId}`)
    }
  }

  return api;
};