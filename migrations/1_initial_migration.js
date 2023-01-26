// migrations directory where all of
// our migrations live whenever we deployed dmart contracts to the blockchain

var Migrations = artifacts.require("./Migrations.sol");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
