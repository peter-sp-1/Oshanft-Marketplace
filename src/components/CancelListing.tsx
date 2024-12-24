import { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useMarketplace } from "./MarketPlaceContext";
import { PROGRAM_ID, getListingPDA, getEscrowPDA } from "./utils/pdas";
import idl from "./idl.json";

const network = "https://api.devnet.solana.com";

const CancelListing: React.FC = () => {
  const wallet = useWallet();
  const { loading, setLoading, message, setMessage, setError } = useMarketplace();
  const [mintAddress, setMintAddress] = useState("");

  const handleCancelListing = async () => {
    if (!wallet.publicKey) {
      setMessage("Wallet not connected!");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const mintPubkey = new PublicKey(mintAddress);
      const connection = new Connection(network, "confirmed");
      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: "confirmed",
      });
      const program = new Program(idl as any, PROGRAM_ID, provider);

      const [listingPDA] = await getListingPDA(wallet.publicKey, mintPubkey);
      const [escrowPDA] = await getEscrowPDA(listingPDA);
      const sellerTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        wallet.publicKey
      );

      const tx = await program.methods
        .cancelListing()
        .accounts({
          seller: wallet.publicKey,
          listing: listingPDA,
          sellerTokenAccount,
          escrowTokenAccount: escrowPDA,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      setMessage("Listing cancelled successfully!");
      console.log("Transaction signature:", tx);
    } catch (error: any) {
      console.error("Error cancelling listing:", error);
      setError(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Cancel NFT Listing</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCancelListing();
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
          {loading ? "Processing..." : "Cancel Listing"}
        </button>
      </form>
      {message && (
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default CancelListing;