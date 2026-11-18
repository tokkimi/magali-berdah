-- Vendyy's : publication programmée par article + bannissement après 3 impayés
-- À coller dans Supabase > SQL Editor > New query, puis "Run".

alter table public.auction_items add column if not exists publish_at timestamptz;

drop policy if exists product_read on public.auction_items;
create policy product_read on public.auction_items for select to anon, authenticated
  using ((status = 'active' and (publish_at is null or publish_at <= now())) or coalesce(((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin', false));

alter table public.profiles add column if not exists payment_incidents integer not null default 0;
alter table public.auction_wins add column if not exists payment_due_at timestamptz default (now() + interval '72 hours');
update public.auction_wins set payment_due_at = created_at + interval '72 hours' where payment_due_at is null;

create or replace function private.register_win_default(p_win_id uuid)
 returns void language plpgsql security definer set search_path to '' as $function$
 declare winning public.auction_wins;
 begin
  update public.auction_wins set status='defaulted' where id=p_win_id and status='awaiting_payment' returning * into winning;
  if winning.id is null then return; end if;
  update public.profiles set payment_incidents=payment_incidents+1, banned = banned or payment_incidents+1>=3 where id=winning.bidder_id;
  update public.auction_items set status='ended' where id=winning.item_id and status='awarded';
 end $function$;

create or replace function private.expire_unpaid_wins()
 returns void language plpgsql security definer set search_path to '' as $function$
 declare w record;
 begin
  for w in select aw.id from public.auction_wins aw
    where aw.status='awaiting_payment' and aw.payment_due_at<=now()
      and not exists(select 1 from public.orders o where o.win_id=aw.id and o.payment_status='pending' and o.reservation_until>now())
  loop perform private.register_win_default(w.id); end loop;
 end $function$;

create or replace function public.admin_declare_win_unpaid(p_win_id uuid)
 returns void language plpgsql security definer set search_path to '' as $function$
 begin
  if not private.is_admin() then raise exception 'Accès administrateur requis.'; end if;
  perform private.register_win_default(p_win_id);
 end $function$;
revoke all on function public.admin_declare_win_unpaid(uuid) from public, anon;
grant execute on function public.admin_declare_win_unpaid(uuid) to authenticated;

select cron.schedule('vendyys-unpaid-wins', '7 * * * *', 'select private.expire_unpaid_wins();');

CREATE OR REPLACE FUNCTION private.place_bid(p_item_id text, p_amount numeric)
 RETURNS SETOF auction_bids LANGUAGE plpgsql SECURITY DEFINER SET search_path TO ''
AS $function$
 declare item public.auction_items; actor uuid=auth.uid(); result public.auction_bids;
 begin
 if actor is null or not exists(select 1 from auth.users u join public.profiles p on p.id=u.id where u.id=actor and u.email_confirmed_at is not null and not p.banned) then raise exception 'Connectez-vous avec un compte confirmé pour enchérir.'; end if;
 if not private.is_admin() and not exists(select 1 from public.profiles p where p.id=actor and p.card_ready and p.stripe_payment_method is not null) then raise exception 'Enregistrez votre carte bancaire pour enchérir.'; end if;
 select * into item from public.auction_items where id=p_item_id for update;
 if not found or item.status<>'active' or (item.publish_at is not null and item.publish_at>now() and not private.is_admin()) or (item.is_test and not private.is_admin()) or not item.auction_enabled or item.auction_end_time<=now() or not private.sale_window(p_item_id) then raise exception 'Cette enchère est fermée ou indisponible.'; end if;
 if p_amount is null or p_amount<>trunc(p_amount) or p_amount<coalesce(item.current_bid+1,item.auction_start_price) or p_amount>1000000 then raise exception 'Montant d’enchère invalide ou offre dépassée. Actualisez et réessayez.'; end if;
 insert into public.auction_bids(item_id,bidder_id,amount) values(p_item_id,actor,p_amount) returning * into result;
 update public.auction_items set current_bid=p_amount where id=p_item_id;
 return next result; end $function$;

CREATE OR REPLACE FUNCTION public.reserve_checkout(p_item_id text, p_email text, p_method text, p_buyer_id uuid, p_fingerprint text, p_win_id uuid DEFAULT NULL::uuid, p_test boolean DEFAULT true)
 RETURNS jsonb LANGUAGE plpgsql SET search_path TO ''
AS $function$
declare item public.auction_items; purchase public.orders; winning public.auction_wins; price numeric;
begin
 if p_email is null or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' or length(p_email)>254 or p_method not in ('card','paypal','alma') or length(p_fingerprint)<20 then raise exception 'Informations invalides';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_fingerprint,0));
 select * into item from public.auction_items where id=p_item_id for update;
 if not found then raise exception 'Article indisponible';end if;
 if item.is_test<>p_test then raise exception 'Environnement de paiement incompatible avec cet article';end if;
 select * into purchase from public.orders where item_id=p_item_id and payment_status='pending' for update;
 if purchase.id is not null then
  if purchase.buyer_email=lower(p_email) and purchase.method=p_method and purchase.client_fingerprint=p_fingerprint then return to_jsonb(purchase);end if;
  raise exception 'Ce sac est déjà réservé pendant un paiement en cours.';
 end if;
 if (select count(*) from public.orders where created_at>now()-interval '10 minutes' and (client_fingerprint=p_fingerprint or buyer_email=lower(p_email)))>=3 then raise exception 'Trop de tentatives. Réessayez plus tard.';end if;
 if p_win_id is not null then
  select * into winning from public.auction_wins where id=p_win_id and item_id=p_item_id and bidder_id=p_buyer_id and status='awaiting_payment' for update;
  if winning.id is null or item.status<>'awarded' then raise exception 'Enchère remportée indisponible';end if;
  price=winning.amount;
 else
  if item.status<>'active' or (item.publish_at is not null and item.publish_at>now()) or item.fixed_price is null or not private.sale_window(p_item_id) or (item.auction_enabled and item.auction_end_time<=now()) then raise exception 'Ce sac n’est pas disponible à l’achat immédiat.';end if;
  price=item.fixed_price;
 end if;
 insert into public.orders(item_id,item_title,buyer_id,buyer_email,amount,method,win_id,client_fingerprint,reservation_until,test_mode)
 values(item.id,item.title,p_buyer_id,lower(p_email),price,p_method,p_win_id,p_fingerprint,now()+interval '31 minutes',p_test) returning * into purchase;
 update public.auction_items set status='reserved' where id=item.id;
 return to_jsonb(purchase);
end $function$;

-- Nettoyage : supprime le compte de test créé pendant les vérifications
delete from public.profiles where email='test-carte-claude@vendyys.com';
delete from auth.identities where user_id in (select id from auth.users where email='test-carte-claude@vendyys.com');
delete from auth.users where email='test-carte-claude@vendyys.com';
