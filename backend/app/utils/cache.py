import time
import threading
from typing import Any, Optional, Dict, Tuple

class SimpleTTLCache:
    def __init__(self, default_ttl_seconds: int = 300):
        self.default_ttl = default_ttl_seconds
        self._store: Dict[str, Tuple[Any, float]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key not in self._store:
                return None
            val, expiry = self._store[key]
            if time.time() > expiry:
                del self._store[key]
                return None
            return val

    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        expiry = time.time() + ttl
        with self._lock:
            self._store[key] = (value, expiry)

    def invalidate(self, key_prefix: Optional[str] = None) -> None:
        with self._lock:
            if key_prefix is None:
                self._store.clear()
            else:
                keys_to_del = [k for k in self._store.keys() if k.startswith(key_prefix)]
                for k in keys_to_del:
                    del self._store[k]

ttl_cache = SimpleTTLCache(default_ttl_seconds=300)
