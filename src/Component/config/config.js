const server = import.meta.env.VITE_SERVER;

const header = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
   
  },
  
};

const CRYPTO_SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET_KEY;
const secretKey = import.meta.env.VITE_SECRET_KEY; 
const IV = import.meta.env.VITE_IV;

export { server,header,secretKey,CRYPTO_SECRET_KEY,IV  };