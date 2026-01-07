-- Set footer background to red with light text.
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'site_settings'
  ) then
    with latest as (
      select id
      from public.site_settings
      order by updated_at desc nulls last
      limit 1
    ),
    updated as (
      update public.site_settings
      set
        footer_bg = '#D82739',
        footer_text_color = '#F4EADC'
      where id in (select id from latest)
      returning id
    )
    insert into public.site_settings (footer_bg, footer_text_color)
    select '#D82739', '#F4EADC'
    where not exists (select 1 from updated);
  end if;
end $$;
