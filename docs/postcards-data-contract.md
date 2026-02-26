# Postcards Data Contract

Defines required fields and loader expectations for `postcards.html`.

## Lite index (`data/postcards.index-lite.json`)

Required top-level:
- `generated_at`
- `count`
- `postcards` (array)

Required postcard fields (minimum):
- `id`
- `title`
- `excerpt`
- `image`
- `submolt`
- `content_type`
- `posted_at`
- `theme_tags` (array, can be empty)
- `source_file` (optional but recommended)

## Full index (`data/postcards.index.json`)

All lite fields plus:
- `full_content` (or equivalent content body used for modal deep-read)

## Loader behavior contract

1. Try lite index first.
2. If lite fails/unavailable, fallback to full index.
3. Modal full text resolution order:
   - card `full_content`
   - fetch `source_file` and read content
   - lookup card by `id` in full index cache
4. If all fail, show graceful fallback text, never blank modal.

## Breaking-change policy

- Any schema change to index files must update:
  - `postcards.html`
  - this data contract
  - `docs/postcards-runtime-troubleshooting.md`
  - `ROADMAP.md` note with migration impact
