-- Set top bar to green, header to beige, and buttons/accent to green.
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
        top_bar_bg = '#60933a',
        top_bar_text_color = '#F4EADC',
        header_bg = '#F4EADC',
        header_text_color = '#D82739',
        accent_color = '#60933a',
        accent_text_color = '#F4EADC',
        pill_active_bg = '#60933a',
        pill_active_text_color = '#F4EADC'
      where id in (select id from latest)
      returning id
    )
    insert into public.site_settings (
      top_bar_bg,
      top_bar_text_color,
      header_bg,
      header_text_color,
      accent_color,
      accent_text_color,
      pill_active_bg,
      pill_active_text_color
    )
    select
      '#60933a',
      '#F4EADC',
      '#F4EADC',
      '#D82739',
      '#60933a',
      '#F4EADC',
      '#60933a',
      '#F4EADC'
    where not exists (select 1 from updated);
  end if;
end $$;
