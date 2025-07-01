import fitz  # PyMuPDF
import re
import json

PDF_FILENAME = "OCR Religious Studies - Revision Guide.pdf"  # <-- Change this if needed
TXT_FILENAME = "revision_guide_extracted.txt"
JSON_FILENAME = "revision_guide_chunks.json"

def extract_text_with_headings(pdf_path, txt_path):
    doc = fitz.open(pdf_path)
    with open(txt_path, "w", encoding="utf-8") as f:
        for page_num, page in enumerate(doc, 1):
            text = page.get_text("text")
            f.write(f"\n\n--- PAGE {page_num} ---\n\n")
            f.write(text)

def is_heading(line):
    # Heuristic: ALL CAPS, or starts with a capital and is short, or numbered section
    return (
        (line.isupper() and len(line) > 5) or
        re.match(r'^[A-Z][A-Za-z0-9\s\-:]{0,60}$', line) or
        re.match(r'^[A-Z]\. ', line) or
        re.match(r'^[0-9]+\.', line)
    )

def chunk_by_headings(txt_path, json_path):
    with open(txt_path, "r", encoding="utf-8") as f:
        text = f.read()

    # Split by page markers
    pages = re.split(r'\n+--- PAGE (\d+) ---\n+', text)
    chunks = []
    for i in range(1, len(pages), 2):
        page_num = int(pages[i])
        page_text = pages[i+1]
        # Split page into lines
        lines = page_text.splitlines()
        current_title = None
        current_content = []
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if is_heading(line):
                # Save previous chunk if it exists and is not just a page number
                if current_title and current_content and not current_title.isdigit():
                    content = "\n".join(current_content).strip()
                    if len(content) > 40:  # skip tiny/empty chunks
                        chunks.append({
                            "title": current_title,
                            "content": content,
                            "page": page_num
                        })
                current_title = line
                current_content = []
            else:
                current_content.append(line)
        # Save last chunk on the page
        if current_title and current_content and not current_title.isdigit():
            content = "\n".join(current_content).strip()
            if len(content) > 40:
                chunks.append({
                    "title": current_title,
                    "content": content,
                    "page": page_num
                })

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    print("Extracting text from PDF...")
    extract_text_with_headings(PDF_FILENAME, TXT_FILENAME)
    print("Chunking by improved headings...")
    chunk_by_headings(TXT_FILENAME, JSON_FILENAME)
    print(f"Done! Output written to {JSON_FILENAME}") 