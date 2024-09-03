import { createThirdwebClient } from "thirdweb";

export const client = process.env.THIRDWEB_SECRET_KEY
	? createThirdwebClient({
			secretKey: process.env.THIRDWEB_SECRET_KEY,
		})
	: createThirdwebClient({
			clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
		});
