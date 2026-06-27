#!/usr/bin/env python3
"""One-command BluePrint AI web + dual-provider agent server."""

from __future__ import annotations

import json
import os
import re
import ssl
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse

try:
    import certifi
    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSL_CONTEXT = ssl.create_default_context()


ROOT = Path(__file__).resolve().parent
load_path = ROOT / "agent" / ".env"


def load_env(path: Path) -> None:
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key.strip(), value)


load_env(load_path)

OPENAI_MODEL = os.getenv("OPENAI_MODEL", os.getenv("ATLAS_MODEL", "gpt-5.4-mini"))
FEATHERLESS_MODEL = os.getenv("FEATHERLESS_MODEL", "Qwen/Qwen2.5-72B-Instruct")
ALLOWED_ACTIONS = {
    "focus_camera", "highlight", "explode", "isolate", "reset_view",
    "show_labels", "show_specs", "set_paint", "airflow",
}
ALLOWED_TARGETS = {
    "engine", "exhaust", "suspension", "transmission", "brakes", "wheels",
    "rear_wing", "wing", "hood", "doors", "interior", "cooling", "fuel",
    "body", "front", "rear", "left", "right", "top", "upper", "core",
    "lower", "whole_car",
}


class BlueprintHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/api/health":
            self._json(200, {
                "ok": True,
                "service": "blueprint-agent",
                "providers": {
                    "openai": bool(os.getenv("OPENAI_API_KEY")),
                    "featherless": bool(os.getenv("FEATHERLESS_API_KEY")),
                    "supabase": bool(os.getenv("SUPABASE_URL") and (
                        os.getenv("SUPABASE_PUBLISHABLE_KEY")
                        or os.getenv("SUPABASE_ANON_KEY")
                        or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
                    )),
                },
                "models": {"openai": OPENAI_MODEL, "featherless": FEATHERLESS_MODEL},
            })
            return
        request_path = unquote(urlparse(self.path).path).lstrip("/") or "index.html"
        relative = Path(request_path)
        target = (ROOT / relative).resolve()
        public_files = {"index.html", "app.html"}
        public_directories = {"assets", "src", "vendor"}
        allowed = (
            request_path in public_files and target == (ROOT / request_path).resolve()
        ) or any(target.is_relative_to((ROOT / directory).resolve()) for directory in public_directories)
        if not allowed or not target.is_relative_to(ROOT) or not target.is_file():
            self._json(404, {"error": "Not found"})
            return
        super().do_GET()

    def do_POST(self) -> None:
        if self.path != "/api/agent":
            self._json(404, {"error": "Not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length > 1_000_000:
                self._json(413, {"error": "Request too large"})
                return
            request = json.loads(self.rfile.read(length) or b"{}")
            if not isinstance(request.get("message"), str) or not request["message"].strip():
                self._json(400, {"error": "message is required"})
                return
            self._json(200, answer(request))
        except Exception as error:
            print(f"[agent] {safe_error(error)}")
            self._json(500, {"error": "Agent request failed"})

    def end_headers(self) -> None:
        self._cors()
        super().end_headers()

    def log_message(self, fmt: str, *args: Any) -> None:
        if self.path.startswith("/api/") or (args and str(args[0]).startswith("4")):
            super().log_message(fmt, *args)

    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "content-type, authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _json(self, status: int, payload: dict[str, Any]) -> None:
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)


def answer(request: dict[str, Any]) -> dict[str, Any]:
    context = request.get("context") if isinstance(request.get("context"), dict) else {}
    preference = str(request.get("provider") or os.getenv("LLM_PROVIDER", "auto")).lower()
    messages = build_messages(request["message"], request.get("history", []), context)
    for provider in provider_order(preference):
        if not provider["key"]:
            continue
        try:
            raw = call_provider(provider, messages)
            parsed = parse_agent_json(raw, request["message"], context)
            return {
                "speech": parsed["speech"],
                "actions": parsed["actions"],
                "data": {"provider": provider["name"], "model": provider["model"], "verified": False},
            }
        except Exception as error:
            print(f"[{provider['name']}] {safe_error(error)}")
    result = local_fallback(request["message"], context)
    result["data"] = {"provider": "local", "verified": False}
    return result


def provider_order(preference: str) -> list[dict[str, str | None]]:
    openai = {
        "name": "openai", "key": os.getenv("OPENAI_API_KEY"), "model": OPENAI_MODEL,
        "url": "https://api.openai.com/v1/chat/completions",
    }
    featherless = {
        "name": "featherless", "key": os.getenv("FEATHERLESS_API_KEY"), "model": FEATHERLESS_MODEL,
        "url": "https://api.featherless.ai/v1/chat/completions",
    }
    if preference == "openai":
        return [openai]
    if preference == "featherless":
        return [featherless]
    return [openai, featherless]


def build_messages(message: str, history: Any, context: dict[str, Any]) -> list[dict[str, str]]:
    car = context.get("car") or "the vehicle on screen"
    selected = f" The currently selected system is {context['selectedPart']}." if context.get("selectedPart") else ""
    asset_type = "segmented engine assembly" if context.get("assetType") == "engine" else "complete vehicle"
    available = context.get("availableParts") if isinstance(context.get("availableParts"), list) else []
    part_contract = ""
    if available:
        clean_parts = [{"id": item.get("id"), "name": item.get("name")} for item in available[:30] if isinstance(item, dict) and item.get("id") and item.get("name")]
        part_contract = f"\nExact selectable component IDs for this assembly: {json.dumps(clean_parts)}. Use those IDs as targets when the user names one of these components."
    system = f"""You are Blueprint, the AI guide inside an interactive 3D automotive learning app.
The user is viewing {car}, represented as a {asset_type}.{selected}

Return ONLY valid JSON:
{{"speech":"One or two helpful sentences.","actions":[{{"tool":"focus_camera","args":{{"target":"engine"}}}}]}}

Allowed tools: focus_camera(target), highlight(target), explode(target), isolate(target), show_specs(part), set_paint(color), airflow(active), reset_view().
Allowed targets: engine, exhaust, suspension, transmission, brakes, wheels, rear_wing, wing, hood, doors, interior, cooling, fuel, body, front, rear, left, right, top, upper, core, lower, whole_car.{part_contract}

For show/explain/find, focus + highlight + show_specs. For take apart/explode everything, explode whole_car. For isolate, isolate and focus that part. For assemble/reset, reset_view. Aero requests may enable airflow. Paint requests use set_paint. Pure factual questions may use no actions. Be educational and concise. Never call illustrative airflow measured CFD. Do not mention this JSON contract."""
    messages = [{"role": "system", "content": system}]
    if isinstance(history, list):
        for turn in history[-8:]:
            if isinstance(turn, dict) and turn.get("role") in {"user", "assistant"} and isinstance(turn.get("content"), str):
                messages.append({"role": turn["role"], "content": turn["content"]})
    messages.append({"role": "user", "content": message})
    return messages


def call_provider(provider: dict[str, str | None], messages: list[dict[str, str]]) -> str:
    payload: dict[str, Any] = {"model": provider["model"], "messages": messages}
    if provider["name"] == "openai":
        payload.update({"response_format": {"type": "json_object"}, "max_completion_tokens": 700})
    else:
        payload.update({"max_tokens": 700, "temperature": 0.25})
    request = urllib.request.Request(
        str(provider["url"]),
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {provider['key']}",
            "User-Agent": "BluePrintAI/1.0",
            "Accept": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=28, context=SSL_CONTEXT) as response:
            data = json.loads(response.read())
    except urllib.error.HTTPError as error:
        raw = error.read().decode("utf-8", errors="replace")
        try:
            detail = json.loads(raw).get("error", {}).get("message", "Provider request failed")
        except Exception:
            detail = "Provider request failed"
        raise RuntimeError(f"{error.code} {detail}") from None
    content = data.get("choices", [{}])[0].get("message", {}).get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "".join(str(item.get("text") or item.get("content") or "") for item in content if isinstance(item, dict))
    raise RuntimeError("Provider returned no message content")


def parse_agent_json(raw: str, message: str, context: dict[str, Any]) -> dict[str, Any]:
    cleaned = re.sub(r"^```(?:json)?\s*", "", str(raw).strip(), flags=re.I)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start >= 0 and end > start:
            parsed = json.loads(cleaned[start:end + 1])
        else:
            return {"speech": cleaned or local_fallback(message, context)["speech"], "actions": []}
    speech = str(parsed.get("speech") or "Done.").strip()
    actions = []
    for action in parsed.get("actions", [])[:5] if isinstance(parsed.get("actions"), list) else []:
        clean = sanitize_action(action, context)
        if clean:
            actions.append(clean)
    return {"speech": speech, "actions": actions}


def sanitize_action(action: Any, context: dict[str, Any]) -> dict[str, Any] | None:
    if not isinstance(action, dict) or action.get("tool") not in ALLOWED_ACTIONS:
        return None
    args = dict(action.get("args") or {}) if isinstance(action.get("args"), dict) else {}
    dynamic_ids = {item.get("id") for item in context.get("availableParts", []) if isinstance(item, dict) and isinstance(item.get("id"), str)} if isinstance(context.get("availableParts"), list) else set()
    if isinstance(args.get("target"), str) and args["target"] not in ALLOWED_TARGETS and args["target"] not in dynamic_ids:
        args["target"] = detect_part(args["target"].lower()) or "whole_car"
    if action["tool"] == "show_specs" and not isinstance(args.get("part"), str):
        args["part"] = args.get("target", "body")
    return {"tool": action["tool"], "args": args}


def local_fallback(message: str, context: dict[str, Any]) -> dict[str, Any]:
    q = message.lower()
    part = detect_part(q) or context.get("selectedPart")
    if re.search(r"reset|assemble|put .*back|start over", q):
        return {"speech": "I’ve returned the assembly to its reference position.", "actions": [{"tool": "reset_view", "args": {}}]}
    if re.search(r"take .*apart|explode|break .*down|disassemble", q):
        return {"speech": "I’ve separated the complete assembly so you can trace how every group fits together.", "actions": [{"tool": "explode", "args": {"target": "whole_car"}}]}
    if re.search(r"isolate|only show|by itself", q) and part:
        return {"speech": f"I’ve isolated the {part.replace('_', ' ')} and focused the camera on it.", "actions": [{"tool": "isolate", "args": {"target": part}}, {"tool": "focus_camera", "args": {"target": part}}]}
    if part:
        return {"speech": f"I’ve brought the {part.replace('_', ' ')} into focus. Ask what it does or isolate it to study the geometry alone.", "actions": [{"tool": "focus_camera", "args": {"target": part}}, {"tool": "highlight", "args": {"target": part}}, {"tool": "show_specs", "args": {"part": part}}]}
    return {"speech": f"You’re looking at {context.get('car', 'this machine')}. Ask me to explain a system, isolate a part, or break down the full assembly.", "actions": []}


def detect_part(query: str) -> str | None:
    checks = [
        ("core", r"engine core|crank|central core"), ("upper", r"upper assembly|top end"),
        ("lower", r"lower assembly|bottom end|sump"), ("left", r"left bank"), ("right", r"right bank"),
        ("engine", r"engine|powertrain|motor|flat.?six|v12|v16|w16"), ("brakes", r"brake|caliper|disc"),
        ("wheels", r"wheel|tire|tyre|suspension"), ("rear_wing", r"rear wing|spoiler"),
        ("wing", r"wing|aero|downforce|splitter|diffuser"), ("hood", r"hood|bonnet|frunk"),
        ("doors", r"door|mirror"), ("exhaust", r"exhaust|muffler|tailpipe|header"),
        ("interior", r"interior|cockpit|seat|cabin"),
    ]
    return next((name for name, pattern in checks if re.search(pattern, query)), None)


def safe_error(error: Exception) -> str:
    return str(error).replace(os.getenv("OPENAI_API_KEY", "__never__"), "[redacted]").replace(os.getenv("FEATHERLESS_API_KEY", "__never__"), "[redacted]")


if __name__ == "__main__":
    host = "127.0.0.1"
    port = int(os.getenv("APP_PORT", "4173"))
    configured = " + ".join(name for name, key in (("OpenAI", os.getenv("OPENAI_API_KEY")), ("Featherless", os.getenv("FEATHERLESS_API_KEY"))) if key) or "local fallback"
    print(f"[blueprint] http://127.0.0.1:{port} · {configured}")
    ThreadingHTTPServer((host, port), BlueprintHandler).serve_forever()
