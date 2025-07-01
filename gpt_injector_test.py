import json
import openai
from pathlib import Path

# 🔑 Replace this with your actual OpenAI API key
openai.api_key = "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"

def load_chunks(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def find_best_chunks(query, chunks, top_n=2):
    scores = []
    for chunk in chunks:
        text = chunk['text'].lower()
        score = sum(1 for word in query.lower().split() if word in text)
        scores.append((score, chunk))
    scores.sort(reverse=True, key=lambda x: x[0])
    return [c for s, c in scores[:top_n] if s > 0]

def generate_prompt(context_chunks, query):
    context = "\n---\n".join([chunk['text'] for chunk in context_chunks])
    return f"You are a helpful tutor. Use the reference content below to answer the student's question in simple and plain English. Always give a simple example or metaphor. Always ask if the student wants to learn more.\n\nReference:\n{context}\n\nQuestion: {query}\n\nAnswer:"

def get_gpt_response(prompt):
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful A Level Religious Studies tutor."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content.strip()

if __name__ == "__main__":
    query = "What is Situation Ethics about?"
    base_path = Path.home() / "Documents/PREAppFiles/Ethics/Core Books"
    json_file = base_path / "Religious Studies - Religion and Ethics_chunks.json"

    chunks = load_chunks(json_file)
    top_chunks = find_best_chunks(query, chunks)
    prompt = generate_prompt(top_chunks, query)
    answer = get_gpt_response(prompt)

    print("\n🧠 GPT Answer:\n")
    print(answer)
