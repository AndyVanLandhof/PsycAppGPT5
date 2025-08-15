import json
from pathlib import Path


def load_chunks(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def find_best_chunks(query, chunks, top_n=3):
    scores = []
    for chunk in chunks:
        text = (chunk.get('content') or chunk.get('text') or '').lower()
        score = sum(1 for word in query.lower().split() if word in text)
        scores.append((score, chunk))
    scores.sort(reverse=True, key=lambda x: x[0])
    return [c for s, c in scores[:top_n] if s > 0]


# === Run the test (AQA Psychology) ===
if __name__ == "__main__":
    base_path = Path(__file__).resolve().parent / "public" / "vault"
    json_file = base_path / "AQA Psychology A-Level and AS Years 1 and 2_chunks.json"

    query = "Working memory model central executive phonological loop"
    chunks = load_chunks(json_file)
    results = find_best_chunks(query, chunks)

    for i, chunk in enumerate(results, 1):
        page = chunk.get('page') or chunk.get('pdf_page')
        text = (chunk.get('content') or chunk.get('text') or '')[:400]
        print(f"\n🔹 Match #{i} (Page {page}):\n{text}")
