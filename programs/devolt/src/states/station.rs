use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace, Debug)]
pub struct Station {
    pub owner: Pubkey,
    #[max_len(36)]
    pub id: String,
    pub latitude: f64,
    pub longitude: f64,
    pub capacity: f64,
    pub available: f64,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(init, space = 8 + Station::INIT_SPACE, payer = owner)]
    pub devolt: Account<'info, Station>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: String, latitude: Option<f64>, longitude: Option<f64>, capacity: Option<f64>, available: f64)]
pub struct BatteryReport<'info> {
    #[account(
        init_if_needed,
        seeds = [id.as_bytes(), owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + Station::INIT_SPACE,
    )]
    pub station: Account<'info, Station>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}