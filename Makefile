.PHONY: build run stop remove

# Build the Docker images using docker-compose
build:
	@echo "Building the Docker images with docker-compose..."
	docker-compose build

# Run the Docker containers using docker-compose
up:
	@echo "Starting the Docker containers with docker-compose..."
	docker-compose up -d

# Stop the Docker containers using docker-compose
stop:
	@echo "Stopping the Docker containers with docker-compose..."
	docker-compose stop

# Remove the Docker containers using docker-compose
down: 
	@echo "Stopping the Docker containers with docker-compose..."
	docker-compose rm -f