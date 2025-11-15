use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;
#[derive(Accounts)]
#[instruction(name: String)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + User::LEN,
        seeds = [b"user", authority.key().as_ref()],
        bump
    )]
    pub user: Account<'info, User>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateUserInfo<'info> {
    #[account(
        mut,
        seeds = [b"user", authority.key().as_ref()],
        bump,
        constraint = user.authority == authority.key(),
    )]
    pub user: Account<'info, User>,
    
    pub authority: Signer<'info>,
}


#[derive(Accounts)]
pub struct UpdateResumeCtx<'info> {
    #[account(
        mut,
        seeds = [b"user", authority.key().as_ref()],
        bump,
        constraint = user.authority == authority.key(),
    )]
    pub user: Account<'info, User>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CreateJob<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 2950,
        seeds = [b"job", job_counter.count.to_le_bytes().as_ref()],
        bump
    )]
    pub job: Account<'info, Job>,
    
    #[account(
        mut,
        seeds = [b"job_counter"],
        bump
    )]
    pub job_counter: Account<'info, JobCounter>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
            mut,
            has_one = authority,
    )]
    pub user: Account<'info, User>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct InitializeJobCounter<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + JobCounter::LEN,
        seeds = [b"job_counter"],
        bump
    )]
    pub job_counter: Account<'info, JobCounter>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(job_id: u64)] 
pub struct AssignJob<'info> {
   #[account(
       mut,
       seeds = [b"job", job.client.as_ref(), &job_id.to_le_bytes()],
       bump,
       constraint = job.status == JobStatus::Open @ ErrorCode::JobNotOpen,
       constraint = job.client == client.key() @ ErrorCode::NotJobClient
   )]
   pub job: Account<'info, Job>,
   #[account(mut)]
   pub client: Signer<'info>,
   /// CHECK: Validated against existing bids in instruction
   pub freelancer: AccountInfo<'info>,
   /// CHECK: Escrow PDA for holding job funds
   pub escrow: AccountInfo<'info>,
   pub system_program: Program<'info, System>,
}
