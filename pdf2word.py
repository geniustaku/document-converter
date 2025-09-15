#!/usr/bin/env python3
import sys
import os
from pdf2docx import Converter
import json

def convert_pdf_to_word(pdf_path, docx_path):
    try:
        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
        cv.close()
        return {"success": True, "message": "Conversion completed successfully"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def main():
    if len(sys.argv) != 3:
        print(json.dumps({"success": False, "error": "Usage: python pdf2word.py <input.pdf> <output.docx>"}))
        sys.exit(1)
    
    input_pdf = sys.argv[1]
    output_docx = sys.argv[2]
    
    if not os.path.exists(input_pdf):
        print(json.dumps({"success": False, "error": f"Input file {input_pdf} does not exist"}))
        sys.exit(1)
    
    result = convert_pdf_to_word(input_pdf, output_docx)
    print(json.dumps(result))
    
    if not result["success"]:
        sys.exit(1)

if __name__ == "__main__":
    main()