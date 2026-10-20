---
name: Orval 201 response validation
description: A codegen limitation to account for when adding create endpoints with 201 responses.
---

The current Orval Zod generator may emit request-body validation without a named response validator for an operation whose success response is HTTP 201.

**Why:** Assuming a generated response validator exists caused an API typecheck failure even though the OpenAPI response schema and React client response type were generated correctly.

**How to apply:** After adding a 201 operation, inspect the generated Zod exports before importing a response validator. Keep the 201 contract in OpenAPI and use the strongly typed database result directly when no generated validator exists.