import fitz  # PyMuPDF
import re
import json
import sys
import os

def extract_text_with_headings(pdf_path, txt_path):
    doc = fitz.open(pdf_path)
    with open(txt_path, "w", encoding="utf-8") as f:
        for page_num, page in enumerate(doc, 1):
            text = page.get_text("text")
            f.write(f"\n\n--- PAGE {page_num} ---\n\n")
            f.write(text)

def is_heading(line):
    return (
        (line.isupper() and len(line) > 5) or
        re.match(r'^[A-Z][A-Za-z0-9\s\-:]{0,60}$', line) or
        re.match(r'^[A-Z]\. ', line) or
        re.match(r'^[0-9]+\.', line)
    )

def chunk_by_headings(txt_path, json_path, pdf_filename=None):
    with open(txt_path, "r", encoding="utf-8") as f:
        text = f.read()

    pages = re.split(r'\n+--- PAGE (\d+) ---\n+', text)
    chunks = []
    for i in range(1, len(pages), 2):
        page_num = int(pages[i])
        page_text = pages[i+1]
        lines = page_text.splitlines()
        current_title = None
        current_content = []
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if is_heading(line):
                if current_title and current_content and not current_title.isdigit():
                    content = "\n".join(current_content).strip()
                    if len(content) > 40:
                        chunks.append({
                            "title": current_title,
                            "content": content,
                            "page": page_num,
                            "source": pdf_filename
                        })
                current_title = line
                current_content = []
            else:
                current_content.append(line)
        if current_title and current_content and not current_title.isdigit():
            content = "\n".join(current_content).strip()
            if len(content) > 40:
                chunks.append({
                    "title": current_title,
                    "content": content,
                    "page": page_num,
                    "source": pdf_filename
                })

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)

def process_pdf(pdf_path):
    base = os.path.splitext(pdf_path)[0]
    txt_path = base + "_extracted.txt"
    json_path = base + "_chunks.json"
    print(f"Processing {pdf_path} ...")
    extract_text_with_headings(pdf_path, txt_path)
    chunk_by_headings(txt_path, json_path, pdf_filename=os.path.basename(pdf_path))
    print(f"Done! Output written to {json_path}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_path = sys.argv[1]
        if os.path.isdir(input_path):
            pdf_files = [os.path.join(input_path, f) for f in os.listdir(input_path) if f.lower().endswith('.pdf')]
            if not pdf_files:
                print("No PDF files found in the directory.")
            for pdf_file in pdf_files:
                process_pdf(pdf_file)
        elif os.path.isfile(input_path) and input_path.lower().endswith('.pdf'):
            process_pdf(input_path)
        else:
            print("Please provide a PDF file or a directory containing PDF files.")
    else:
        print("Usage: python even_better_chunker.py <pdf_file_or_directory>")