use anchor_lang::prelude::*;
pub mod contexts;
pub mod error;
pub mod state;

use contexts::*;
use error::ErrorCode;
use state::*;

use anchor_lang::solana_program::system_instruction;
declare_id!("TCmSPaJcRMbtzJbkGcGrJtcsjzNRpAwFRNxhqTC9BZZ");

#[program]
pub mod backend {

    use super::*;

    pub fn register_user(
        ctx: Context<Initialize>,
        name: String,
        is_client: bool,
        is_freelancer: bool,
        resume: Option<Resume>,
    ) -> Result<()> {
        let user = &mut ctx.accounts.user;
        user.authority = ctx.accounts.authority.key();
        user.name = name;
        user.is_client = is_client;
        user.is_freelancer = is_freelancer;
        user.reputation = 50;
        user.completed_jobs = 0;
        user.created_at = Clock::get()?.unix_timestamp;
        user.resume = resume;
        user.disputes_raised = 0;
        user.disputes_resolved = 0;
        user.total_earnings = 0;
        user.total_spent = 0;
        user.active_jobs = 0;
        user.pending_jobs = 0;
        user.cancelled_jobs = 0;

        require!(
            user.authority == ctx.accounts.authority.key(),
            ErrorCode::AuthorityMismatch
        );
        Ok(())
    }

    pub fn update_user_info(
        ctx: Context<UpdateUserInfo>,
        new_name: Option<String>,
        new_is_client: Option<bool>,
        new_is_freelancer: Option<bool>,
    ) -> Result<()> {
        let user = &mut ctx.accounts.user;

        if let Some(name) = new_name {
            user.name = name;
        }
        if let Some(is_client) = new_is_client {
            user.is_client = is_client;
        }
        if let Some(is_freelancer) = new_is_freelancer {
            user.is_freelancer = is_freelancer;
        }

        msg!("User info updated for {}", user.authority);
        Ok(())
    }
    pub fn update_resume(ctx: Context<UpdateResumeCtx>, new_resume: Resume) -> Result<()> {
        let user = &mut ctx.accounts.user;

        // Validate vector sizes
        require!(
            new_resume.education.len() <= MAX_EDUCATION,
            ErrorCode::TooManyEducationEntries
        );
        require!(
            new_resume.experience.len() <= MAX_EXPERIENCE,
            ErrorCode::TooManyExperienceEntries
        );
        require!(
            new_resume.skills.len() <= MAX_SKILLS,
            ErrorCode::TooManySkills
        );
        require!(
            new_resume.certifications.len() <= MAX_CERTIFICATIONS,
            ErrorCode::TooManyCertifications
        );
        require!(
            new_resume.portfolio.len() <= MAX_PORTFOLIO,
            ErrorCode::TooManyPortfolioItems
        );

        // Update resume
        user.resume = Some(Resume {
            education: new_resume.education,
            experience: new_resume.experience,
            skills: new_resume.skills,
            certifications: new_resume.certifications,
            portfolio: new_resume.portfolio,
            last_update: Clock::get()?.unix_timestamp,
        });

        msg!("Resume updated for {}", user.authority);
        Ok(())
    }
    
    pub fn create_job(
        ctx: Context<CreateJob>,
        title: String,
        description: String,
        budget: u64,
        deadline: i64,
        skills: Vec<String>,
        category: String,
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        let job_counter = &mut ctx.accounts.job_counter;
        let clock = Clock::get()?;
        let now = clock.unix_timestamp;
        let user = &mut ctx.accounts.user;
        // Validations
        require!(deadline > now, ErrorCode::InvalidDeadline);
        require!(title.len() <= 100, ErrorCode::TitleTooLong);
        require!(description.len() <= 1000, ErrorCode::DescriptionTooLong);
        require!(skills.len() <= 10, ErrorCode::TooManySkills);
        require!(category.len() <= 50, ErrorCode::CategoryTooLong);
        
        // Get the universal job ID from counter
        let global_job_id = job_counter.count;
        
        // Increment counter for next job
        job_counter.count += 1;
        
        // Initialize job with universal ID
        job.authority = ctx.accounts.authority.key();
        job.client = ctx.accounts.authority.key();
        job.freelancer = None;
        job.job_id = global_job_id;  // Universal unique ID: 0, 1, 2, 3...
        job.title = title;
        job.description = description;
        job.budget = budget;
        job.deadline = deadline;
        job.status = JobStatus::Open;
        job.created_at = now;
        job.updated_at = now;
        job.bidders = Vec::new();
        job.reviews = Vec::new();
        job.dispute = None;
        job.skills = skills;
        job.category = category;
        job.escrow = Pubkey::default();
        job.total_paid = 0;
        job.work_submitted = false;
        job.work_submission_url = String::new();
        job.work_submission_description = String::new();
        job.work_submitted_at = None;
        job.work_approved = false;
        job.work_approved_at = None;
        user.active_jobs += 1;
        msg!(
            "Job created successfully: {} (Universal ID: {})", 
            job.title, 
            global_job_id
        );
        Ok(())
    }
    pub fn initialize_job_counter(ctx: Context<InitializeJobCounter>) -> Result<()> {
        let job_counter = &mut ctx.accounts.job_counter;
        job_counter.count = 0;  // Start from 0
        msg!("Job counter initialized to 0");
        Ok(())
    }
    pub fn assign_job(ctx: Context<AssignJob>,job_id: u64, freelancer: Pubkey, bid_amount: u64) -> Result<()> {
        let job = &mut ctx.accounts.job;
        let clock = Clock::get()?;
        let now = clock.unix_timestamp;
        let jobId = job_id;
        // Verify the freelancer has bid on this job
        let bid_exists = job
            .bidders
            .iter()
            .any(|bid| bid.freelancer == freelancer && bid.proposed_amount == bid_amount);
        require!(bid_exists, ErrorCode::BidNotFound);

        // Verify client has enough SOL for escrow
        let client_lamports = ctx.accounts.client.lamports();
        require!(
            client_lamports >= bid_amount,
            ErrorCode::InsufficientBalance
        );

        // Transfer funds to escrow
        let transfer_ix = system_instruction::transfer(
            &ctx.accounts.client.key(),
            &ctx.accounts.escrow.key(),
            bid_amount,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.client.to_account_info(),
                ctx.accounts.escrow.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Update job status and assign freelancer
        job.freelancer = Some(freelancer);
        job.status = JobStatus::InProgress;
        job.updated_at = now;
        job.budget = bid_amount; // Update budget to the accepted bid amount

        msg!(
            "Job '{}' assigned to freelancer: {}. Amount {} SOL transferred to escrow",
            job.title,
            freelancer,
            bid_amount
        );

        Ok(())
    }
}
