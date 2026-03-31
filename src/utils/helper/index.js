import cryptoJS from "crypto-js";
import { CRYPTO_SECRET_KEY, IV} from "../../Component/config/config.js";

function encodeResData(data) {
  const plainData = JSON.stringify(data);
  const cipherData = cryptoJS.AES.encrypt(
    plainData,
    cryptoJS.enc.Utf8.parse(CRYPTO_SECRET_KEY,IV),
    {
      iv: cryptoJS.enc.Hex.parse(IV),
    }
  ).toString();
  return cipherData;
}

const decodeReqData = (data) => {
  const bytes = cryptoJS.AES.decrypt(
    data,
    cryptoJS.enc.Utf8.parse(CRYPTO_SECRET_KEY,IV),
    {
      iv: cryptoJS.enc.Hex.parse(IV),
    }
  );
  // Convert the decrypted bytes back to a UTF-8 string
  return JSON.parse(bytes.toString(cryptoJS.enc.Utf8));
};
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
export { encodeResData, decodeReqData };