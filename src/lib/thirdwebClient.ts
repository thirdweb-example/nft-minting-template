import { createThirdwebClient } from "thirdweb";

if (
  !process.env.THIRDWEB_SECRET_KEY &&
  !process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
) {
  throw new Error(
    "Either THIRDWEB_SECRET_KEY or NEXT_PUBLIC_THIRDWEB_CLIENT_ID must be set.",
  );
}

export const client = process.env.THIRDWEB_SECRET_KEY
  ? createThirdwebClient({
      secretKey: process.env.THIRDWEB_SECRET_KEY,
    })
  : createThirdwebClient({
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
    });
