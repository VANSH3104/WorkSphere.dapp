use anchor_lang::prelude::*;

declare_id!("DuCPxi74kZ5FiF1koqBCXNZbW1uNGfioEnJdb6syKcB8");

#[program]
pub mod backend {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
