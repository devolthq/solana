use anchor_lang::prelude::*;

#[error_code]
pub enum DevoltError {
    #[msg("Auction has already ended.")]
    AuctionAlreadyEnded,

    #[msg("Unauthorized access attempt.")]
    UnauthorizedAccess,

    #[msg("Invalid input data provided.")]
    InvalidInput,

    #[msg("Insufficient funds for the operation.")]
    InsufficientFunds,

    #[msg("No active auction found for this station.")]
    NoActiveAuction,

    #[msg("The station does not exist.")]
    StationNotFound,

    #[msg("Bid amount is too low.")]
    BidTooLow,
}
