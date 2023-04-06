import { USERSTORAGE_ADDRESS } from "./constants";
import USERSTORAGE_ABI from "../abi/USERSTORAGE.json"
import { ethers } from "ethers";
import Web3Modal from "web3modal";

export const checkIfWalletConnected = async () => {
    try {
        if (!window.ethereum) return console.log("Install metamask")
        const accounts = await window.ethereum.request({
            method: "eth_accounts"
        })
        const firstAccount = accounts[0];
        
        return firstAccount;
    } catch (err) {
        console.log("error while checking wallet", err)
    }
}

export const connectWallet = async() => {
    try {
        if (!window.ethereum) return console.log("Install metamask")
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        })
        const firstAccount = accounts[0];

        if (window.ethereum.networkVersion != 7701) {
            return alert("Switch your network to CANTO testnet (7701) and reload the page.");
        }

        window.location.reload();
        return firstAccount;
    } catch (err) {
        console.log("error while connecting wallet", err)
    }
}

// export const fetchUserStorageContract = (signerOrProvider) => 
//     new ethers.Contract(
//         USERSTORAGE_ADDRESS,
//         USERSTORAGE_ABI,
//         signerOrProvider
//     )

// export const connectingWithUserStorageContract = async () => {
//     try {
//         const web3modal = new Web3Modal();
//         const connection = await web3modal.connect();
//         const provider = new ethers.providers.Web3Provider(connection);
//         const signer = provider.getSigner();
//         const contract = fetchUserStorageContract(signer);

//         return contract;
//     } catch (err) {
//         console.log("err in connectWirhUserStorageContract", err);
//     }
// }

