// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AuditLedger {
    event AuditCommitted(
        bytes32 auditHash,
        uint256 timestamp
    );

    function commitAudit(bytes32 auditHash) external {
        emit AuditCommitted(auditHash, block.timestamp);
    }
}
