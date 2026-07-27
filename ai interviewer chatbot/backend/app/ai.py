import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print("GEMINI KEY FOUND:", bool(api_key))

client = genai.Client(api_key=api_key)

def generate_questions(prompt: str):
    print("Calling Gemini...")

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    print("Gemini Response:")
    print(response)

    return response.text