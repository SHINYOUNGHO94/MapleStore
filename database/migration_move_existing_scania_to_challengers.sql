-- One-time correction for legacy Maple records.
-- Run this once if old records were defaulted into Scania during the server split,
-- but they actually belong to Challengers.

update public.ledger_entries
set server = 'challengers'
where server = 'scania';

notify pgrst, 'reload schema';
