import { HashConnect } from "hashconnect";

const connectToWallet = async () => {
  const hashconnect = new HashConnect();

  hashconnect.pairingEvent.once(async (pairingData) => {
    // const accountID = pairingData.accountIds[0]; // for the real thing
    console.log(pairingData);
    const accountID = "0.0.808420";
    await fetchAccountData(accountID);
  });

  let appData = {
    name: "Test App",
    description: "Test App Description",
    icon: "https://example.com/icon.png",
  };

  let initData = await hashconnect.init(appData);

  let privateKey = initData.encryptionKey;
  console.log(privateKey + " is the private key");

  let state = await hashconnect.connect();
  let topic = state.topic;

  let pairingString = hashconnect.generatePairingString(
    state,
    "testnet",
    false
  );

  hashconnect.findLocalWallets();

  hashconnect.connectToLocalWallet(pairingString);
};

const connectToWalletButton = document.getElementById("wallet-connect");
connectToWalletButton.addEventListener("click", connectToWallet);

async function fetchAccountData(accountID) {
  // using the hedera rest api, fetch the balance and nfts associated with the account
  const testnetAPI = "https://mainnet-public.mirrornode.hedera.com/api/v1";

  const balanceGET = await fetch(
    `${testnetAPI}/balances?account.id=${accountID}`
  );
  const balance = await balanceGET.json();

  console.log(balance);

  const nftsGET = await fetch(
    `${testnetAPI}/accounts/${accountID}/nfts?token.id=0.0.787797`
  );

  const nftsFetches = await nftsGET.json();
  const nfts = nftsFetches.nfts;

  for (const nft of nfts) {
    const metadata = nft.metadata;

    // decode metadata from base64
    const decodedMetadata = Buffer.from(metadata, "base64").toString("ascii");

    // decoded metadata of the form: ipfs://Qmasdjknaksjdnsakdnj
    const ipfsHash = decodedMetadata.split("ipfs://")[1];

    // fetch the ipfs data and save it to json
    const ipfsData = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
    const ipfsJSON = await ipfsData.json();

    // get the image
    const image = ipfsJSON.image;
    // image is of the form: ipfs://Qmasdjknaksjdnsakdnj
    const imageHash = image.split("ipfs://")[1];

    // get the image address from ipfs
    const imageAddress = `https://ipfs.io/ipfs/${imageHash}`;

    // add the image to the page
    const imageElement = document.createElement("img");
    imageElement.src = imageAddress;
    document.body.appendChild(imageElement);
  }
}
