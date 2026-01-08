// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DocumentTimestamp {
    // Mapping from document hash to block timestamp
    // We use bytes32 to store the SHA-256 hash
    mapping(bytes32 => uint256) private timestamps;

    // Event emitted when a document is stamped
    event DocumentStamped(address indexed user, bytes32 indexed hash, uint256 timestamp);

    /**
     * @dev Stores the hash of a document and records the current block timestamp.
     * @param hash The SHA-256 hash of the document.
     * @return The timestamp of the document (either new or existing).
     */
    function storeHash(bytes32 hash) public returns (uint256) {
        // If hash already exists, do not update timestamp, just return existing one
        // If hash already exists, revert the transaction
        require(timestamps[hash] == 0, "Document already stamped");

        // Store the current block timestamp
        timestamps[hash] = block.timestamp;

        // Emit event
        emit DocumentStamped(msg.sender, hash, block.timestamp);

        return block.timestamp;
    }

    /**
     * @dev Verifies if a document hash exists on the blockchain.
     * @param hash The SHA-256 hash of the document.
     * @return exists True if the document has been stamped.
     * @return timestamp The timestamp when it was stamped (or 0 if not found).
     */
    function verifyHash(bytes32 hash) public view returns (bool, uint256) {
        uint256 ts = timestamps[hash];
        if (ts != 0) {
            return (true, ts);
        }
        return (false, 0);
    }
}
