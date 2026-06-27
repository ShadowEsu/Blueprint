/** Calls Blueprint agent API (Featherless + Supabase). Offline keyword fallback when API is down. */
(function () {
  function agentUrl() {
    const h = location.hostname;
    if (h === "localhost" || h === "127.0.0.1") return "http://127.0.0.1:8000/";
    return "/api/agent";
  }

  function offlineFallback(message) {
    const q = String(message || "").toLowerCase();
    const actions = [];

    const colorMatch =
      q.match(/(?:paint|color|colour|make it|turn it)\s+(?:to\s+)?([a-z0-9#\s-]+)/) ||
      q.match(
        /\b(red|blue|green|black|white|grey|gray|yellow|orange|purple|silver|gold|pink|nardo grey|nardo gray|guards red|racing green|blueprint blue)\b/
      );
    if (colorMatch) {
      const color = colorMatch[1].trim();
      actions.push({ tool: "set_paint", args: { color } });
      return { speech: `Painting it ${color}.`, actions, data: {} };
    }
    if (/reset|put back|reassemble|together again|undo/.test(q)) {
      actions.push({ tool: "reset_view", args: {} });
      return { speech: "View reset.", actions, data: {} };
    }
    if (/explode|take apart|disassemble|pull apart|tear down/.test(q)) {
      actions.push({ tool: "explode", args: { target: "whole_car" } });
      return { speech: "Exploding the view.", actions, data: {} };
    }
    if (/isolate/.test(q)) {
      const target = /engine/.test(q)
        ? "engine"
        : /wheel|tire|tyre/.test(q)
          ? "wheels"
          : /wing|spoiler/.test(q)
            ? "rear_wing"
            : "body";
      actions.push({ tool: "isolate", args: { target } });
      return { speech: `Isolating the ${target.replace("_", " ")}.`, actions, data: {} };
    }
    if (/engine|motor/.test(q)) {
      actions.push({ tool: "focus_camera", args: { target: "engine" } });
      actions.push({ tool: "highlight", args: { target: "engine" } });
      return { speech: "Framing the engine.", actions, data: {} };
    }
    if (/wheel|tire|tyre|brake/.test(q)) {
      actions.push({ tool: "focus_camera", args: { target: "wheels" } });
      return { speech: "Showing the wheels.", actions, data: {} };
    }
    if (/wing|spoiler|aero/.test(q)) {
      actions.push({ tool: "focus_camera", args: { target: "rear_wing" } });
      return { speech: "Showing the wing.", actions, data: {} };
    }
    if (/hood|bonnet/.test(q)) {
      actions.push({ tool: "focus_camera", args: { target: "body" } });
      return { speech: "Showing the hood area.", actions, data: {} };
    }
    if (/show|focus|highlight|select/.test(q)) {
      actions.push({ tool: "focus_camera", args: { target: "whole_car" } });
      return { speech: "Resetting the camera.", actions, data: {} };
    }

    return {
      speech:
        'Try "paint it red", "show the engine", "explode the car", or "reset view". For full AI locally run npm run dev:agent.',
      actions: [],
      data: {},
    };
  }

  async function ask(message, context, history) {
    const hist = Array.isArray(history) ? history : [];
    const body = {
      message,
      context: context || {},
      history: hist.slice(-10),
    };

    try {
      const res = await fetch(agentUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.detail || "Agent request failed");
      hist.push({ role: "user", content: message });
      if (data.speech) hist.push({ role: "assistant", content: data.speech });
      return {
        speech: data.speech || "Done.",
        actions: data.actions || [],
        data: data.data || {},
      };
    } catch (err) {
      console.warn("[BlueprintAgent]", err.message, "— using offline fallback");
      const fb = offlineFallback(message);
      hist.push({ role: "user", content: message });
      if (fb.speech) hist.push({ role: "assistant", content: fb.speech });
      return fb;
    }
  }

  window.BlueprintAgent = { ask, agentUrl };
})();
