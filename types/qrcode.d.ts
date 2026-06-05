declare module "qrcode" {
  type ToDataUrlOptions = {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    margin?: number;
    scale?: number;
    width?: number;
  };

  const QRCode: {
    toDataURL(text: string, options?: ToDataUrlOptions): Promise<string>;
  };

  export default QRCode;
}
