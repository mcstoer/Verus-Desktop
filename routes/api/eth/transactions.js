const standardizeEthTxObj = require('../utils/standardization/standardizeEthTxObj');

module.exports = (api) => {  
  api.setGet('/eth/get_transactions', async (req, res, next) => {
    try {
      res.send(JSON.stringify({
        msg: 'success',
        result: await api.eth.get_standardized_wallet_transactions(),
      }));  
    } catch(e) {
      res.send(JSON.stringify({
        msg: 'error',
        result: e.message,
      }));  
    }
  });
  
  api.eth.get_transactions = async (address) => {
    if (api.eth.interface != null) {
      let txs = await api.eth.interface.EtherscanProvider.getHistory(address)

      Object.values(api.eth.temp.pending_txs).forEach(pendingTx => {
        if (!(txs.some(tx => tx.hash === pendingTx.hash))) {
          txs.unshift(pendingTx)
        } else delete api.eth.temp.pending_txs[pendingTx.hash]
      })
      
      return txs
    } else {
      throw new Error("Cannot get transaction list for inactive coin ETH")
    }
  };

  api.eth.get_standardized_wallet_transactions = async () => {
    if (api.eth.wallet != null) {
      return standardizeEthTxObj(
        await api.eth.get_transactions(api.eth.wallet.address),
        api.eth.wallet.address
      );
    } else {
      throw new Error("No wallet authenticated, cannot get wallet transactions for ETH")
    }
  }

  api.eth.get_transaction = async (txid) => {
    if (api.eth.interface != null) {
      // let cachedReceipts = api.eth.cache.tx_cache;

      // if (cachedReceipts[txid] != null) {
      //   return cachedReceipts[txid]
      // } 

      const txReceipt = await api.eth.interface.DefaultProvider.getTransactionReceipt(txid)

      // if (txReceipt.confirmations >= 100) {
      //   api.eth.cache.tx_cache[txid] = txReceipt
      // }

      return txReceipt
    } else {
      throw new Error("Cannot get transaction for inactive coin ETH")
    }
  }

  return api;
};