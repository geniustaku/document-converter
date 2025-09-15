from flask import Flask, request, jsonify, send_file
import tempfile
import os
import base64
from pdf2docx import Converter
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "PDF to Word conversion",
        "version": "1.0.0"
    })

@app.route('/convert', methods=['POST'])
def convert():
    try:
        # Handle file upload
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Read PDF data
        pdf_data = file.read()
        filename = file.filename or "document.pdf"
        
        if not pdf_data:
            return jsonify({"error": "Empty file"}), 400
        
        # Create temporary files
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_pdf:
            temp_pdf.write(pdf_data)
            temp_pdf_path = temp_pdf.name
        
        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as temp_docx:
            temp_docx_path = temp_docx.name
        
        try:
            # Convert PDF to DOCX
            logging.info(f'Converting PDF ({len(pdf_data)} bytes) to DOCX')
            cv = Converter(temp_pdf_path)
            cv.convert(temp_docx_path, start=0, end=None)
            cv.close()
            
            # Check if file was created
            if not os.path.exists(temp_docx_path) or os.path.getsize(temp_docx_path) == 0:
                raise Exception("Conversion produced empty output")
            
            logging.info(f'Conversion successful. Output size: {os.path.getsize(temp_docx_path)} bytes')
            
            # Return the converted file
            output_filename = filename.replace('.pdf', '.docx')
            return send_file(
                temp_docx_path,
                as_attachment=True,
                download_name=output_filename,
                mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
            
        except Exception as e:
            logging.error(f'Conversion failed: {str(e)}')
            return jsonify({"error": f"Conversion failed: {str(e)}"}), 500
        
        finally:
            # Clean up temp files
            try:
                os.unlink(temp_pdf_path)
                if os.path.exists(temp_docx_path):
                    os.unlink(temp_docx_path)
            except:
                pass
                
    except Exception as e:
        logging.error(f'Request processing failed: {str(e)}')
        return jsonify({"error": f"Request processing failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)