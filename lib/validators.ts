export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const isValidSlug = (value: string) => /^[a-z0-9-]+$/.test(value);

export const isRequired = (value: string | null | undefined) =>
  Boolean(value && value.trim().length > 0);

export const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isPhone = (value: string) => /^[0-9+()\s-]{6,}$/.test(value);
