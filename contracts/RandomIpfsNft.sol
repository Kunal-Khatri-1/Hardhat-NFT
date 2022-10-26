// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721 {
    // when we mint a NFT, we will trigger a Chainlink VRF call to get us a random number
    // using that number, we will get a random NFT
    // Skyie, Duckie, Quackie
    // make these birds have different rarity
    // Quackie => common
    // Duckie => sort of rare
    // Skyie => super rare

    // users have to pay to mint an NFT
    // the owner of the contract can withdraw the ETH => this will reward the artist for creating an NFT

    // kick off a chainlink VRF request

    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // VRF helpers
    mapping(uint256 => address) private s_requestIdToSender;

    // NFT Variables
    uint256 private s_tokenCounter;
    uint256 internal constant MAX_CHANCE_VALUE = 100;

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Birb", "BIRB") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
    }

    function requestNft() public returns (uint256 requestId) {
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        s_requestIdToSender[requestId] = msg.sender;
    }

    // can't do _safeMint(msg.sender, s_tokenCounter) inside fulfillRandomWords
    // this function is called by chainlink nodes => they will own the NFT
    // solution => create a mapping between requestId and whoevers calls requestNft
    // then we can use requestId in this function to get the address of the potential NFT owner
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address nftBirdOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        _safeMint(nftBirdOwner, newTokenId);

        uint256 moddedRng = randomWords[0];

        // getBirdFromModdedRng()
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function tokenURI(uint256) public view override returns (string memory) {}

    function getNftRequestSender(uint256 requestId) public view returns (address) {
        return (s_requestIdToSender[requestId]);
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
