const ethers = require("ethers")
const { formatUnits, formatEther } = ethers;

const standardizeEthTxObj = (transactions, address, decimals = 18, tokenTxs) => {
  let _txs = [];

  if (transactions.length) {
    for (let i = 0; i < transactions.length; i++) {
      let type;

      const amount = transactions[i].value != null && typeof transactions[i].value === 'string'
        ? formatUnits(BigInt(transactions[i].value), decimals)
        : null

      if (tokenTxs && (amount == null || amount == "0")) {
        type = 'unknown';
      } else if (transactions[i].from === transactions[i].to) {
        type = 'self';
      } else if (transactions[i].from && transactions[i].from.toLowerCase() === address.toLowerCase()) {
        type = 'sent';                    
      } else if (transactions[i].to && transactions[i].to.toLowerCase() === address.toLowerCase()) {
        type = 'received';                    
      }

      let _txObj = {
        type,
        height: Number(transactions[i].blockNumber),
        timestamp: Number(transactions[i].timeStamp),
        txid: transactions[i].hash,
        nonce: transactions[i].nonce,
        blockhash: transactions[i].blockHash,
        txindex: transactions[i].transactionIndex,
        src: transactions[i].from,
        address: transactions[i].to,
        amount,
        gas:
          transactions[i].gas != null && typeof transactions[i].gas === 'string'
            ? formatEther(BigInt(transactions[i].gas))
            : null,
        gasPrice:
          transactions[i].gasPrice != null && typeof transactions[i].gasPrice === 'string'
            ? formatEther(BigInt(transactions[i].gasPrice))
            : null,
        cumulativeGasUsed:
          transactions[i].cumulativeGasUsed != null && typeof transactions[i].cumulativeGasUsed === 'string'
            ? formatEther(BigInt(transactions[i].cumulativeGasUsed))
            : null,
        gasUsed:
          transactions[i].gasUsed != null && typeof transactions[i].gasUsed === 'string'
            ? formatEther(BigInt(transactions[i].gasUsed))
            : null,
        fee:
          transactions[i].gasPrice != null && typeof transactions[i].gasPrice === 'string' &&
          transactions[i].gasUsed != null && typeof transactions[i].gasUsed === 'string'
            ? formatEther(
                BigInt(transactions[i].gasPrice) * BigInt(transactions[i].gasUsed)
              )
            : null,
        input: transactions[i].input,
        contractAddress: transactions[i].contractAddress,
        confirmations: transactions[i].confirmations
      };
      
      _txs.push(_txObj);
    }
  }

  let _uniqueTxs = new Array();
  _uniqueTxs = Array.from(new Set(_txs.map(JSON.stringify))).map(JSON.parse);

  return _uniqueTxs;
};

module.exports = standardizeEthTxObj