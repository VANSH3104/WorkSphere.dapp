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
}
