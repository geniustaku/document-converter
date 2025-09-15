import azure.functions as func
import logging
import tempfile
import os
import json
from pdf2docx import Converter
import base64

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="pdf2word", methods=["POST"])
def pdf2word(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('PDF to Word conversion request received.')
    
    try:
        # Get content type
        content_type = req.headers.get('content-type', '').lower()
        
        if 'multipart/form-data' in content_type:
            # Handle file upload
            files = req.files
            if not files or 'file' not in files:
                return func.HttpResponse(
                    json.dumps({"error": "No file provided"}),
                    status_code=400,
                    mimetype="application/json"
                )
            
            file = files['file']
            pdf_data = file.read()
            filename = file.filename or "document.pdf"
            
        elif 'application/json' in content_type:
            # Handle JSON with base64 data
            try:
                json_data = req.get_json()
                if not json_data or 'fileData' not in json_data:
                    return func.HttpResponse(
                        json.dumps({"error": "No fileData in JSON"}),
                        status_code=400,
                        mimetype="application/json"
                    )
                
                pdf_data = base64.b64decode(json_data['fileData'])
                filename = json_data.get('fileName', 'document.pdf')
                
            except Exception as e:
                return func.HttpResponse(
                    json.dumps({"error": f"Invalid JSON: {str(e)}"}),
                    status_code=400,
                    mimetype="application/json"
                )
        else:
            return func.HttpResponse(
                json.dumps({"error": "Unsupported content type. Use multipart/form-data or application/json"}),
                status_code=400,
                mimetype="application/json"
            )
        
        if not pdf_data:
            return func.HttpResponse(
                json.dumps({"error": "Empty file data"}),
                status_code=400,
                mimetype="application/json"
            )
        
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
            
            # Read converted file
            with open(temp_docx_path, 'rb') as f:
                docx_data = f.read()
            
            if not docx_data:
                raise Exception("Conversion produced empty output")
            
            logging.info(f'Conversion successful. Output size: {len(docx_data)} bytes')
            
            # Return based on request type
            if 'application/json' in content_type:
                # Return base64 for JSON requests
                docx_base64 = base64.b64encode(docx_data).decode('utf-8')
                return func.HttpResponse(
                    json.dumps({
                        "success": True,
                        "data": docx_base64,
                        "originalSize": len(pdf_data),
                        "convertedSize": len(docx_data),
                        "filename": filename.replace('.pdf', '.docx')
                    }),
                    mimetype="application/json"
                )
            else:
                # Return file for multipart requests
                output_filename = filename.replace('.pdf', '.docx')
                headers = {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'Content-Disposition': f'attachment; filename="{output_filename}"',
                    'Content-Length': str(len(docx_data))
                }
                
                return func.HttpResponse(
                    docx_data,
                    status_code=200,
                    headers=headers,
                    mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                )
                
        except Exception as e:
            logging.error(f'Conversion failed: {str(e)}')
            return func.HttpResponse(
                json.dumps({"error": f"Conversion failed: {str(e)}"}),
                status_code=500,
                mimetype="application/json"
            )
        
        finally:
            # Clean up temporary files
            try:
                os.unlink(temp_pdf_path)
                os.unlink(temp_docx_path)
            except:
                pass
                
    except Exception as e:
        logging.error(f'Request processing failed: {str(e)}')
        return func.HttpResponse(
            json.dumps({"error": f"Request processing failed: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        )

@app.route(route="health", methods=["GET"])
def health(req: func.HttpRequest) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps({
            "status": "healthy",
            "service": "PDF to Word conversion",
            "version": "1.0.0",
            "endpoints": {
                "convert": "/api/pdf2word",
                "health": "/api/health"
            }
        }),
        mimetype="application/json"
    )