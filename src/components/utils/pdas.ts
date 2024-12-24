import { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = new PublicKey("[93,111,2,147,38,166,141,71,112,182,118,56,253,29,142,163,17,118,140,158,0,141,27,236,26,239,124,18,39,31,38,50,191,15,235,117,3,180,32,31,192,89,72,210,139,241,233,232,31,3,138,89,177,56,79,47,242,85,58,140,22,167,27,76]");

export const getListingPDA = async (
  seller: PublicKey,
  mintAddress: PublicKey
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("listing"), seller.toBuffer(), mintAddress.toBuffer()],
    PROGRAM_ID
  );
};

export const getEscrowPDA = async (
  listingAddress: PublicKey
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), listingAddress.toBuffer()],
    PROGRAM_ID
  );
};