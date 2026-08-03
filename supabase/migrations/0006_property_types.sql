-- Superseded by 0007_market_model.sql, which replaced this constraint with the
-- full Nigerian property-type vocabulary (Detached Duplex, Terraced Duplex and
-- so on). Kept as a no-op so the migration sequence stays stable and re-runnable
-- — re-applying the old, narrower list would now reject existing rows.

select 1;
