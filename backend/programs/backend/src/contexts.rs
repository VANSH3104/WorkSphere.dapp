use anchor_lang::prelude::*;
use crate::state::*;

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
    #[account(mut)]
    pub user: Account<'info, User>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateResumeCtx<'info> {
    #[account(mut)]
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