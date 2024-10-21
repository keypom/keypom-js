export const BASE_NFT_ABI = [
    "function lazyMint(address to, uint256 series, uint256 quantity, bytes data)",
    "function batchLazyMint(address to, uint256[] seriesIds, uint256[] amounts, bytes data)",
    "function multiAddressLazyMint(address[] addresses, uint256[] seriesIds, bytes data)",
    "function multiAddressLazyMintTest(uint256[] bar)",
    "function approveCreator(address creator)",
    "function revokeCreator(address creator)",
    "function setBaseURI(string baseURI)",
    "function initializeSeries(uint256 maxSupply, string token_uri)",
];
