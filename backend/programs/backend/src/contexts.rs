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
#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct AcceptWork<'info> {
    #[account(
        mut,
        seeds = [b"job", job_id.to_le_bytes().as_ref()],
        bump,
    )]
    pub job: Account<'info, Job>,
    
    #[account(
        mut,
        seeds = [b"user", client.key().as_ref()],
        bump,
        constraint = client_user.authority == client.key()
    )]
    pub client_user: Account<'info, User>,
    
    #[account(
        mut,
        seeds = [b"user", job.freelancer.unwrap().as_ref()],
        bump,
        constraint = freelancer_user.authority == job.freelancer.unwrap()
    )]
    pub freelancer_user: Account<'info, User>,
    
    #[account(mut)]
    pub client: Signer<'info>,
}
#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct WithdrawFromEscrow<'info> {
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
    
    #[account(
        mut,
        seeds = [b"user", job.client.as_ref()],
        bump,
        constraint = client_user.authority == job.client
    )]
    pub client_user: Account<'info, User>,
    
    /// CHECK: Escrow PDA holding job funds
    #[account(
        mut,
        seeds = [b"escrow", job.key().as_ref()],
        bump
    )]
    pub escrow: AccountInfo<'info>,
    #[account(mut)]
    pub freelancer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(job_id: u64)]
pub struct DeleteJob<'info> {
    #[account(
        mut,
        seeds = [b"job", job_id.to_le_bytes().as_ref()],
        bump,
        close = authority
    )]
    pub job: Account<'info, Job>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}
 #[derive(Accounts)]
 #[instruction(job_id: u64)]
 pub struct RaiseDispute<'info> {
    #[account(
            mut,
            seeds = [b"job", job_id.to_le_bytes().as_ref()],
            bump,
        )]
    pub job: Account<'info, Job>,
    
    #[account(
        mut,
        seeds = [b"user", authority.key().as_ref()],
        bump,
        constraint = raiser_user.authority == authority.key()
    )]
    pub raiser_user: Account<'info, User>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    
 }
 #[derive(Accounts)]
 #[instruction(job_id: u64)]
 pub struct VoteDispute<'info> {
     #[account(
         mut,
         seeds = [b"job", job_id.to_le_bytes().as_ref()],
         bump,
     )]
     pub job: Account<'info, Job>,
 
     /// The voter's user account PDA (must correspond to voter)
     #[account(mut)]
     pub voter_user: Account<'info, User>,
 
     #[account(mut)]
     pub voter: Signer<'info>,
 }
 #[derive(Accounts)]
 pub struct FinalizeDispute<'info> {
     #[account(mut)]
     pub job: Account<'info, Job>,
 
     /// CHECK: Escrow PDA, validated by seeds
     #[account(
         mut,
         seeds = [b"escrow", job.key().as_ref()],
         bump
     )]
     pub escrow: AccountInfo<'info>,
 
     /// Raiser (creator) wallet
     /// CHECK: only need lamport transfer dest
     #[account(mut)]
     pub raiser: AccountInfo<'info>,
 
     /// Against (freelancer) wallet
     /// CHECK: only need lamport transfer dest
     #[account(mut)]
     pub against: AccountInfo<'info>,
 
     #[account(mut)]
     pub raiser_user: Account<'info, User>,
 
     #[account(mut)]
     pub against_user: Account<'info, User>,
 
     pub system_program: Program<'info, System>,
 }
