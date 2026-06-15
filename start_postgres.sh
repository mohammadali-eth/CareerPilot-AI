#!/bin/bash
set -e

WORKSPACE_DIR="/media/mohammad-ali/Ali/Clients/CareerPilot AI"
DATA_DIR="$WORKSPACE_DIR/postgres_local"
LOG_FILE="$DATA_DIR/postgres.log"
PORT=5434

if [ ! -d "$DATA_DIR" ]; then
    echo "Initializing user-space PostgreSQL database cluster..."
    /usr/lib/postgresql/16/bin/initdb -D "$DATA_DIR" --auth-local=trust --auth-host=trust
fi

# Check if postgres is already running
if ! /usr/lib/postgresql/16/bin/pg_isready -h 127.0.0.1 -p $PORT >/dev/null 2>&1; then
    echo "Starting PostgreSQL on port $PORT..."
    /usr/lib/postgresql/16/bin/postgres -D "$DATA_DIR" -p $PORT -h 127.0.0.1 -k "$DATA_DIR" > "$LOG_FILE" 2>&1 &
    
    # Wait for postgres to start
    for i in {1..10}; do
        if /usr/lib/postgresql/16/bin/pg_isready -h 127.0.0.1 -p $PORT >/dev/null 2>&1; then
            echo "PostgreSQL started successfully!"
            break
        fi
        sleep 1
    done
else
    echo "PostgreSQL is already running on port $PORT."
fi

# Create role and database if they do not exist
echo "Setting up roles and databases..."
/usr/lib/postgresql/16/bin/psql -h 127.0.0.1 -p $PORT -d postgres -c "CREATE ROLE careerpilot_user WITH LOGIN PASSWORD 'careerpilot_secure_pass_2026' SUPERUSER;" || echo "Role careerpilot_user already exists."
/usr/lib/postgresql/16/bin/psql -h 127.0.0.1 -p $PORT -d postgres -c "CREATE DATABASE careerpilot_dev OWNER careerpilot_user;" || echo "Database careerpilot_dev already exists."

echo "User-space PostgreSQL is ready!"
