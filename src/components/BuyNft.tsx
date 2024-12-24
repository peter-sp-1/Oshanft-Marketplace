
import { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, web3 } from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useMarketplace } from "./MarketPlaceContext";
import { PROGRAM_ID, getListingPDA, getEscrowPDA } from "./utils/pdas";
import idl from "./idl.json";

const connection = new Connection("https://api.devnet.solana.com");

const BuyNFT: React.FC = () => {
  const wallet = useWallet();
  const { loading, setLoading, message, setMessage, setError } = useMarketplace();
  const [mintAddress, setMintAddress] = useState("");

  const handleBuyNFT = async () => {
    if (!wallet.publicKey) {
      setMessage("Wallet not connected!");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const mintPubkey = new PublicKey(mintAddress);
      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: "confirmed",
      });
      const program = new Program(idl as any, PROGRAM_ID, provider);

      const listing = await program.account.listingAccount.all([
        {
          memcmp: {
            offset: 8,
            bytes: mintPubkey.toBase58(),
          },
        },
      ]) as any;

      if (!listing.length) {
        throw new Error("NFT listing not found");
      }

      const [listingPDA] = await getListingPDA(listing[0].account.seller, mintPubkey);
      const [escrowPDA] = await getEscrowPDA(listingPDA);
      const buyerTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        wallet.publicKey
      );

      const tx = await program.methods
        .buyNft(listing[0].account.price)
        .accounts({
          buyer: wallet.publicKey,
          seller: listing[0].account.seller,
          listing: listingPDA,
          nftMint: mintPubkey,
          escrowTokenAccount: escrowPDA,
          buyerTokenAccount,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      setMessage("NFT purchased successfully!");
      console.log("Transaction signature:", tx);
    } catch (error: any) {
      console.error("Error buying NFT:", error);
      setError(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Buy NFT</h2>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleBuyNFT();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            NFT Mint Address:
            <input
              type="text"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Buy NFT"}
        </button>
      </form>
      {message && (
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default BuyNFT;

