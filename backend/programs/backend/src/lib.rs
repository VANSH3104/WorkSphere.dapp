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
        job.revision_request = None;
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
    pub fn assign_job(
        ctx: Context<AssignJob>, 
        _job_id: u64, 
        freelancer: Pubkey, 
        bid_amount: u64
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        let clock = Clock::get()?;
        let freelancer_user = &mut ctx.accounts.freelancer_user;
        let client_user = &mut ctx.accounts.client_user;
        let now = clock.unix_timestamp;
        
        // Verify bid exists
        let bid_exists = job
            .bidders
            .iter()
            .any(|bid| bid.freelancer == freelancer && bid.proposed_amount == bid_amount);
        require!(bid_exists, ErrorCode::BidNotFound);
    
        // Verify job is open
        require!(job.status == JobStatus::Open, ErrorCode::JobNotOpen);
        
        // Verify client is the job owner
        require!(job.client == ctx.accounts.client.key(), ErrorCode::NotJobClient);
    
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
        
        // Update freelancer counters
        freelancer_user.pending_jobs = freelancer_user
            .pending_jobs
            .checked_add(1).unwrap();
            
        // Update job counters for client
        client_user.pending_jobs = client_user
            .pending_jobs
            .checked_add(1)
            .unwrap();
        client_user.active_jobs = client_user
            .active_jobs
            .checked_sub(1)
            .unwrap();
        
        // Update job status and assign freelancer
        job.freelancer = Some(freelancer);
        job.status = JobStatus::InProgress;
        job.updated_at = now;
        job.budget = bid_amount;
        job.escrow = ctx.accounts.escrow.key(); 
    
        msg!(
            "Job '{}' assigned to freelancer: {}. Amount {} lamports transferred to escrow",
            job.title,
            freelancer,
            bid_amount
        );
    
        Ok(())
    }
    pub fn submit_proposal(
        ctx: Context<SubmitProposal>,
        _job_id: u64,
        proposed_amount: u64,
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        let user = &mut ctx.accounts.user;
        let freelancer = ctx.accounts.freelancer.key();
        let clock = Clock::get()?;
        require!(
            user.authority == freelancer,
            ErrorCode::UnauthorizedUser
        );
        require!(
            user.is_freelancer,
            ErrorCode::NotAFreelancer
        );
        require!(
            job.status == JobStatus::Open,
            ErrorCode::JobNotOpen
        );
        require!(
            job.client != freelancer,
            ErrorCode::CannotBidOwnJob
        );
        require!(
            job.freelancer.is_none(),
            ErrorCode::JobAlreadyAssigned
        );
        require!(
            !job.bidders.iter().any(|bid| bid.freelancer == freelancer),
            ErrorCode::AlreadySubmittedBid
        );
        require!(
            proposed_amount > 0, 
            ErrorCode::InvalidBidAmount
        );
        require!(
            job.bidders.len() < 50,
            ErrorCode::MaxBidsReached
        );
        let bid = Bid {
            freelancer,
            proposed_amount,
            timestamp: clock.unix_timestamp,
        };
        job.bidders.push(bid);
        job.updated_at = clock.unix_timestamp;
        user.pending_jobs += 1;
        
        Ok(())
    }
    pub fn submit_work(
        ctx: Context<SubmitWork>,
        _job_id: u64,
        work_url: String,
        work_description: String,
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        let freelancer_user = &mut ctx.accounts.freelancer_user;
        let clock = Clock::get()?;
        
        // Validations
        require!(
            job.status == JobStatus::InProgress,
            ErrorCode::JobNotInProgress
        );
        require!(
            job.freelancer == Some(ctx.accounts.freelancer.key()),
            ErrorCode::NotAssignedFreelancer
        );
        require!(
            work_url.len() <= 500,
            ErrorCode::UrlTooLong
        );
        require!(
            work_description.len() <= 1000,
            ErrorCode::DescriptionTooLong
        );
        
        // Update job with work submission
        job.work_submitted = true;
        job.work_submission_url = work_url;
        job.work_submission_description = work_description;
        job.work_submitted_at = Some(clock.unix_timestamp);
        job.updated_at = clock.unix_timestamp;
        job.revision_request = None;
        
        msg!(
            "Work submitted for job '{}' by freelancer: {}",
            job.title,
            ctx.accounts.freelancer.key()
        );
        
        Ok(())
    }
    pub fn request_revision(
        ctx: Context<RequestRevision>,
        _job_id: u64,
        revision_description: String,
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        let clock = Clock::get()?;
        
        // Validations
        require!(
            job.status == JobStatus::InProgress,
            ErrorCode::JobNotInProgress
        );
        require!(
            job.client == ctx.accounts.client.key(),
            ErrorCode::NotJobClient
        );
        require!(
            job.work_submitted,
            ErrorCode::NoWorkSubmitted
        );
        require!(
            revision_description.len() <= 500,
            ErrorCode::DescriptionTooLong
        );
        job.work_submitted = false;
        job.work_submission_url = String::new();
        job.work_submission_description = String::new();
        job.revision_request = Some(revision_description);
        job.updated_at = clock.unix_timestamp;
        
        msg!(
            "Revision requested for job '{}': {}",
            job.title,
            job.revision_request.as_ref().unwrap()
        );
        
        Ok(())
    }
    pub fn accept_work(
        ctx: Context<AcceptWork>,
        _job_id: u64,
        freelancer_rating: u8,
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        let client_user = &mut ctx.accounts.client_user;
        let freelancer_user = &mut ctx.accounts.freelancer_user;
        let clock = Clock::get()?;
        
        // Validations
        require!(
            job.status == JobStatus::InProgress,
            ErrorCode::JobNotInProgress
        );
        require!(
            job.client == ctx.accounts.client.key(),
            ErrorCode::NotJobClient
        );
        require!(
            job.work_submitted,
            ErrorCode::NoWorkSubmitted
        );
        require!(
            freelancer_rating >= 1 && freelancer_rating <= 5,
            ErrorCode::InvalidRating
        );
        
        // Calculate reputation points (5 stars = 25, 4 stars = 20, etc.)
        let reputation_points = (freelancer_rating as u64) * 5;
        
        // Update job status
        job.status = JobStatus::Completed;
        job.work_approved = true;
        job.work_approved_at = Some(clock.unix_timestamp);
        job.updated_at = clock.unix_timestamp;
        
        // Update freelancer stats
        freelancer_user.completed_jobs = freelancer_user
            .completed_jobs
            .checked_add(1)
            .unwrap();
        freelancer_user.reputation = freelancer_user
            .reputation
            .checked_add(reputation_points)
            .unwrap();
        freelancer_user.pending_jobs = freelancer_user
            .pending_jobs
            .checked_sub(1)
            .unwrap();
        
        // Update client stats
        client_user.completed_jobs = client_user
            .completed_jobs
            .checked_add(1)
            .unwrap();
        client_user.pending_jobs = client_user
            .pending_jobs
            .checked_sub(1)
            .unwrap();
        client_user.total_spent = client_user
            .total_spent
            .checked_add(job.budget)
            .unwrap();
        
        msg!(
            "Job '{}' completed! Freelancer rated {} stars (+{} reputation)",
            job.title,
            freelancer_rating,
            reputation_points
        );
        
        Ok(())
    }
    pub fn withdraw_from_escrow(
        ctx: Context<WithdrawFromEscrow>,
        _job_id: u64,
        client_rating: u8,
    ) -> Result<()> {
        let job = &mut ctx.accounts.job;
        let freelancer_user = &mut ctx.accounts.freelancer_user;
        let client_user = &mut ctx.accounts.client_user;
        
        // Validations
        require!(
            job.status == JobStatus::Completed,
            ErrorCode::JobNotCompleted
        );
        require!(
            job.freelancer == Some(ctx.accounts.freelancer.key()),
            ErrorCode::NotAssignedFreelancer
        );
        require!(
            job.total_paid == 0,
            ErrorCode::AlreadyWithdrawn
        );
        require!(
            client_rating >= 1 && client_rating <= 5,
            ErrorCode::InvalidRating
        );
        
        // Calculate reputation points for client
        let reputation_points = (client_rating as u64) * 5;
        
        // Transfer funds from escrow to freelancer
        let escrow_lamports = ctx.accounts.escrow.lamports();
        **ctx.accounts.escrow.try_borrow_mut_lamports()? -= escrow_lamports;
        **ctx.accounts.freelancer.try_borrow_mut_lamports()? += escrow_lamports;
        
        // Update client reputation
        client_user.reputation = client_user
            .reputation
            .checked_add(reputation_points)
            .unwrap();
        
        // Update freelancer earnings
        freelancer_user.total_earnings = freelancer_user
            .total_earnings
            .checked_add(job.budget)
            .unwrap();
        
        // Mark as paid
        
        job.total_paid = job.budget;
        job.escrow = Pubkey::default();
        job.updated_at = Clock::get()?.unix_timestamp;
        
        msg!(
            "Freelancer withdrew {} lamports from escrow. Client rated {} stars (+{} reputation)",
            escrow_lamports,
            client_rating,
            reputation_points
        );
        
        Ok(())
    }
    pub fn delete_job(
        ctx: Context<DeleteJob>,
        _job_id: u64,
    ) -> Result<()> {
        let job = &ctx.accounts.job;
        
       
        require!(
            job.status == JobStatus::Completed,
            ErrorCode::JobNotCompleted
        );
        require!(
            job.total_paid == job.budget,
            ErrorCode::PaymentNotCompleted
        );
        require!(
            job.client == ctx.accounts.authority.key(),
            ErrorCode::NotJobClient
        );
        
        msg!(
            "Job '{}' (ID: {}) deleted successfully. Rent refunded to client.",
            job.title,
            job.job_id
        );
        
        Ok(())
    }

}
