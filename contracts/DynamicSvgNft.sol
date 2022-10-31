// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract DynamicSvgNft is ERC721 {
    // mint function
    // store our SVG information somewhere
    // some logic to say "show X image or show Y image or show Z image"

    uint256 private s_tokenCounter;
    string private i_lowImageUri;
    string private i_mediumImageUri;
    string private i_HighImageUri;

    constructor(
        string memory lowSvg,
        string memory mediumSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
    }

    // convert the SVGs to image URIs
    // instead of having ipfs:// as their start they will have data:image/svg+xml;base64,<encoded jargon>
    // we can encode any SVG to a base64 image URL
    // base64 is a group of binary to text encoding scheme that represents binary data (svg data)
    // function svgToImageURI() {}

    function mintNft() public {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter += 1;
    }
}
