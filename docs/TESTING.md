# Testing and QA

## Scope

This document records testing for the current TrafficVision AI implementation. It does not include R&D experiments, unverified manual checks, or assumed results. The repository currently has no `backend/tests/` directory, pytest configuration, or committed automated test files.

## Test strategy

| Category | Current coverage | Notes |
| --- | --- | --- |
| Functional and API | Manual/API verification required | FastAPI routes are implemented; no automated API tests are committed. |
| UI and responsive | Not tested | React pages are present; no component, browser, or responsive test suite is committed. |
| Database and integration | Not tested | PostgreSQL is optional locally; authentication falls back to in-memory demo accounts when unavailable. |
| End-to-end and regression | Not tested | No E2E or regression framework is configured. |
| Performance, security, usability | Not tested | No benchmark, security scanner, or usability-study evidence is committed. |

## Relevant test cases

| Test Case ID | Module | Scenario | Preconditions | Test Steps | Test Data | Expected Result | Actual Result | Status | Severity | Priority | Comments |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AUTH-01 | Authentication | Valid login | Backend running; a configured demo or database user exists | `POST /auth/login` | Valid email and password | Success response includes email and role | Not recorded | Not Tested | High | P1 | Login also attempts optional alert email. |
| AUTH-02 | Authentication | Invalid login | Backend running | `POST /auth/login` | Invalid credentials | Failed response, without role | Not recorded | Not Tested | High | P1 | No JWT endpoint is implemented. |
| AUTH-03 | Authentication | Signup | Backend running | `POST /auth/signup` | New email, password, role | Account-created response or duplicate-account failure | Not recorded | Not Tested | High | P1 | Uses PostgreSQL when available, otherwise process-local memory. |
| TRAFFIC-01 | Traffic | Retrieve records and statistics | Backend running; CSV datasets available | `GET /traffic/`, `GET /traffic/statistics` | No body | Dataset-derived response | Not recorded | Not Tested | High | P1 | Also review `/traffic/search`, areas, roads, map, and prediction options. |
| PRED-01 | Prediction | Predict congestion | Model file and processed dataset available | `POST /predict` | Complete `TrafficPredictionRequest` payload | Prediction, confidence, and recommendation returned | Not recorded | Not Tested | High | P1 | Input must match the backend model schema. |
| ROUTE-01 | Routes | Recommend a route | Backend running; OSRM reachable | `POST /route/recommend` | Source/destination area and road, vehicle type | Recommended and alternate route data | Not recorded | Not Tested | Medium | P1 | External OSRM availability can affect execution. |
| OPS-01 | Alerts/analytics | Retrieve operational views | Backend running; processed dataset available | `GET /alerts`, `/analytics`, `/heatmap`, `/ai/recommendations` | No body | Dataset-derived responses | Not recorded | Not Tested | Medium | P2 | Recommendations are deterministic rules, not a second ML model. |
| REPORT-01 | Reports | Generate summary | Backend running; processed dataset available | `GET /reports?period=daily` | Valid period | Dataset-derived report response | Not recorded | Not Tested | Medium | P2 | UI offers browser-side PDF/CSV export. |
| LOC-01 | Locations | Retrieve location filters | Backend running | `GET /locations/countries` and dependent endpoints | Valid path parameters | Dataset-derived values or fallbacks | Not recorded | Low | P2 | Location fallback behavior should be checked against both datasets. |

## Execution record

The repository-cleanup pass should record only commands actually run and their results below.

| Check | Result |
| --- | --- |
| Python syntax validation | Passed: 38 Python files parsed with `ast.parse`. Runtime imports require unavailable dependencies. |
| Backend API smoke check | Not Tested: FastAPI is not installed in the available Python environment; the dependency download could not reach PyPI. |
| Pytest | Not Tested: no pytest configuration or committed test files found. |
| Frontend lint | Passed: `npm run lint` completed with no errors after cleanup. |
| Frontend production build | Passed: `npm run build` completed successfully. Vite reported a large-chunk warning only. |

## Optional email alerts

Login-triggered email alerts are optional. Delivery depends on local SMTP configuration in an untracked `backend/.env`. No successful delivery result is recorded here.

## Known QA limitations

- No committed automated test suite, coverage configuration, or recorded test execution exists.
- Route recommendations depend on external OSRM and geocoding services.
- The current frontend guards pages by `localStorage`; the backend does not provide JWT authentication or server-enforced role authorization.
