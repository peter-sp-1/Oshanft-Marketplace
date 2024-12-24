import { useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, web3 } from "@project-serum/anchor";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { BN } from "bn.js";
import { useMarketplace } from "./MarketPlaceContext";
import { PROGRAM_ID, getListingPDA, getEscrowPDA } from "./utils/pdas";
import idl from "./idl.json";

const network = "https://api.devnet.solana.com";

const ListNFT: React.FC = () => {
  const wallet = useWallet();
  const { loading, setLoading, message, setMessage, setError } = useMarketplace();
  const [mintAddress, setMintAddress] = useState("");
  const [price, setPrice] = useState<string>("");
  const [royalty, setRoyalty] = useState<string>("");

  const handleListNFT = async () => {
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
        .listNft(
          new BN(Number(price) * web3.LAMPORTS_PER_SOL),
          Number(royalty) * 100
        )
        .accounts({
          seller: wallet.publicKey,
          nftMint: mintPubkey,
          listing: listingPDA,
          sellerTokenAccount,
          escrowTokenAccount: escrowPDA,
          systemProgram: web3.SystemProgram.programId,
          tokenProgram: web3.TOKEN_PROGRAM_ID,
          rent: web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      setMessage("NFT listed successfully!");
      console.log("Transaction signature:", tx);
    } catch (error: any) {
      console.error("Error listing NFT:", error);
      setError(error);
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">List Your NFT</h2>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleListNFT();
      }}
      className="space-y-4">
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
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price (SOL):
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Royalty (%):
            <input
              type="number"
              value={royalty}
              onChange={(e) => setRoyalty(e.target.value)}
              min="0"
              max="100"
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
          {loading ? "Processing..." : "List NFT"}
        </button>
      </form>
      {message && (
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      )}
    </div>
  );
};

export default ListNFT;
