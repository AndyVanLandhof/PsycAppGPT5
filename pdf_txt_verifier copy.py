import fitz  # PyMuPDF
import os
from pathlib import Path

def extract_pdf_sample_text(pdf_path, page_number=0, num_chars=500):
    doc = fitz.open(pdf_path)
    if page_number >= len(doc):
        raise ValueError("Page number out of range.")
    text = doc[page_number].get_text()
    return text[:num_chars].strip()

def extract_txt_sample_text(txt_path, num_chars=500, offset=0):
    with open(txt_path, 'r', encoding='utf-8') as f:
        f.seek(offset)
        return f.read(num_chars).strip()

def compare_samples(pdf_sample, txt_sample):
    print("--- PDF Sample ---")
    print(pdf_sample)
    print("\n--- TXT Sample ---")
    print(txt_sample)
    print("\n--- Differences ---")

    pdf_words = set(pdf_sample.lower().split())
    txt_words = set(txt_sample.lower().split())
    missing = pdf_words - txt_words
    extra = txt_words - pdf_words

    print(f"Words in PDF but not TXT: {missing}")
    print(f"Words in TXT but not PDF: {extra}")

if __name__ == "__main__":
    base_path = Path.home() / "Documents/PREAppFiles/Philosophy/Additional Books"
    pdf_file = base_path / "The Elements of Moral Philosophy.pdf"
    txt_file = base_path / "The Elements of Moral Philosophy.txt"

    if not pdf_file.exists() or not txt_file.exists():
        raise FileNotFoundError("PDF or TXT file not found in the specified directory.")

    for page in range(1, 4):
        print(f"\n=================== Page {page} ===================")
        pdf_sample = extract_pdf_sample_text(pdf_file, page_number=page)
        txt_sample = extract_txt_sample_text(txt_file, offset=page * 800)
        compare_samples(pdf_sample, txt_sample)

