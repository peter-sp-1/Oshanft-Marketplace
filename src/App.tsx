
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import WalletContextProvider from "./components/WalletProvider";
import { MarketplaceProvider } from "./components/MarketPlaceContext";
import BuyNFT from "./components/BuyNft";
import CancelListing from "./components/CancelListing";
import ListNFT from "./components/ListNft";

function App() {
  return (
    <WalletContextProvider>
      <MarketplaceProvider>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <h1 className="text-2xl font-bold text-gray-900">NFT Marketplace</h1>
                <WalletMultiButton />
              </div>
            </div>
          </nav>
          
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ListNFT />
              <BuyNFT />
              <CancelListing />
            </div>
          </main>
        </div>
      </MarketplaceProvider>
    </WalletContextProvider>
  );
}

export default App;



