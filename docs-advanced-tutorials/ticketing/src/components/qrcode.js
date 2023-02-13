import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

const QrCode = ({ link }) => {
  const [url, setUrl] = useState("");

  const downloadQRCode = (e) => {
    e.preventDefault();
    setUrl("");
  };

  const qrCodeEncoder = (e) => {
    setUrl(e.target.value);
  };

  const qrcode = (
    <QRCodeCanvas
      id="qrCode"
      value={link}
      size={300}
      fgColor={"#000000"}
      bgColor={"#F8F8FF"}
      level={"H"}
    />
  );
  return (
    <div className="qrcode__container">
      <div>{qrcode}</div>
      <div className="input__group">
        {/* <form onSubmit={downloadQRCode}>
          <label>Enter URL</label>
          <input
            type="text"
            value={url}
            onChange={qrCodeEncoder}
            placeholder="https://hackernoon.com"
          />
          <button type="submit" disabled={!url}>
            Download QR code
          </button>
        </form> */}
      </div>
    </div>
  );
};

export default QrCode;