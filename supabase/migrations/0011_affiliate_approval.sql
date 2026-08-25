-- Affiliate applications become subject to admin approval: a
-- pending/approved/rejected status, defaulting new submissions to
-- pending. The admin Affiliates page's New/Approved/Rejected tabs and
-- nav counter badge (new-application count) both key off this.
alter table affiliate_applications add column if not exists status text not null default 'pending';

alter table affiliate_applications drop constraint if exists affiliate_applications_status_check;
alter table affiliate_applications
  add constraint affiliate_applications_status_check
  check (status in ('pending', 'approved', 'rejected'));
