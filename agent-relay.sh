#!/bin/bash
export PATH="/home/linuxbrew/.linuxbrew/bin:$PATH"

MODEL="${1}"
PERSONA="${2}"
EMPLOYEE="${3}"
MESSAGE=$(cat)

PERSONA_CLEAN=$(echo "$PERSONA" | tr -dc '[:alnum:] -')
EMPLOYEE_CLEAN=$(echo "$EMPLOYEE" | tr -dc '[:alnum:] -')

openclaw agent \
  -m "Kamu adalah $EMPLOYEE_CLEAN ($PERSONA_CLEAN) di Autonomous Studio. Balas secara profesional: $MESSAGE" \
  --model "$MODEL" \
  --session-key main \
  --json 2>/dev/null | python3 -c "
import sys, json
data = json.load(sys.stdin)
payloads = data.get('result', {}).get('payloads', [])
for p in payloads:
    text = p.get('text', '')
    if text:
        print(text)
        break
"
