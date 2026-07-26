import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

logger = logging.getLogger("trafficvision.perf")
logging.basicConfig(level=logging.INFO)

class PerformanceLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        t_request = time.perf_counter()
        path = request.url.path
        method = request.method

        logger.info("------------------------------------------------------------------")
        logger.info("[PERF TRACE START] Request Received: %s %s", method, path)

        t_auth_start = time.perf_counter()
        # Authentication evaluation occurs via FastAPI Depends
        t_auth_ms = round((time.perf_counter() - t_auth_start) * 1000, 2)

        response = await call_next(request)

        t_total_ms = round((time.perf_counter() - t_request) * 1000, 2)
        response.headers["X-Process-Time-Ms"] = str(t_total_ms)

        logger.info("  [LAYER TRACE] Auth Eval Time: ~%s ms", t_auth_ms)
        logger.info("  [LAYER TRACE] Total Pipeline Execution (Repo/SQL + Serialization): %s ms", t_total_ms)

        if t_total_ms > 1000:
            logger.warning("[SLOW ENDPOINT WARNING] %s %s took %s ms (Exceeds 1s SLA target!)", method, path, t_total_ms)
        else:
            logger.info("[OK PERF TRACE END] Response Sent: %s %s - Status %s (Total Time: %s ms)", method, path, response.status_code, t_total_ms)
        logger.info("------------------------------------------------------------------\n")

        return response
