// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@chainlink/contracts/src/v0.8/VRFV2WrapperConsumerBase.sol";

abstract contract MinteebleRandomizationConsumer is VRFV2WrapperConsumerBase {
    event RequestSent(uint256 requestId);

    event RequestFulfilled(
        uint256 requestId,
        uint256[] randomWords,
        uint256 payment
    );

    struct RequestStatus {
        uint256 paid;
        bool fulfilled;
        uint256 randomNumber;
    }

    mapping(uint256 => RequestStatus) public s_requests;

    uint256[] public requestIds;
    uint256 public lastRequestId;
    uint32 public gasLimit = 100000;
    uint16 public requestConfirmations = 3;

    address linkAddress;
    address wrapperAddress;

    constructor(address _linkAddress, address _wrapperAddress)
        VRFV2WrapperConsumerBase(_linkAddress, _wrapperAddress)
    {
        linkAddress = _linkAddress;
        wrapperAddress = _wrapperAddress;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].paid > 0, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomNumber = _randomWords[0];

        emit RequestFulfilled(
            _requestId,
            _randomWords,
            s_requests[_requestId].paid
        );

        // for (uint256 i = 0; i < 20; ++i) {
        //     uint256 winnerId = (s_requests[_requestId].randomNumber) %
        //         collection.totalSupply();

        //     address winnerAddress = collection.ownerOf(winnerId);

        //     emit RandomExtraction(address(collection), winnerId, winnerAddress);

        //     collection.ownerMintForAddress(1, winnerAddress);
        // }
    }

    function _getRandom() internal returns (uint256 requestId) {
        requestId = requestRandomness(gasLimit, requestConfirmations, 1);
        s_requests[requestId] = RequestStatus({
            paid: VRF_V2_WRAPPER.calculateRequestPrice(gasLimit),
            randomNumber: 0,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId);
        return requestId;
    }

    function getRandomizationRequestStatus(uint256 _requestId)
        external
        view
        returns (
            uint256 paid,
            bool fulfilled,
            uint256 randomNumber
        )
    {
        require(s_requests[_requestId].paid > 0, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.paid, request.fulfilled, request.randomNumber);
    }

    function _withdrawLink() internal {
        LinkTokenInterface link = LinkTokenInterface(linkAddress);
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
