use anchor_lang::prelude::*;
pub const MAX_EDUCATION: usize = 3;
pub const MAX_EXPERIENCE: usize = 3;
pub const MAX_SKILLS: usize = 10;
pub const MAX_CERTIFICATIONS: usize = 3;
pub const MAX_PORTFOLIO: usize = 3;
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
    pub const LEN: usize = 32 + 4 + 100 + 1 + 1 + 8 + 8 + 8 + 8 + (1 + Resume::LEN) + 8 + 8 + 8 + 8 + 8 + 8 + 8;
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
impl Resume {
    pub const LEN: usize = 
        4 + (MAX_EDUCATION * Education::LEN) +
        4 + (MAX_EXPERIENCE * Experience::LEN) +
        4 + (MAX_SKILLS * (4 + 50)) + // Vec<String> with max 50 chars each
        4 + (MAX_CERTIFICATIONS * Certification::LEN) +
        4 + (MAX_PORTFOLIO * PortfolioItem::LEN) +
        8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Education {
    pub institution: String,         
    pub degree: String,                
    pub field_of_study: String,      
    pub start_date: i64,
    pub end_date: i64,
    pub grade: String,               
    pub description: String, 
}
impl Education {
    pub const LEN: usize = 
        4 + 50 + // institution (reduced from 100)
        4 + 50 + // degree
        4 + 50 + // field_of_study
        8 + 8 + // dates
        4 + 20 + // grade
        4 + 200; // description
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Experience {
    pub company: String,             
    pub position: String,            
    pub start_date: i64,             
    pub end_date: i64,               
    pub responsibilities: String,
}
impl Experience {
    pub const LEN: usize = 
        4 + 50 + // company
        4 + 50 + // position
        8 + 8 + // dates
        4 + 300; // responsibilities (reduced from 1000)
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Certification {
    pub name: String,                
    pub issuing_organization: String,  
    pub issue_date: i64,             
    pub expiration_date: i64,        
    pub credential_id: String,       
    pub credential_url: String, 
}
impl Certification {
    pub const LEN: usize = 
        4 + 50 + // name
        4 + 50 + // issuing_organization
        8 + 8 + // dates
        4 + 50 + // credential_id
        4 + 100; // credential_url
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PortfolioItem {
    pub title: String,               
    pub description: String,         
    pub url: String,                 
    pub image_url: String, 
}
impl PortfolioItem {
    pub const LEN: usize = 
        4 + 50 + // title
        4 + 200 + // description
        4 + 100 + // url
        4 + 100; // image_url
}
// ALl related to Jobs
#[account]
pub struct Job {
    pub authority: Pubkey,
    pub client: Pubkey,
    pub freelancer: Option<Pubkey>,
    pub job_id: u64,
    pub title: String,
    pub description: String,
    pub budget: u64,
    pub deadline: i64,
    pub status: JobStatus,
    pub created_at: i64,
    pub updated_at: i64,
    pub bidders: Vec<Bid>,
    pub reviews: Vec<Review>,
    pub dispute: Option<Dispute>,
    pub skills: Vec<String>,
    pub category: String,
    pub escrow: Pubkey,
    pub total_paid: u64,
    pub work_submitted: bool,
    pub work_submission_url: String,
    pub work_submission_description: String,
    pub work_submitted_at: Option<i64>,
    pub work_approved: bool,
    pub work_approved_at: Option<i64>,
}
impl Job {
    pub const LEN: usize = 
        32 + // authority
        32 + // client
        1 + 32 + // freelancer (Option<Pubkey>)
        8 +  // job_id (Universal ID)
        4 + 100 + // title
        4 + 1000 + // description
        8 + // budget
        8 + // deadline
        1 + // status
        8 + // created_at
        8 + // updated_at
        4 + (50 * Bid::LEN) + // bidders vec
        4 + (10 * Review::LEN) + // reviews vec
        1 + (1 + Dispute::LEN) + // dispute
        4 + (10 * (4 + 50)) + // skills vec
        4 + 50 + // category
        32 + // escrow
        8 + // total_paid
        1 + // work_submitted
        4 + 500 + // work_submission_url
        4 + 1000 + // work_submission_description
        1 + 8 + // work_submitted_at
        1 + // work_approved
        1 + 8; // work_approved_at
}

#[account]
pub struct JobCounter {
    pub count: u64,
}

impl JobCounter {
    pub const LEN: usize = 8; // Just the count (u64)
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Review {
    pub reviewer: Pubkey,
    pub rating: u8,
    pub comment: String,
    pub created_at: i64,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Dispute {
    pub raiser: Pubkey,
    pub reason: String,
    pub status: DisputeStatus,
    pub created_at: i64,
    pub resolved_at: Option<i64>,
    pub resolution: Option<String>,

    // for voters
    pub voting_start: i64,
    pub voting_end: i64,
    pub votes_for: u64,
    pub votes_against: u64,
    pub voters: Vec<Pubkey>,
}
impl Dispute {
    pub const LEN: usize = 32 + // raiser
        4 + 500 + // reason
        1 + // status
        8 + // created_at
        1 + 8 + // resolved_at (Option)
        1 + (4 + 500) + // resolution (Option)
        8 + // voting_start
        8 + // voting_end
        8 + // votes_for
        8 + // votes_against
        4 + (100 * 32); // voters vec (max 100 voters)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum DisputeStatus {
    Open,
    Resolved,
    Rejected,
}
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum JobStatus {
    Open,
    InProgress,
    Completed,
    Cancelled,
    Disputed,
}


impl Review {
    pub const LEN: usize = 32 + 1 + (4 + 500) + 8;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Bid {
    pub freelancer: Pubkey,
    pub proposed_amount: u64,
    pub timestamp: i64,
}
impl Bid {
    pub const LEN: usize = 32 + 8 + 8;
}
