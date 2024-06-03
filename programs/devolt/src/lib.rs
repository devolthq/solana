use anchor_lang::prelude::*;

pub mod instructions;
pub mod states;
pub mod errors;

pub use states::*;

declare_id!("7HhCBpYxGZU4jsYy295T68VWqqRgyLvK17wcrBS6bTVm");

#[program]
pub mod devolt {
    use super::*;

    pub fn battery_report(
        ctx: Context<BatteryReport>,
        id: String,
        latitude: Option<f64>,
        longitude: Option<f64>,
        capacity: Option<f64>,
        available: f64,
    ) -> Result<()> {
        msg!("Reporting battery at station with ID: {}\nNew availability: {}", id, available);

        require!(id != "" || available != 0.0, errors::DevoltError::InvalidInput);

        instructions::battery_report::battery_report(ctx, id, latitude, longitude, capacity, available)
    }
}
