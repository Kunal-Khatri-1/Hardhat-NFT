// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreEth();
error RandomIpfsNft__TransferFailed();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
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

    // Type Declarations
    enum Specie {
        SKYIE,
        DUCKIE,
        QUACKIE
    }

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
    // paramterizing instead of hardcoding the URIs
    string[] internal s_birdTokenUris;
    uint256 internal i_mintFee;

    // Events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Specie birdSpecie, address minter);

    // constructor will still use ERC721 contructor
    // ERC721URIStorage is extending ERC721
    // ERC721URIStorage has no constructor of its own
    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory birdTokenUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Birb", "BIRB") {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_birdTokenUris = birdTokenUris;
        i_mintFee = mintFee;
    }

    function requestNft() public payable returns (uint256 requestId) {
        // pay minimum of mintFee to mint the NFT
        if (msg.value < i_mintFee) {
            revert RandomIpfsNft__NeedMoreEth();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        s_requestIdToSender[requestId] = msg.sender;

        emit NftRequested(requestId, msg.sender);
    }

    // can't do _safeMint(msg.sender, s_tokenCounter) inside fulfillRandomWords
    // this function is called by chainlink nodes => they will own the NFT
    // solution => create a mapping between requestId and whoevers calls requestNft
    // then we can use requestId in this function to get the address of the potential NFT owner
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address nftBirdOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;
        s_tokenCounter = s_tokenCounter + 1;

        // getting a number between 0 and 99
        // 0 - 10 => Skyie
        // 10 - 30 => Duckie
        // 30 - 100 => Quackie
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        Specie birdSpecie = getBirdFromModdedRng(moddedRng);
        _safeMint(nftBirdOwner, newTokenId);
        // _setTokenURI(uint256 tokenId, string memory _tokenURI)
        // casting the enum back to uint

        // extention in the opnezeppelin code called ERC721URIStorage
        // this version of the ERC-721 has function _setTokenURI
        // NOTE: _setTokenURI isn't the most gas efficient operation.
        // NOTE: We are using it because it does have the most customization
        // we can call setTokenURI and this will automatically update that token's token URI to whatever you set it as
        // function tokenURI(uint256) public view override returns (string memory) {}
        // dont need tokenURI function because _setTokenURI is going to set tokenURI
        _setTokenURI(newTokenId, s_birdTokenUris[uint256(birdSpecie)]);

        emit NftMinted(birdSpecie, nftBirdOwner);
    }

    // Ownalbe comes with onlyOwner modifier
    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__TransferFailed();
        }
    }

    function getBirdFromModdedRng(uint256 moddedRng) public pure returns (Specie) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]) {
                return Specie(i);
            }
            cumulativeSum += chanceArray[i];
        }

        revert RandomIpfsNft__RangeOutOfBounds();
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        return [10, 30, MAX_CHANCE_VALUE];
    }

    function getNftRequestSender(uint256 requestId) public view returns (address) {
        return (s_requestIdToSender[requestId]);
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getBirdTokenUris(uint256 index) public view returns (string memory) {
        return s_birdTokenUris[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
