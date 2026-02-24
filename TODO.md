# Some refactors

- [✅] Validation middleware : merge three different schema validation middleware into one

- [✅] Fix typo in error classes and messages
- [✅] Remove Non-null assertions and add proper validations
- [✅] Add JSDoc style comments where necessary
- [✅] Extract DB logic into repository

# Security Related

- [] Rate limiting
- [] Header security (Helmet lib)
- [✅] CORS config.
- [✅] DB Indexing
- [] Cache\*

# Module wise features for upcoming version or versions

## Users module

- [✅] Users review history(done)
- [✅] Delete Account
- [✅] Password reset & Email varification 

## Resource Module

- [✅] cache and refresh YT data
- [✅] one new columns for Instructor name(done)
- [✅] Custom description support(done)
- [ ] Resource suggestions from users\*
- [ ] Watch later/bookmarks support\*
- [ ] Trending resource based on rating and review

## Reviews module

- [✅] Like review\*
- [✅] Reply to review\*
- [ ] Report review\*
- [ ] Badges (e.g. Top review, verified review .etc)\*

## Search and discovery

- [ ] Full Text Search (utilize postgresql's full text search)
- [ ] Filter by tags (resources)
- [✅] Recomendations\*

_Here \* means I havent yet made proper decision about implementaions._

_Last Updated: January 17, 2026_
