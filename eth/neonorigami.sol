// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract NeonOrigami {
    
    uint constant private MAX_STRING_LENGTH = 10000;
    mapping(string => string) private store;

    function get(address _account, string memory _key) public view returns(string memory) {
        return store[_key];
    }

    function set(string memory _key, string memory _value) public {
        require(bytes(_key).length <= MAX_STRING_LENGTH && bytes(_value).length <= MAX_STRING_LENGTH);
        store[_key] = _value;
    }
}