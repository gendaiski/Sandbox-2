"""A scripted stand-in for LocalLLM, for testing the interface where no GGUF model can be
downloaded (AFS_FAKE_LLM=1). It reads which of the repository's prompts it was sent and answers
in that prompt's required format, so every page and endpoint can be driven end to end. The UI
labels it as a stand-in; real runs use the model from setup.sh."""

import json
import re


class StandInLLM:
    max_tokens, temperature = 512, 0.2

    def generate(self, prompt: str, temperature=None, stop=None) -> str:
        user = (re.findall(r"(?:User request|User input|Goal|Step to convert|User):\s*(.+)", prompt) or [""])[-1].strip()
        if "atomic execution graph" in prompt:
            return json.dumps({"nodes": [{"id": "1", "action": "research", "depends_on": []},
                                         {"id": "2", "action": "outline", "depends_on": ["1"]},
                                         {"id": "3", "action": "write", "depends_on": ["2"]}]})
        if '"steps"' in prompt:
            return json.dumps({"goal": user, "steps": ["Research the topic", "Draft an outline", "Write the text"]})
        if '"action"' in prompt and '"inputs"' in prompt:
            return json.dumps({"action": "write_text", "inputs": {"topic": user}})
        if "Available tool: calculator" in prompt:
            nums = [float(x) for x in re.findall(r"-?\d+(?:\.\d+)?", user)] or [0, 0]
            op = "multiply" if "*" in user or "times" in user else "divide" if "/" in user else \
                 "subtract" if "-" in user[1:] or "minus" in user else "add"
            return json.dumps({"tool": "calculator", "arguments": {"a": nums[0], "b": nums[-1] if len(nums) > 1 else 0,
                                                                   "operation": op}})
        if '"decision"' in prompt:
            choices = re.findall(r"^- (\S+)$", prompt, re.M)
            pick = next((c for c in choices if c.split("_")[0] in user.lower()), choices[0] if choices else "")
            return json.dumps({"decision": pick})
        if '"reply"' in prompt:
            name = re.search(r"my name is (\w+)", user, re.I)
            remembered = re.search(r"User's name is (\w+)", prompt)
            if name:
                return json.dumps({"reply": f"Nice to meet you, {name.group(1)}!", "save_to_memory": f"User's name is {name.group(1)}"})
            if remembered and "name" in user.lower():
                return json.dumps({"reply": f"Your name is {remembered.group(1)}.", "save_to_memory": None})
            return json.dumps({"reply": f"Noted: {user}", "save_to_memory": user if "favorite" in user.lower() else None})
        if '"action": "action_name"' in prompt:
            steps = int((re.search(r"steps=(\d+)", prompt) or [0, 0])[1])
            return json.dumps({"action": ["analyze", "research", "done"][min(steps, 2)], "reason": f"step {steps + 1}"})
        if "Schema you must follow" in prompt:
            return json.dumps({"topic": user[:40] or "topic", "difficulty": "beginner", "answer": user[:40]})
        return f"(stand-in model) An AI agent is a loop around a model: it reads state, decides, acts. You asked: {user}"
