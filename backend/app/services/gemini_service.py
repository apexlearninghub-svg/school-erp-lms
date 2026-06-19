import os
import json
import requests
import time
from flask import current_app

# Models to try in order of preference (gemini-flash-latest confirmed working)
GEMINI_MODELS = [
    "gemini-flash-latest",
    "gemini-2.5-flash",
    "gemini-pro-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
]

# Max questions per single API call — prevents timeouts
BATCH_SIZE = 25


def _call_gemini_single_batch(api_key, subject, prompt_text, difficulty, count, batch_num=1, total_batches=1):
    """
    Makes ONE Gemini API call for 'count' questions.
    Tries all models in order. Returns a list of question dicts.
    Raises RuntimeError if all models fail.
    """
    system_instructions = (
        "You are an expert school examiner. Generate a list of multiple choice questions (MCQs) "
        "matching the requested subject, instructions, number of questions, and difficulty. "
        "Each question must have exactly 4 options: A, B, C, and D. "
        "Make sure all questions are UNIQUE and do not repeat. "
        "You MUST return the output as a valid JSON array of objects, where each object has exactly "
        "the following keys:\n"
        "- 'question_text': string\n"
        "- 'option_a': string\n"
        "- 'option_b': string\n"
        "- 'option_c': string\n"
        "- 'option_d': string\n"
        "- 'correct_option': string (must be exactly 'A', 'B', 'C', or 'D')\n"
        "- 'explanation': string\n"
        "Do not include any markdown fences or introductory text, only raw valid JSON."
    )

    batch_note = f" (Batch {batch_num} of {total_batches})" if total_batches > 1 else ""
    user_prompt = (
        f"Subject: {subject}\n"
        f"Difficulty: {difficulty}\n"
        f"Total Questions to Generate: {count}{batch_note}\n"
        f"Instructions: {prompt_text}\n"
        "Generate the MCQs now. Return ONLY the JSON array."
    )

    full_prompt = f"{system_instructions}\n\n{user_prompt}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"role": "user", "parts": [{"text": full_prompt}]}],
        "generationConfig": {"responseMimeType": "application/json"}
    }

    last_error = ""
    for model in GEMINI_MODELS:
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent?key={api_key}"
        )
        try:
            current_app.logger.info(f"Batch {batch_num}/{total_batches} — Trying model: {model}")
            response = requests.post(url, headers=headers, json=payload, timeout=90)

            if response.status_code in (429, 503):
                reason = "Quota exceeded" if response.status_code == 429 else "Overloaded"
                last_error = f"{model}: {reason}"
                current_app.logger.warning(f"{model} {reason.lower()}, trying next model...")
                continue

            if response.status_code == 404:
                last_error = f"{model}: Not found"
                current_app.logger.warning(f"{model} not found, trying next model...")
                continue

            if response.status_code != 200:
                last_error = f"{model}: HTTP {response.status_code} - {response.text[:200]}"
                current_app.logger.error(f"Gemini API error on {model}: {response.text[:200]}")
                continue

            response_data = response.json()
            candidates = response_data.get("candidates", [])
            if not candidates:
                last_error = f"{model}: No candidates returned"
                continue

            content = candidates[0].get("content", {})
            parts = content.get("parts", [])
            if not parts:
                last_error = f"{model}: No parts in content"
                continue

            raw_json_text = parts[0].get("text", "").strip()

            # Clean up markdown fences if Gemini added them anyway
            if raw_json_text.startswith("```json"):
                raw_json_text = raw_json_text[7:]
            if raw_json_text.startswith("```"):
                raw_json_text = raw_json_text[3:]
            if raw_json_text.endswith("```"):
                raw_json_text = raw_json_text[:-3]
            raw_json_text = raw_json_text.strip()

            questions_list = json.loads(raw_json_text)
            if isinstance(questions_list, list) and len(questions_list) > 0:
                current_app.logger.info(
                    f"Batch {batch_num}/{total_batches} — Got {len(questions_list)} questions using {model}"
                )
                return questions_list

            last_error = f"{model}: Empty or invalid question list"

        except json.JSONDecodeError as e:
            last_error = f"{model}: JSON parse error - {str(e)}"
            current_app.logger.error(f"JSON decode error from {model}: {str(e)}")
        except requests.Timeout:
            last_error = f"{model}: Request timed out (90s)"
            current_app.logger.error(f"Timeout calling {model}")
            continue
        except Exception as e:
            last_error = f"{model}: {str(e)}"
            current_app.logger.error(f"Exception calling {model}: {str(e)}")

    raise RuntimeError(f"Batch {batch_num} failed — all models returned errors. Last: {last_error}")


def generate_mcq_test(subject, prompt_text, difficulty="medium", count=10):
    """
    Calls Google Gemini API to generate structured MCQ questions.
    Automatically batches large requests (max BATCH_SIZE per API call)
    to avoid timeouts when generating many questions.
    """
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key or api_key in ("your_copied_api_key_here", ""):
        current_app.logger.warning(
            "GEMINI_API_KEY is not set. Generating mock test data."
        )
        return generate_mock_questions(subject, count)

    # Enforce limits
    count = max(10, min(100, count))

    # Split into batches if needed
    if count <= BATCH_SIZE:
        # Single call
        batches = [count]
    else:
        # Divide into equal batches of BATCH_SIZE, remainder in last batch
        full_batches = count // BATCH_SIZE
        remainder = count % BATCH_SIZE
        batches = [BATCH_SIZE] * full_batches
        if remainder > 0:
            batches.append(remainder)

    total_batches = len(batches)
    all_questions = []

    current_app.logger.info(
        f"Generating {count} questions in {total_batches} batch(es): {batches}"
    )

    for batch_num, batch_count in enumerate(batches, start=1):
        try:
            batch_questions = _call_gemini_single_batch(
                api_key=api_key,
                subject=subject,
                prompt_text=prompt_text,
                difficulty=difficulty,
                count=batch_count,
                batch_num=batch_num,
                total_batches=total_batches
            )
            all_questions.extend(batch_questions)

            # Small delay between batches to avoid rate limits
            if batch_num < total_batches:
                time.sleep(2)

        except RuntimeError as e:
            # If a batch fails but we already have some questions, use them
            if all_questions:
                current_app.logger.warning(
                    f"Batch {batch_num} failed but already have {len(all_questions)} questions. "
                    f"Returning partial result. Error: {str(e)}"
                )
                break
            else:
                # First batch failed — nothing to return
                raise RuntimeError(
                    f"AI question generation failed. {str(e)}"
                )

    if not all_questions:
        raise RuntimeError("AI generation returned no questions. Check your API key and quota.")

    current_app.logger.info(f"Total questions generated: {len(all_questions)}")
    return all_questions


def generate_mock_questions(subject, count):
    """Fallback generator - only used when API key is missing."""
    mock_questions = []
    for i in range(1, count + 1):
        mock_questions.append({
            "question_text": f"Mock Question {i} about {subject}: Which of these is a correct statement?",
            "option_a": "Option A: This is a placeholder statement for option A.",
            "option_b": f"Option B: This is the correct mock answer for question {i}.",
            "option_c": "Option C: This is a placeholder statement for option C.",
            "option_d": "Option D: This is a placeholder statement for option D.",
            "correct_option": "B",
            "explanation": f"Explanation for question {i}: Option B is correct by default."
        })
    return mock_questions
