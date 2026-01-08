
let CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Will be set by prompt

// --- STATE ---
let provider;
let signer;
let contract;
let currentHash = "";

// --- ELEMENTS ---
const elStatus = document.getElementById("connectionState");
const elFileInput = document.getElementById("fileInput");
const elFileName = document.getElementById("fileName");
const elHashDisplay = document.getElementById("hashDisplay");
const btnCompute = document.getElementById("btnCompute");
const btnStore = document.getElementById("btnStore");
const btnVerify = document.getElementById("btnVerify");
const elResult = document.getElementById("resultArea");

// --- INITIALIZATION ---
async function init() {
    elStatus.innerHTML = '<span class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse mr-2"></span> Connecting...';

    if (!window.ethereum) {
        setStatus("No MetaMask Found", "red");
        alert("Please install MetaMask to use this DApp.");
        return;
    }

    try {
        // Request account access
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        const address = await signer.getAddress();

        setStatus(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`, "green");

        // Load Contract
        await loadContract();

    } catch (error) {
        console.error("Init error:", error);
        setStatus(`Connection Failed: ${error.message || error}`, "red");
    }
}

function setStatus(msg, color) {
    const colorClass = color === "green" ? "bg-green-500" : (color === "red" ? "bg-red-500" : "bg-yellow-500");
    elStatus.innerHTML = `<span class="w-2 h-2 rounded-full ${colorClass} mr-2"></span> ${msg}`;
    elStatus.className = `mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-800 border ${color === "green" ? "border-green-900 text-green-400" : (color === "red" ? "border-red-900 text-red-400" : "border-yellow-900 text-yellow-400")}`;
}

async function updateBlockNumber() {
    try {
        if (provider) {
            const blockNum = await provider.getBlockNumber();
            const elBlock = document.getElementById("blockNumberDisplay");
            if (elBlock) elBlock.textContent = `Block: ${blockNum}`;
        }
    } catch (e) { console.error(e); }
}

// Poll block number every 3s
setInterval(updateBlockNumber, 3000);


// --- CONTRACT LOADING ---
async function loadContract() {
    // 1. Get Artifact (ABI)
    try {
        const response = await fetch('./artifacts/contracts/DocumentTimestamp.sol/DocumentTimestamp.json');
        if (!response.ok) {
            throw new Error("Artifact not found.\n\nMake sure to run 'npx hardhat run scripts/deploy.js --network localhost' first.");
        }
        const artifact = await response.json();

        // 2. Get Address
        let inputAddr = prompt("Please enter the deployed Contract Address:", localStorage.getItem("lastContractAddress") || "");

        // Loop until valid address or cancel
        while (inputAddr && !ethers.isAddress(inputAddr)) {
            inputAddr = prompt("Invalid Address. Please enter a valid Ethereum Address:", inputAddr);
        }

        if (inputAddr) {
            CONTRACT_ADDRESS = inputAddr;
            localStorage.setItem("lastContractAddress", inputAddr);
        } else {
            setStatus("No Contract Address", "red");
            return;
        }

        // Check if contract exists on chain
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === "0x") {
            setStatus("Contract not found", "red");
            alert("Error: The contract is not found at this address on the current network.\n\nDid you restart the hardhat node? If so, re-deploy and update the address.");
            return;
        }

        contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, signer);
        console.log("Contract loaded:", contract);

    } catch (err) {
        console.error("Failed to load contract:", err);
        elResult.classList.remove("hidden");
        elResult.innerHTML = `<span class="text-red-400">Error loading contract. Details: ${err.message}</span>`;
    }
}


// --- HASHING ---
elFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        elFileName.textContent = file.name;
        elFileName.classList.remove("hidden");
        elHashDisplay.textContent = "Click 'Compute Hash'...";
        currentHash = "";
        btnStore.disabled = true;
        btnVerify.disabled = true;
    }
});

btnCompute.addEventListener('click', async () => {
    const file = elFileInput.files[0];
    if (!file) {
        alert("Please select a file first.");
        return;
    }

    btnCompute.textContent = "Computing...";

    try {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        currentHash = hashHex;
        elHashDisplay.textContent = hashHex;
        elHashDisplay.classList.add("text-blue-400");

        // Enable buttons
        btnStore.disabled = false;
        btnVerify.disabled = false;
        btnCompute.textContent = "Compute Hash";

    } catch (err) {
        console.error("Hash Error:", err);
        btnCompute.textContent = "Error";
        alert("Error computing hash: " + err.message);
    }
});


// --- ACTIONS ---

// STORE
btnStore.addEventListener('click', async () => {
    if (!contract || !currentHash) return;

    setLoading(true, "Storing...");
    elResult.classList.add("hidden");

    try {
        const tx = await contract.storeHash(currentHash);

        showResult(`Transaction Sent! Waiting for confirmation...`, "yellow");

        const receipt = await tx.wait();
        const block = await provider.getBlock(receipt.blockNumber);

        showResult(`
            <div class="flex flex-col gap-2">
                <div class="font-bold text-green-400 text-lg">✔ Document Timestamped!</div>
                <div class="grid grid-cols-2 text-xs gap-x-2 gap-y-1 mt-2">
                    <span class="text-slate-500">Block:</span> <span>${receipt.blockNumber}</span>
                    <span class="text-slate-500">Time:</span> <span>${new Date(block.timestamp * 1000).toLocaleString()}</span>
                </div>
            </div>
        `, "green");

    } catch (err) {
        console.error(err);
        showResult(`Error: ${err.reason || err.message}`, "red");
    } finally {
        setLoading(false, "Store Reference");
    }
});

// VERIFY
btnVerify.addEventListener('click', async () => {
    if (!contract || !currentHash) return;

    setLoading(true, "Verifying...");
    elResult.classList.add("hidden");

    try {
        // Returns [bool exists, uint256 timestamp]
        const result = await contract.verifyHash(currentHash);
        const exists = result[0];
        const timestamp = result[1];

        if (exists) {
            showResult(`
                <div class="flex flex-col gap-2">
                    <div class="font-bold text-blue-400 text-lg">✔ Verified: Valid</div>
                    <div class="text-xs text-slate-300">This document is recorded on the blockchain.</div>
                    <div class="grid grid-cols-2 text-xs gap-x-2 gap-y-1 mt-2">
                         <span class="text-slate-500">Timestamp:</span> <span>${new Date(Number(timestamp) * 1000).toLocaleString()}</span>
                    </div>
                </div>
            `, "blue");
        } else {
            showResult(`
                <div class="font-bold text-red-400 text-lg">✖ Not Found</div>
                <div class="text-sm">This document hash has not been timestamped on this blockchain.</div>
            `, "red");
        }

    } catch (err) {
        console.error(err);
        showResult(`Error: ${err.reason || err.message}`, "red");
    } finally {
        setLoading(false, "Verify Doc");
    }
});


// --- UI HELPERS ---
function setLoading(isLoading, text) {
    if (isLoading) {
        btnStore.disabled = true;
        btnVerify.disabled = true;
        document.body.style.cursor = "wait";
    } else {
        btnStore.disabled = false;
        btnVerify.disabled = false;
        btnStore.textContent = "2. Store Reference";
        btnVerify.textContent = "3. Verify";
        document.body.style.cursor = "default";
    }
}

function showResult(html, type) {
    elResult.classList.remove("hidden");
    const borderColor = type === "green" ? "border-green-500/50 bg-green-500/10" : (type === "red" ? "border-red-500/50 bg-red-500/10" : "border-blue-500/50 bg-blue-500/10");
    elResult.className = `p-4 rounded-lg border ${borderColor} text-sm space-y-2 animate-fade-in`;
    elResult.innerHTML = html;
}

// Start
init();
