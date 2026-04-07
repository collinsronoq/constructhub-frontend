## ConstructHub AI Calibration Notes

The runtime path is Ollama-first and model selection is env-driven.

### Model switching
Set `OLLAMA_MODEL` in `backend/.env`:

```env
OLLAMA_MODEL=qwen2.5:3b
```

Recommended trial models:
- `qwen2.5:3b` for speed/quality balance
- `llama3.2:3b` as an alternate lightweight dialogue model
- `qwen2.5:1.5b` as fastest low-resource fallback

### Output token caps
Use these env vars for latency tuning:

```env
OLLAMA_NUM_PREDICT=192
AI_GROUNDED_NUM_PREDICT=160
AI_STREAM_NUM_PREDICT=192
```

- `OLLAMA_NUM_PREDICT` is the provider default.
- `AI_GROUNDED_NUM_PREDICT` is used for grounded/tool protocol turns.
- `AI_STREAM_NUM_PREDICT` is used for stream-text turns.

### History window controls

```env
AI_MAX_HISTORY_MESSAGES=12
AI_MAX_GROUNDED_HISTORY_MESSAGES=6
```

- Grounded turns use a tighter history window to reduce prompt cost.
