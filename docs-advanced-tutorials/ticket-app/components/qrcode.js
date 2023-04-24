import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

const QrCode = ({ link }) => {
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
    </div>
  );
};

export default QrCode;