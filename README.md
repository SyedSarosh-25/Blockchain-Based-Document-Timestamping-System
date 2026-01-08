# Blockchain Document Timestamping System

A decentralized application (DApp) for timestamping documents on a local blockchain. This project allows users to upload documents, generate a SHA-256 hash, store it on the blockchain to prove existence at a specific point in time, and verify previously stamped documents.

## 🚀 Features

- **Document Hashing**: Client-side SHA-256 hashing of files (files are never uploaded, only hashes).
- **Immutable Timestamping**: Stores document hashes with block timestamps on the blockchain.
- **Verification**: Verify if a document was stamped and retrieve its original timestamp.
- **Real-time Activity Log**: Visual log of blockchain events.
- **Modern UI**: Clean, responsive interface built with basic HTML/CSS (Ethers.js for blockchain interaction).

## 🛠 Technology Stack

- **Smart Contract**: Solidity (v0.8.24)
- **Framework**: Hardhat
- **Frontend**: HTML5, Vanilla JavaScript, Ethers.js (v6)
- **Local Blockchain**: Hardhat Network

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- A web browser with **MetaMask** installed (optional, but recommended for interacting with other networks; currently configured for Hardhat local node).

## ⚙️ Installation & Setup

1.  **Clone the repository** (if applicable) or navigate to the project folder.

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start the Local Blockchain Node**
    This command starts a local Hardhat network and generates 20 test accounts.
    ```bash
    npm start
    # or manually: npx hardhat node
    ```

4.  **Deploy the Smart Contract**
    Open a new terminal (keep the node running) and deploy the contract to the local network.
    ```bash
    npm run deploy
    ```
    *Note: The deployment script should output the contract address. Ensure this address matches the one used in your frontend configuration (usually updated automatically or logged).*

5.  **Run the Frontend**
    Start a local HTTP server to host the user interface.
    ```bash
    npm run frontend
    ```
    Open your browser and navigate to `http://127.0.0.1:8080`.

## 📖 Usage Guide

### Stamping a Document
1.  Open the web interface.
2.  Click "Select Document" or drag and drop a file.
3.  Click **"Stamp on Blockchain"**.
4.  The system will calculate the hash and send a transaction to the smart contract.
5.  Once confirmed, the timestamp and transaction details will appear.

### Verifying a Document
1.  Select the **"Verify Document"** tab (if available) or simply upload the file again.
2.  The system checks the blockchain for the file's hash.
3.  If found, it displays the original timestamp. If not, it confirms the document has not been stamped.

## 📂 Project Structure

```
document-timestamping/
├── contracts/
│   └── DocumentTimestamp.sol   # Solidity Smart Contract
├── frontend/
│   ├── index.html              # User Interface
│   ├── app.js                  # Frontend Logic (Ethers.js integration)
│   └── ...
├── scripts/
│   └── deploy.js               # Deployment script
├── hardhat.config.js           # Hardhat configuration
├── package.json                # Project dependencies and scripts
└── README.md                   # Project documentation
```

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
