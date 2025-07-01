import json
from pathlib import Path

def load_chunks(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def find_best_chunks(query, chunks, top_n=3):
    scores = []
    for chunk in chunks:
        text = chunk['text'].lower()
        score = sum(1 for word in query.lower().split() if word in text)
        scores.append((score, chunk))
    scores.sort(reverse=True, key=lambda x: x[0])
    return [c for s, c in scores[:top_n] if s > 0]

# === Run the test ===
if __name__ == "__main__":
    base_path = Path.home() / "Documents/PREAppFiles/Philosophy/Core Books"
    json_file = base_path / "Religious Studies - Philosophy of Religion_chunks.json"
    
    query = "What is Plato’s theory of the Forms?"
    chunks = load_chunks(json_file)
    results = find_best_chunks(query, chunks)

    for i, chunk in enumerate(results, 1):
        print(f"\n🔹 Match #{i} (Page {chunk['pdf_page']}):\n{chunk['text']}")
