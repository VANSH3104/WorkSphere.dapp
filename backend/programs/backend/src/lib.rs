use anchor_lang::prelude::*;
pub mod state;
pub mod contexts;
pub mod error;

use state::*;
use contexts::*;
use error::ErrorCode;

declare_id!("9Vx28qdjzSWZfNJRDUmFtnAh9SWxCPnepAVKTEY1Lii4");


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
        
        require!(user.authority == ctx.accounts.authority.key(), ErrorCode::AuthorityMismatch);
        Ok(())
    }

    pub fn update_user_info(
        ctx: Context<UpdateUserInfo>,
        new_name: Option<String>,
        new_is_client: Option<bool>,
        new_is_freelancer: Option<bool>,
    ) -> Result<()> {
        let user = &mut ctx.accounts.user;

        // Authority check
        require!(user.authority == ctx.accounts.authority.key(), ErrorCode::AuthorityMismatch);

        // Update only provided fields
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
    pub fn update_resume(
        ctx: Context<UpdateResumeCtx>,
        new_resume: Resume,  // This should match your frontend structure
    ) -> Result<()> {
        let user = &mut ctx.accounts.user;
    
        // Authority check
        require!(user.authority == ctx.accounts.authority.key(), ErrorCode::AuthorityMismatch);
    
        // Simply replace the entire resume - this avoids complex merging logic
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
        milestones: Vec<Milestone>,
    ) -> Result<()> {
        
        let job = &mut ctx.accounts.job;
        let now = &Clock::get()?.unix_timestamp;
        job.authority = ctx.accounts.authority.key();
        job.freelancer = None;
        job.bidders = Vec::new();
        job.client = ctx.accounts.authority.key();
        job.title = title;
        job.description = description;
        job.budget = budget;
        job.deadline = deadline;
        job.status = JobStatus::Open;
        job.created_at = *now;
        job.updated_at = *now;
        job.milestones = milestones;
        job.dispute = None;
        require!(job.authority == ctx.accounts.authority.key(), ErrorCode::AuthorityMismatch);

        Ok(())
    }
}
