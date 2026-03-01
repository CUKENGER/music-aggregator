DOCKER_COMPOSE_PROD=docker/docker-compose.production.yml
DOCKER_COMPOSE_DEV=docker/docker-compose.development.yml

up_dev:
	cp docker/.env.template.dev .env
	cp docker/.env.template.dev docker/.env
	@docker compose -f $(DOCKER_COMPOSE_DEV) up -d --no-deps --build

stop_dev:
	@docker compose -f $(DOCKER_COMPOSE_DEV) stop

down_dev:
	@docker compose -f $(DOCKER_COMPOSE_DEV) down

restart_dev:
	@sudo docker compose -f $(DOCKER_COMPOSE_DEV) restart

logs_dev_api:
	@docker compose -f $(DOCKER_COMPOSE_DEV) logs -f app-api

logs_dev_worker:
	@docker compose -f $(DOCKER_COMPOSE_DEV) logs -f app-worker

up:
	docker compose -f $(DOCKER_COMPOSE_PROD) up -d --build

down:
	docker compose -f $(DOCKER_COMPOSE_PROD) down

restart:
	docker compose -f $(DOCKER_COMPOSE_PROD) down
	docker compose -f $(DOCKER_COMPOSE_PROD) up -d --build

logs:
	docker compose -f $(DOCKER_COMPOSE_PROD) logs -f

ps:
	docker compose -f $(DOCKER_COMPOSE_PROD) ps

api-logs:
	docker compose -f $(DOCKER_COMPOSE_PROD) logs -f app-api

worker-logs:
	docker compose -f $(DOCKER_COMPOSE_PROD) logs -f app-worker

postgres-logs:
	docker compose -f $(DOCKER_COMPOSE_PROD) logs -f postgres

redis-logs:
	docker compose -f $(DOCKER_COMPOSE_PROD) logs -f redis

shell-api:
	docker exec -it music_ag_app_api sh

shell-worker:
	docker exec -it music_ag_app_worker sh

shell-postgres:
	docker exec -it music-ag-postgres psql -U postgres -d music_ag_db

prisma-generate:
	npx prisma generate

prisma-push:
	npx prisma db push

prisma-studio:
	npx prisma studio
