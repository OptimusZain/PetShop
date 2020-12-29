// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

contract adoption{

address [16] public adopters;

    function adopt(uint petId) public returns(uint){
        require(petId > 0 && petId <= 15, "Pet ID doesnt exist!");

        adopters[petId] = msg.sender;

        return petId;

    }

    function getAdopters() public view returns(address [16] memory){
        return adopters;
    }



}