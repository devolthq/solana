use anchor_lang::prelude::*;

use crate::{errors, BatteryReport};

pub fn battery_report(
    ctx: Context<BatteryReport>,
    id: String,
    latitude: Option<f64>,
    longitude: Option<f64>,
    capacity: Option<u64>,
    available: u64,
) -> Result<()> {
    let station: &mut Account<crate::Station> = &mut ctx.accounts.station;
if station.id != id {
        msg!("Creating new station with ID: {}", id);

        if latitude.is_none() || longitude.is_none() || capacity.is_none() {
            msg!("Invalid input: latitude, longitude, and capacity must be provided");
            return err!(errors::DevoltError::InvalidInput);
        }
        station.owner = *ctx.accounts.owner.key;
        station.id = id.clone();
        station.latitude = latitude.unwrap();
        station.longitude = longitude.unwrap();
        station.capacity = capacity.unwrap();

        msg!("Station created with latitude: {}, longitude: {}, and capacity: {}", station.latitude, station.longitude, station.capacity);
    }

    msg!(
        "Reporting battery at station with ID: {}\nNew availability: {}",
        id,
        available
    );

    station.available = available;

    Ok(())
}
