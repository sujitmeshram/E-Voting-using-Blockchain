// "artifacts" => this represents the contract abstraction that is specific
// to truffle and this will give us an election artifacts that represents our
// smart contracts and truffle works expose this so we can interact with it in any case if we want to

var Election = artifacts.require("./Election.sol");

module.exports = function (deployer) {
  deployer.deploy(Election);
};
