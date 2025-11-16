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
        space = 8 + 3455,
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
pub struct SubmitProposal<'info> {
    #[account(
        mut,
        seeds = [b"job", job_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub job: Account<'info, Job>,
    
    #[account(
        mut,
        seeds = [b"user", freelancer.key().as_ref()],
        bump,
    )]
    pub user: Account<'info, User>,
    
    #[account(mut)]
    pub freelancer: Signer<'info>,
}
#[derive(Accounts)]
#[instruction(job_id: u64, freelancer: Pubkey, bid_amount: u64)] 
pub struct AssignJob<'info> {
    #[account(
        mut,
        seeds = [b"job", job_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub job: Account<'info, Job>,
    #[account(mut)]
    pub client: Signer<'info>,
    #[account(
        mut,
        seeds = [b"user", client.key().as_ref()],
        bump,
        constraint = client_user.authority == client.key()
    )]
    pub client_user: Account<'info, User>,
    #[account(
        mut,
        seeds = [b"user", freelancer.as_ref()],
        bump,
        constraint = freelancer_user.authority == freelancer
    )]
    pub freelancer_user: Account<'info, User>,
    /// CHECK: Escrow PDA for holding job funds
    #[account(
        mut,
        seeds = [b"escrow", job.key().as_ref()],
        bump
    )]
    pub escrow: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct SubmitWork<'info> {
    #[account(
        mut,
        seeds = [b"job", job_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub job: Account<'info, Job>,
    
    #[account(
        mut,
        seeds = [b"user", freelancer.key().as_ref()],
        bump,
        constraint = freelancer_user.authority == freelancer.key()
    )]
    pub freelancer_user: Account<'info, User>,
    
    #[account(mut)]
    pub freelancer: Signer<'info>,
}
#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct RequestRevision<'info> {
    #[account(
        mut,
        seeds = [b"job", job_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub job: Account<'info, Job>,
    
    #[account(mut)]
    pub client: Signer<'info>,
}