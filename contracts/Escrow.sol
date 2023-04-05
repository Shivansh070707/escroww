//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Escrow is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Counters for Counters.Counter;
    //stores all the details of an escrow
    struct EscrowRequest {
        uint256 id;
        address seller;
        address buyer;
        address token;
        uint256 amount;
        uint256 expiry;
        Status status;
    }
    //represents all the stages of an escrow
    enum Status {
        active,
        released,
        refunded
    }
    //mapping of escrow id to escrow request
    mapping(uint256 => EscrowRequest) escrowRequests;
    //mapping of escrow id to balance
    mapping(uint256 => uint256) escrowBalances;
    //represents the total number of requests
    Counters.Counter totalRequests;
    //checks if the id passed is valid
    modifier checkIsValid(uint256 id) {
        if (id > totalRequests.current()) revert InvalidId();
        _;
    }
    modifier checkIsActive(uint256 id) {
        //check if escrow tokens have already been released/refunded
        if (escrowRequests[id].status == Status.released)
            revert TokensAlreadyReleased();
        if (escrowRequests[id].status == Status.refunded)
            revert TokensAlreadyRefunded();
        _;
    }
    event RequestCreated(
        uint256 indexed id,
        address seller,
        address buyer,
        uint256 amount
    );
    event RequestCompleted(uint256 indexed id, address seller, address buyer);
    event RequestCancelled(uint256 indexed id, address seller);
    event RequestWithdrawn(uint256 indexed id, address seller);
    //Thrown when no escrow exists for this id
    error InvalidId();
    //Thrown when the caller is not the token seller
    error Unauthorised();
    //Thrown when the tokens have already been released
    error TokensAlreadyReleased();
    //Thrown when the tokens have already been refunded
    error TokensAlreadyRefunded();
    //Thrown when the request is still active
    error NotYetExpired();
    //Thrown when the request has expired
    error EscrowExpired();

    /** @dev Stores an escrow request and transfers funds into escrow contract
     * @param buyer Address of the buyer.
     * @param expiry Expiry time of the request.
     * @param token The address of the token being transferred.
     * @param amount The amount to be transferred in the escrow.
     */
    function createRequest(
        address buyer,
        uint256 expiry,
        address token,
        uint256 amount
    ) external nonReentrant {
        require(expiry > 0, "Invalid Value Provided for Expiry");
        require(amount > 0, "Amount should be greater than 0");
        require(buyer != address(0), "Invalid buyer address provided");
        totalRequests.increment();
        uint256 id = totalRequests.current();
        //transfer the tokens from msg.sender(seller) to the escrow
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        //store all the escrow request details
        EscrowRequest memory request = EscrowRequest(
            id,
            msg.sender,
            buyer,
            token,
            amount,
            block.timestamp + expiry,
            Status.active
        );
        escrowRequests[id] = request;
        //update the escrow balance mapping for this id
        escrowBalances[id] = amount;
        emit RequestCreated(id, msg.sender, buyer, amount);
    }

    /** @dev Confirms the escrow completion and releases the tokens from escrow contract to the buyer
     * @param id Id of the request
     */
    function confirmReceived(
        uint256 id
    ) external checkIsValid(id) checkIsActive(id) nonReentrant {
        EscrowRequest storage request = escrowRequests[id];
        //check if caller is the seller (only the token seller can call the function)
        if (request.seller != msg.sender) revert Unauthorised();
        //release the tokens to the buyer
        _releaseTokens(id);
        emit RequestCompleted(id, msg.sender, request.buyer);
    }

    /** @dev Cancels the request after it has expired and refunds the tokens back to the seller
     * @param id Id of the request
     */
    function cancelRequest(
        uint256 id
    ) external checkIsValid(id) checkIsActive(id) nonReentrant {
        EscrowRequest storage request = escrowRequests[id];
        //check if caller is the seller (only the token seller can call the function)
        if (request.seller != msg.sender) revert Unauthorised();
        //check if request has expired (cancel only allowed if escrow request has expired)
        if (request.expiry >= block.timestamp) revert NotYetExpired();
        //transfer token back to the owner i.e. seller
        _refundTokens(id);
        emit RequestCancelled(id, msg.sender);
    }

    /** @dev Cancels the request before it has expired and refunds the tokens back to the seller
     * @param id Id of the request
     */
    function withdrawTokens(
        uint256 id
    ) external checkIsValid(id) checkIsActive(id) nonReentrant {
        EscrowRequest storage request = escrowRequests[id];
        //check if caller is the seller (only the token seller can call the function)
        if (request.seller != msg.sender) revert Unauthorised();
        //check the status if escrow request has expired (withdraw only allowed if request still active)
        if (request.expiry < block.timestamp) revert EscrowExpired();
        //transfer token back to the owner i.e. seller
        _refundTokens(id);
        emit RequestWithdrawn(id, msg.sender);
    }

    /** @dev transfers the tokens to the buyer
     * @param id Id of the request
     */
    function _releaseTokens(uint256 id) internal {
        EscrowRequest storage request = escrowRequests[id];
        uint256 totalTokenBal = IERC20(request.token).balanceOf(address(this));
        uint256 escrowAmount = escrowBalances[id];
        require(escrowAmount > 0, "Escrow Balance is 0");
        require(totalTokenBal - escrowAmount >= 0, "Escrow fund mismatch");
        //update escrow balance to 0 for this id
        escrowBalances[id] = 0;
        //update the status for the escrow request
        request.status = Status.released;
        //transfer the tokens to the buyer
        IERC20(request.token).safeTransfer(request.buyer, escrowAmount);
    }

    /** @dev transfers the tokens to the seller
     * @param id Id of the request
     */
    function _refundTokens(uint256 id) internal {
        EscrowRequest storage request = escrowRequests[id];
        uint256 totalTokenBal = IERC20(request.token).balanceOf(address(this));
        uint256 escrowAmount = escrowBalances[id];
        require(escrowAmount > 0, "Escrow Balance is 0");
        require(totalTokenBal - escrowAmount >= 0, "Escrow fund mismatch");
        //update escrow balance to 0 for this id
        escrowBalances[id] = 0;
        //update the status for the escrow request
        request.status = Status.refunded;
        //transfer the tokens to the seller
        IERC20(request.token).safeTransfer(request.seller, escrowAmount);
    }

    /** @dev Gets the escrow balance for the given id
     * @param id Id of the request
     * @return bal Balance of escrow contract
     */
    function getEscrowBalance(
        uint256 id
    ) external view checkIsValid(id) returns (uint256 bal) {
        bal = escrowBalances[id];
    }

    /** @dev Gets the escrow details for the given id
     * @param id Id of the request
     * @return EscrowRequest details of the escrow
     */
    function getEscrowRequest(
        uint256 id
    ) external view checkIsValid(id) returns (EscrowRequest memory) {
        return escrowRequests[id];
    }

    /** @dev Gets all the escrow requests and the totalRequests
     * @return result details of the all escrows
     * @return totalRequests returns the total number of requests in the escrow
     */
    function getAllEscrows()
        external
        view
        returns (EscrowRequest[] memory, uint256)
    {
        uint256 total = totalRequests.current();
        EscrowRequest[] memory requests = new EscrowRequest[](total + 1);
        for (uint i = 1; i <= total; i++) {
            requests[i] = escrowRequests[i];
        }
        return (requests, total);
    }

    /**@dev Gets the total number of requests
     *@return totalRequests the total number of requests
     */
    function getTotalRequests() external view returns (uint256) {
        return totalRequests.current();
    }
}
