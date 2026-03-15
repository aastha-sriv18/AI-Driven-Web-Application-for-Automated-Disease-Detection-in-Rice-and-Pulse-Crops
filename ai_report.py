import os
from dotenv import load_dotenv
import google.genai as genai
load_dotenv()


client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def generate_disease_report(disease, confidence, alternatives):
    
    alt_text = ""
    for a in alternatives:
        alt_text += f"{a['disease']} ({round(a['confidence']*100,2)}%), "

    prompt = f"""
    A plant leaf disease detection model predicted the following:

    Main Disease: {disease}
    Confidence: {round(confidence*100,2)}%

    Other possible diseases:
    {alt_text}

    Generate a clear report including:
    1. What the disease is
    2. Why it occurs
    3. How farmers can prevent it
    4. Treatment tips

    Keep it concise and easy to understand.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return response.text

    except Exception as e:
        return f"AI report generation failed: {str(e)}"