-- Set top bar to beige background with red text.
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
        top_bar_bg = '#F4EADC',
        top_bar_text_color = '#D82739'
      where id in (select id from latest)
      returning id
    )
    insert into public.site_settings (top_bar_bg, top_bar_text_color)
    select '#F4EADC', '#D82739'
    where not exists (select 1 from updated);
  end if;
end $$;
