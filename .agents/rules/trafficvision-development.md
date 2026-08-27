---
trigger: always_on
---

# TrafficVision AI — Development Rules

## Project identity

This is the TrafficVision AI smart traffic prediction and congestion management project.

Repository root:

F:\Softwares\Project\trafficvision-ai-smart-traffic-prediction

The project contains:

- FastAPI backend
- PostgreSQL database
- SQLAlchemy ORM
- JWT authentication
- role-based access control
- ML congestion prediction
- traffic simulator
- React/Vite frontend
- Leaflet/OpenStreetMap traffic map
- Docker Compose deployment

## Primary objective

When given a development task, inspect the existing repository before making changes.

Do not restart the project architecture unnecessarily.

Prefer modifying the existing implementation over replacing working functionality.

Preserve existing working features unless the task explicitly requires changing them.

## Autonomous execution

For substantial implementation tasks:

1. Inspect the relevant files.
2. Identify dependencies between files.
3. Make the required changes.
4. Run appropriate validation commands.
5. Fix errors caused by the changes.
6. Re-run validation.
7. Report exactly what changed and what was verified.

Do not stop merely because an error appears during testing.

If an error is caused by the current implementation and can be safely fixed within the task scope, fix it and continue.

## Before editing

Always inspect the current implementation of files that will be modified.

Do not assume file contents from previous conversations.

Do not overwrite files blindly.

Do not recreate files that already exist unless replacement is necessary.

## ML protection

Never modify, regenerate, retrain, delete, rename, or replace:

backend/app/ml/best_model.pkl
analysis/models/best_model.pkl

unless explicitly instructed.

Do not silently change the trained model's feature names, feature order, preprocessing assumptions, or categorical mappings.

When changing prediction code, verify compatibility with the existing best_model.pkl.

## Dataset protection

Do not modify:

analysis/datasets/

Do not modify notebooks or training artifacts unless explicitly requested.

Training/preprocessing code may be inspected to determine the model contract.

## Docker protection

Do not recreate or unnecessarily modify:

docker-compose.yml
backend/Dockerfile
backend/.dockerignore
frontend/Dockerfile
frontend/.dockerignore
frontend/nginx.conf

Only modify Docker configuration when the current task explicitly requires it or testing proves that a Docker configuration change is necessary.

## Database protection

Do not delete the PostgreSQL database.

Do not drop tables or data unless explicitly instructed.

Do not use destructive database commands as part of routine testing.

Prefer migrations or additive schema changes when appropriate.

## Authentication and security

Do not expose passwords, SECRET_KEY values, database credentials, or tokens.

Never commit .env files.

Use .env.example for documented configuration.

Public registration must not allow users to self-register as administrator.

Administrator/operator account creation must be protected appropriately.

Do not weaken authentication merely to make a frontend request work.

## API compatibility

Before changing an API response:

1. Inspect the backend schema.
2. Inspect the frontend service consuming it.
3. Inspect the frontend components using the response.
4. Update all affected consumers together.

Avoid breaking existing API contracts unnecessarily.

## Frontend compatibility

Preserve the existing React/Vite architecture.

Do not introduce a new frontend framework.

Do not replace Leaflet/OpenStreetMap with Google Maps unless explicitly requested.

Avoid unnecessary dependency additions.

Use existing components and services whenever possible.

## Traffic data

The ML model's trained categorical values and feature mappings are authoritative.

Do not invent new weather/category encodings without checking the training/preprocessing pipeline.

When changing weather or congestion mappings, inspect:

analysis/src/feature_engineering.py
analysis/src/preprocessing.py
backend/app/ml/predictor.py
backend/simulator.py
backend/app/routers/prediction.py

and keep them consistent.

## Simulator

The simulator must remain safe for continuous execution.

Use independent database sessions per iteration where appropriate.

Do not leave long-lived database sessions open unnecessarily.

Do not create duplicate traffic records on every simulator cycle.

## Testing

After backend changes, run appropriate Python validation.

At minimum, when applicable:

python -m compileall backend

After frontend changes:

npm run build

If dependencies or linting are relevant:

npm run lint

When Docker-related changes are made:

docker compose config

and, when appropriate:

docker compose build

Do not claim that something works unless it was actually verified.

## Git safety

Do not execute:

git reset --hard
git clean -fd
git push --force
git branch -D

unless explicitly instructed.

Do not discard user changes.

Before making large modifications, inspect git status.

Prefer small, reviewable changes.

## Scope control

Do not turn a requested fix into a complete rewrite.

Do not introduce unrelated features.

Do not refactor large parts of the project unless required for correctness.

When a task requires many files, make the smallest coherent set of changes needed.

## Completion report

At the end of a task report:

1. Files created.
2. Files modified.
3. Important behavior changes.
4. Tests/commands executed.
5. Test results.
6. Remaining known issues.
7. Any assumptions made.

Never claim tests passed if they were not run.