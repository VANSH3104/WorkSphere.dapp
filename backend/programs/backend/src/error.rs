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
}
