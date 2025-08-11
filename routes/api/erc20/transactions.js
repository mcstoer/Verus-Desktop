const standardizeEthTxObj = require('../utils/standardization/standardizeEthTxObj');

module.exports = (api) => {  
  api.setGet('/erc20/get_transactions', async (req, res, next) => {
    try {
      res.send(
        JSON.stringify({
          msg: "success",
          result: await api.erc20.get_standardized_wallet_transactions(
            req.query.chainTicker
          ),
        })
      );  
    } catch(e) {
      res.send(JSON.stringify({
        msg: 'error',
        result: e.message,
      }));  
    }
  });
  
  api.erc20.get_transactions = async (contractId, address) => {
    if (api.erc20.contracts[contractId] != null) {
      let txs = await api.erc20.contracts[
        contractId
      ].interface.EtherscanProvider.getHistory(
        address,
        null,
        null,
        contractId
      );

      Object.values(api.erc20.contracts[contractId].temp.pending_txs).forEach(pendingTx => {
        if (!(txs.some(tx => tx.hash === pendingTx.hash))) {
          txs.unshift(pendingTx)
        } else delete api.erc20.contracts[contractId].temp.pending_txs[pendingTx.hash]
      })

      return txs
    } else {
      throw new Error(`Cannot get transaction list for inactive coin ${contractId}`)
    }
  };

  api.erc20.get_standardized_wallet_transactions = async (contractId) => {
    if (api.erc20.contracts[contractId] != null) {
      if (api.erc20.wallet != null) {
        return standardizeEthTxObj(
          await api.erc20.get_transactions(contractId, api.erc20.wallet.address),
          api.erc20.wallet.address,
          api.erc20.contracts[contractId].decimals
        );
      } else {
        throw new Error(
          `No wallet authenticated, cannot get wallet transactions for ${contractId}`
        );
      }
    } else {
      throw new Error(
        `Cannot get transaction list for inactive coin ${contractId}`
      );
    }
  };

  api.erc20.get_transaction = async (contractId, txid) => {
    if (api.erc20.contracts[contractId] != null) {
      const txReceipt = await api.erc20.contracts[
        contractId
      ].interface.DefaultProvider.getTransactionReceipt(txid);

      return txReceipt
    } else {
      throw new Error(`Cannot get transaction for inactive coin ${contractId}`)
    }
  }

  return api;
};