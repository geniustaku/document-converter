declare module 'pdfkit' {
  import { Readable } from 'stream';

  export default class PDFDocument extends Readable {
    constructor(options?: any);
    addPage(options?: any): this;
    text(text: string, x?: number, y?: number, options?: any): this;
    fontSize(size: number): this;
    font(src: string): this;
    image(src: string | Buffer, x?: number, y?: number, options?: any): this;
    end(): void;
    pipe(destination: any): any;
  }
}
