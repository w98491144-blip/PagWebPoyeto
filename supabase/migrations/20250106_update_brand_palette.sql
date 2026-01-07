-- Update brand palette to green/red/cream.
-- Safe for existing data: updates latest row, inserts if empty.
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
        top_bar_bg = '#D82739',
        top_bar_text_color = '#F4EADC',
        header_bg = '#60933a',
        header_text_color = '#F4EADC',
        page_bg = '#F4EADC',
        accent_color = '#D82739',
        accent_text_color = '#F4EADC',
        pill_bg = '#F4EADC',
        pill_text_color = '#2f2417',
        pill_active_bg = '#D82739',
        pill_active_text_color = '#F4EADC',
        footer_bg = '#60933a',
        footer_text_color = '#F4EADC'
      where id in (select id from latest)
      returning id
    )
    insert into public.site_settings (
      top_bar_bg,
      top_bar_text_color,
      header_bg,
      header_text_color,
      page_bg,
      accent_color,
      accent_text_color,
      pill_bg,
      pill_text_color,
      pill_active_bg,
      pill_active_text_color,
      footer_bg,
      footer_text_color
    )
    select
      '#D82739',
      '#F4EADC',
      '#60933a',
      '#F4EADC',
      '#F4EADC',
      '#D82739',
      '#F4EADC',
      '#F4EADC',
      '#2f2417',
      '#D82739',
      '#F4EADC',
      '#60933a',
      '#F4EADC'
    where not exists (select 1 from updated);
  end if;
end $$;
