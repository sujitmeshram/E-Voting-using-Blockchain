App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  hasVoted: false,

  //initialize the app with initWeb3 function
  init: function () {
    return App.initWeb3();
  },

  //initializing web3, basically connnects our client side app to the local blockchain
  //initialize the function and then initialize initContract() function
  //function that initializes our connection of our client side app to the local blockchain
  initWeb3: function () {
    // TODO: refactor conditional
    if (typeof web3 !== "undefined") {
      //instance of web3 attached to the window from metamask
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider; //setting metamask web3 provider to application web3 provider,
      // if it doesn't happen, then step on else condition
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "http://localhost:7545"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  //this function loads our contract into our frontend application, so that we can interact with contract
  initContract: function () {
    //first loading json file of our election artifact
    $.getJSON("Election.json", function (election) {
      // Instantiate a new truffle contract from the artifact, use that json to gerenrate truffle contract
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.Election.deployed().then(function (instance) {
      // Restart the chrome browser if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance
        .votedEvent(
          {},
          {
            fromBlock: 0,
            toBlock: "latest",
          }
        )
        .watch(function (error, event) {
          console.log("event triggered", event);
          // Reload when a new vote is recorded
          App.render();
        });
    });
  },

  //once initialize, we render out the content of our application
  render: function () {
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data, display the account that we are connected to the blockchain with
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.Election.deployed()
      .then(function (instance) {
        electionInstance = instance;
        return electionInstance.candidatesCount();
      })
      .then(function (candidatesCount) {
        var candidatesResults = $("#candidatesResults");
        candidatesResults.empty();

        var candidatesSelect = $("#candidatesSelect");
        candidatesSelect.empty();

        //loop to each candidate
        for (var i = 1; i <= candidatesCount; i++) {
          electionInstance.candidates(i).then(function (candidate) {
            var id = candidate[0];
            var name = candidate[1];
            var voteCount = candidate[2];

            // Render candidate Result
            var candidateTemplate =
              "<tr><th>" +
              id +
              "</th><td>" +
              name +
              "</td><td>" +
              voteCount +
              "</td></tr>";
            candidatesResults.append(candidateTemplate);

            // Render candidate ballot option
            var candidateOption =
              "<option value='" + id + "' >" + name + "</ option>";
            candidatesSelect.append(candidateOption);
          });
        }
        return electionInstance.voters(App.account);
      })
      .then(function (hasVoted) {
        // Do not allow a user to vote if they alreay voted
        if (hasVoted) {
          $("form").hide();
        }
        loader.hide();
        content.show();
      })
      .catch(function (error) {
        console.warn(error);
      });
  },

  castVote: function () {
    var candidateId = $("#candidatesSelect").val();
    App.contracts.Election.deployed()
      .then(function (instance) {
        return instance.vote(candidateId, { from: App.account });
      })
      .then(function (result) {
        // Wait for votes to update
        $("#content").hide(); //hide the laoder
        $("#loader").show(); // and show the count
      })
      .catch(function (err) {
        console.error(err);
      });
  },
};

// initialize the app when the windows loads
$(function () {
  $(window).load(function () {
    App.init();
  });
});
