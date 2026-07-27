from pathlib import Path
import json

_CONFIG_PATH = Path(__file__).resolve().parent / "company_prompts.json"


def load_company_prompts():
    if not _CONFIG_PATH.exists():
        return {}
    with _CONFIG_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def get_company_prompt(company_name: str | None, default_template: str) -> str:
    company_key = (company_name or "").strip().lower()
    prompts = load_company_prompts()
    if company_key in prompts:
        return prompts[company_key]["prompt_template"]
    return default_template
