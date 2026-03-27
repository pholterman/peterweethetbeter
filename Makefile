include .env.local
export

.PHONY: migrate migrate-local dev build

# Run database migration on production
# Usage: make migrate
migrate:
	curl -X POST https://peterweethetbeter.vercel.app/api/migrate -H 'Authorization: Bearer $(ADMIN_PASSWORD)'

# Run database migration locally
# Usage: make migrate-local
migrate-local:
	curl -X POST http://localhost:3001/api/migrate -H 'Authorization: Bearer $(ADMIN_PASSWORD)'

# Run dev server on port 3001
dev:
	npm run dev -- -p 3001

# Build the project
build:
	npm run build
