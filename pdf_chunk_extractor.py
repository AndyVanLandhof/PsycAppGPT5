import fitz  # PyMuPDF
import os
import json
from pathlib import Path

def extract_chunks_from_pdf(pdf_path, output_json, chars_per_chunk=700):
    doc = fitz.open(pdf_path)
    chunks = []

    for page_num in range(len(doc)):
        text = doc[page_num].get_text()
        if not text.strip():
            continue  # skip blank pages

        paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
        for para in paragraphs:
            if len(para) <= chars_per_chunk:
                chunks.append({"text": para, "pdf_page": page_num + 1})
            else:
                # Split long paragraphs
                for i in range(0, len(para), chars_per_chunk):
                    chunk = para[i:i+chars_per_chunk].strip()
                    chunks.append({"text": chunk, "pdf_page": page_num + 1})

    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)

    print(f"✅ Extracted {len(chunks)} chunks from '{pdf_path.name}' → saved to '{output_json}'")

if __name__ == "__main__":
    base_path = Path.home() / "Documents/PREAppFiles/Christianity/Additional Books"
    pdf_file = base_path / "The Myth of Christian Uniqueness.pdf"
    output_file = base_path / "The Myth of Christian Uniqueness_chunks.json"

    if not pdf_file.exists():
        raise FileNotFoundError(f"PDF not found at: {pdf_file}")

    extract_chunks_from_pdf(pdf_file, output_file)
