// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

error DynamicSvgNft__NonexistentToken();
error DynamicSvgNft__InvalidLowOrHighValues();

contract DynamicSvgNft is ERC721 {
    // mint function
    // store our SVG information somewhere
    // some logic to say "show X image or show Y image or show Z image"

    uint256 private s_tokenCounter;
    string private i_lowImageUri;
    string private i_mediumImageUri;
    string private i_highImageUri;
    string private constant BASE64_ENCODED_SVG_PREFIX = "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) s_tokenIdToHighValue;
    mapping(uint256 => int256) s_tokenIdToLowValue;

    event DynamicSvgNftMinted(uint256 indexed tokenId, int256 highValue, int256 lowValue);

    constructor(
        address PriceFeedAddress,
        string memory lowSvg,
        string memory mediumSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        // we don't want to store svg, we just want to store the image URI
        i_lowImageUri = svgToImageURI(lowSvg);
        i_mediumImageUri = svgToImageURI(mediumSvg);
        i_highImageUri = svgToImageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(PriceFeedAddress);
    }

    // convert the SVGs to image URIs
    // instead of having ipfs:// as their start they will have data:image/svg+xml;base64,<encoded jargon>
    // we can encode any SVG to a base64 image URL
    // base64 is a group of binary to text encoding scheme that represents binary data (svg data)
    // doing it onchain for fun otherwise this method is expensive
    function svgToImageURI(string memory svg) public pure returns (string memory) {
        // Encoding, Opcodes and Calls
        //      abi.encode and abi.encodePacked

        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(BASE64_ENCODED_SVG_PREFIX, svgBase64Encoded));
    }

    // assigning each NFT their own high value
    function mintNft(int256 highValue, int256 lowValue) public {
        if (lowValue >= highValue) {
            revert DynamicSvgNft__InvalidLowOrHighValues();
        }
        s_tokenCounter += 1;
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        s_tokenIdToLowValue[s_tokenCounter] = lowValue;
        // best practice to update token counter before minting NFT
        _safeMint(msg.sender, s_tokenCounter);

        emit DynamicSvgNftMinted(s_tokenCounter, highValue, lowValue);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    // make this token URI return a base64 encoded version of JSON
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) {
            revert DynamicSvgNft__NonexistentToken();
        }

        (, int256 price, , , ) = i_priceFeed.latestRoundData();

        string memory imageURI;
        if (price <= s_tokenIdToLowValue[tokenId]) {
            imageURI = i_lowImageUri;
        } else if (price >= s_tokenIdToHighValue[tokenId]) {
            imageURI = i_highImageUri;
        } else {
            imageURI = i_mediumImageUri;
        }

        // string memory imageURI = "hi";
        // encapsulating name() in quotes (double quotes)
        // 'stuff', 'stuff' => '' => help concat these two
        // 'stuff"', name(), '"stuff' => "" => make name to be encapsulated in double quotes

        // data:image/svg+xml;base64, => for images
        // data:application/json;base64, => for JSON
        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    Base64.encode(
                        bytes(
                            abi.encodePacked(
                                '{"name":"',
                                name(),
                                '", "description":"An NFT that changes based on the Chainlink Feed", ',
                                '"attributes": [{"trait_type": "coolness", "value": 100}], "image":"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getLowSVG() public view returns (string memory) {
        return i_lowImageUri;
    }

    function getMediumSVG() public view returns (string memory) {
        return i_mediumImageUri;
    }

    function getHighSVG() public view returns (string memory) {
        return i_highImageUri;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
