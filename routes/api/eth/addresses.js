const { ethers } = require("ethers");

module.exports = (api) => { 
  api.eth.get_address = () => {
    if (api.eth.wallet != null) {
      return api.eth.wallet.address
    } else {
      throw new Error("No wallet authenticated, cannot get wallet address for ETH")
    }
  };

  api.eth.get_addresses = async () => {
    return {
      public: [{
        address: api.eth.get_address(),
        tag: "eth",
        balances: {
          native: ethers.formatEther(await api.eth.get_wallet_balance()),
          reserve: {}
        }
      }],
      private: []
    }
  };

  api.setGet('/eth/get_addresses', (req, res, next) => {    
    api.eth.get_addresses()
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

  api.setPost('/eth/get_privkey', (req, res, next) => {
    if (api.eth.wallet != null) {
      res.send(JSON.stringify({
        msg: 'success',
        result: api.eth.wallet.signer.signingKey.privateKey,
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