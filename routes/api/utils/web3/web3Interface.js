const ethers = require('ethers');
const { HistorySupportingEtherscanProvider } = require('./etherscan');
const { DEFAULT_ERC20_ABI } = require('./abi');

class Web3Interface {
  constructor(network, apiKeys) {
    this.network = network;
    this.keys = apiKeys;

    this.DefaultProvider = new ethers.getDefaultProvider(
      this.network.key,
      {
        etherscan: apiKeys.etherscan,
        infura: apiKeys.infura,
        exclusive: [ "etherscan", "infura" ]
      }
    );

    this.EtherscanProvider = new HistorySupportingEtherscanProvider(
      this.network.key,
      apiKeys.etherscan
    );

    this.InfuraProvider = new ethers.InfuraProvider(
      this.network.key,
      apiKeys.infura
    );
  }

  static decodeWeb3Error(errorString) {
    try {
      let errorJsonString = "{";
      let index = errorString.indexOf("error={") + 7;
      let openers = 1;
      let closers = 0;

      while (openers != closers && index < errorString.length) {
        errorJsonString = errorJsonString + errorString[index];

        if (errorString[index] === "{") openers++;
        else if (errorString[index] === "}") closers++;

        index++;
      }

      const firstJson = JSON.parse(errorJsonString)
      const secondJson = JSON.parse(firstJson.body != null ? firstJson.body : firstJson.result)
      const errorMessage = secondJson.error != null ? secondJson.error.message : secondJson.result

      return {
        unparsed: errorString,
        message: errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1),
      };
    } catch (e) {
      return {
        unparsed: errorString,
        message: "Unknown error",
      };
    }
  }

  initContract = async (contractAddress) => {
    return [contractAddress, DEFAULT_ERC20_ABI];
  };

  getContract = (contractAddress, abi) => {
    return new ethers.Contract(contractAddress, abi, this.DefaultProvider);
  };

  getInfo = () => {
    return {
      network: this.network,
    };
  };
}

module.exports = Web3Interface