use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Authority mismatch")]
    AuthorityMismatch,
    #[msg("Too many education entries (max 3)")]
    TooManyEducationEntries,
    #[msg("Too many experience entries (max 3)")]
    TooManyExperienceEntries,
    #[msg("Too many skills (max 10)")]
    TooManySkills,
    #[msg("Too many certifications (max 3)")]
    TooManyCertifications,
    #[msg("Too many portfolio items (max 3)")]
    TooManyPortfolioItems,
    #[msg("invalid deadline")]
    InvalidDeadline,
    #[msg("Job not open")]
    JobNotOpen,
    #[msg("Its not your job")]
    NotJobClient,
    #[msg("Bid not found")]
    BidNotFound,
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Title too long")]
    TitleTooLong,
    #[msg("Description too long")]
    DescriptionTooLong,
    #[msg("Too many milestones")]
    TooManyMilestones,
    #[msg("Milestone amounts don't match total budget")]
    MilestoneAmountMismatch,
    #[msg("Invalid milestone date")]
    InvalidMilestoneDate,
    #[msg("Milestone due date is after job deadline")]
    MilestoneAfterDeadline,
    #[msg("Category too long")]
    CategoryTooLong,
    #[msg("Cannot bid on your own job")]
    CannotBidOwnJob,
    #[msg("User is not registered as a freelancer")]
    NotAFreelancer,
    #[msg("You have already submitted a bid for this job")]
    AlreadySubmittedBid,
    #[msg("Bid amount must be greater than zero")]
    InvalidBidAmount,
    #[msg("Job has already been assigned to a freelancer")]
    JobAlreadyAssigned,
    #[msg("Unauthorized user")]
    UnauthorizedUser,
    #[msg("Maximum number of bids reached for this job")]
    MaxBidsReached,
    #[msg("Bid amount exceeds reasonable budget limit")]
    BidExceedsBudget,
    #[msg("Job is not in progress")]
    JobNotInProgress,
    #[msg("You are not the assigned freelancer")]
    NotAssignedFreelancer,
    #[msg("No work has been submitted yet")]
    NoWorkSubmitted,
    #[msg("URL too long (max 500 characters)")]
    UrlTooLong,
    #[msg("Invalid rating. Must be between 1 and 5 stars")]
    InvalidRating,
    #[msg("Job is not completed yet")]
    JobNotCompleted,
    #[msg("Payment already withdrawn from escrow")]
    AlreadyWithdrawn,
    #[msg("Payment has not been completed yet")]
    PaymentNotCompleted,
    #[msg("voting period is invalid")]
    InvalidVotingPeriod,
    #[msg("dispute is already exist")]
    DisputeAlreadyExists,
    #[msg("No freelancer assign")]
    NoFreelancerAssigned,
    #[msg("No dispute exists for this job")]
    NoDispute,
    #[msg("Dispute isn't open")]
    DisputeNotOpen,
    #[msg("Voting is closed")]
    VotingClosed,
    #[msg("You have already voted on this dispute")]
    AlreadyVoted,
    #[msg("Voting period still active")]
    VotingStillActive,
    #[msg("Invalid escrow PDA bump or escrow account")]
    InvalidBump,
    #[msg("Invalid raiser or against user account supplied")]
    InvalidRaiserUserAccount,
    #[msg("Invalid raiser account provided")]
    InvalidRaiserAccount,
    #[msg("Invalid against account provided")]
    InvalidAgainstAccount,
    #[msg("Cannot vote on your own dispute")]
    CannotVoteOwnDispute,
    #[msg("Maximum number of voters reached")]
    MaxVotersReached,
}
