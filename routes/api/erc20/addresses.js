const { ethers } = require("ethers");

module.exports = (api) => { 
  api.erc20.get_address = () => {
    if (api.erc20.wallet != null) {
      return api.erc20.wallet.address
    } else {
      throw new Error("No wallet authenticated, cannot get wallet address for ERC20")
    }
  };

  api.erc20.get_addresses = async (contractId) => {
    return {
      public: [
        {
          address: api.erc20.get_address(),
          tag: "eth",
          balances: {
            native: ethers.formatUnits(
              await api.erc20.get_wallet_balance(contractId),
              api.erc20.contracts[contractId].decimals
            ),
            reserve: {},
          },
        },
      ],
      private: [],
    };
  };

  api.setGet('/erc20/get_addresses', (req, res, next) => {    
    api.erc20.get_addresses(req.query.chainTicker)
    .then((addresses) => {
      const retObj = {
        msg: 'success',
        result: addresses,
      };
  
      res.send(JSON.stringify(retObj));  
    })
    .catch(error => {
      const retObj = {
        msg: 'error',
        result: error.message,
      };
  
      res.send(JSON.stringify(retObj));  
    })
  });

  api.setPost('/erc20/get_privkey', (req, res, next) => {
    if (api.erc20.wallet != null) {
      res.send(JSON.stringify({
        msg: 'success',
        result: api.erc20.wallet.signer.signingKey.privateKey,
      }));  
    } else {
      res.send(JSON.stringify({
        msg: 'error',
        result: `No ETH privkey found`
      }));  
    }
  }, true);

  return api;
};