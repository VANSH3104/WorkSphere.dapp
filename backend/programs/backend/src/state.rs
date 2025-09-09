use anchor_lang::prelude::*;

#[account]
pub struct User{
    pub authority: Pubkey,
    pub name: String,
    pub is_client: bool,
    pub is_freelancer: bool,
    pub reputation: u64,
    pub completed_jobs: u64,
    pub created_at: i64,
    pub resume: Option<Resume>,
    pub disputes_raised: u64,
    pub disputes_resolved: u64,
    pub total_earnings: u64,
    pub total_spent: u64,
    pub active_jobs: u64,
    pub pending_jobs: u64,
    pub cancelled_jobs: u64,
}
impl User {
    pub const LEN: usize = 32 + 4 + 100 + 1 + 1 + 8 + 8 + 8 + 8 + (4 + 1000) + 8 + 8 + 8 + 8 + 8 + 8;
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Resume {
    pub education: Vec<Education>,
    pub experience: Vec<Experience>,
    pub skills: Vec<String>,
    pub certifications: Vec<Certification>,
    pub portfolio: Vec<PortfolioItem>,
    pub last_update: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Education {
    pub institution: Option<String>,
    pub degree: Option<String>,
    pub field_of_study: Option<String>,
    pub start_date: Option<i64>,
    pub end_date: Option<i64>,
    pub grade: Option<String>,
    pub description: Option<String>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Experience {
    pub company: Option<String>,
    pub position: Option<String>,
    pub start_date: Option<i64>,
    pub end_date: Option<i64>,
    pub responsibilities: Option<String>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Certification {
    pub name: Option<String>,
    pub issuing_organization: Option<String>,
    pub issue_date: Option<i64>,
    pub expiration_date: Option<i64>,
    pub credential_id: Option<String>,
    pub credential_url: Option<String>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PortfolioItem {
    pub title: Option<String>,
    pub description: Option<String>,
    pub url: Option<String>,
    pub image_url: Option<String>,
}