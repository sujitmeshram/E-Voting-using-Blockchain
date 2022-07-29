pragma solidity 0.4.25;             //declaring the solidity version


//declaring the contract
contract Election {


    // Model a Candidate in the struct
    struct Candidate {
        uint id;                            //candidate ID
        string name;                        //candiadte name
        uint voteCount;                     //candiadte Vote Count
    }




    // Store accounts that have voted, created new mapping, key=address, value=bool pair
    mapping(address => bool) public voters;


    // For Storing and fetching Candidates  
    mapping(uint => Candidate) public candidates;           //key =unit ,   value=candidate struct pair


    // Store Candidates Count for easy fetching candiadtes
    uint public candidatesCount;

    // voted event
    event votedEvent (
        uint indexed _candidateId
    );



    //constructor, initializing candiadtes, it gets run whenver we deploy our smart contracts
    constructor () public {
        addCandidate("Party 1");
        addCandidate("Party 2");
       
    }



    //function to add candiadte
    //made it private, because dont want to accessible public interface of the contract
    
    function addCandidate (string _name) private {              //local variable is described with underscore "_name"
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }




    function vote (uint _candidateId) public {
        // require that they haven't voted before, solidity gives us special way of accessing the 
        //account who is sending this function with "msg. sender", its kinda like metadata
        
        //it means requires that the votes do not voted yet
        require(!voters[msg.sender]);

        // require a valid candidate is voting or not
        require(_candidateId > 0 && _candidateId <= candidatesCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update candidate vote Count
        candidates[_candidateId].voteCount ++;

        // trigger voted event
        emit votedEvent(_candidateId);
    }
}
