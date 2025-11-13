use anchor_lang::prelude::*;
use crate::state::*;
use crate::error::ErrorCode;
use anchor_spl::token::{self, Token, TokenAccount};

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
#[instruction(title: String)]
pub struct CreateJob<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Job::LEN,
        seeds = [b"job", authority.key().as_ref(), title.as_bytes()],
        bump
    )]
    pub job: Account<'info, Job>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AssignJob<'info> {
   #[account(
       mut,
       seeds = [b"job", job.client.as_ref(), job.title.as_bytes()],
       bump,
       constraint = job.status == JobStatus::Open @ ErrorCode::JobNotOpen,
       constraint = job.client == client.key() @ ErrorCode::NotJobClient
   )]
   pub job: Account<'info, Job>,
   #[account(mut)]
   pub client: Signer<'info>,
   pub freelancer: AccountInfo<'info>,
   pub escrow: AccountInfo<'info>,
   pub system_program: Program<'info, System>,
}
