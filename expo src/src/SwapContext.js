import { View, Text } from "react-native";
import { useState, useEffect, createContext } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { checkIfWalletConnected, connectingWithUserStorageContract } from "./appFeatures";
import ERC20 from "../abi/ERC20.json";
import WETH9 from "./WETH9.json"
import { FACOTRY_ADDRESS, MAINNET_URL, NON_FUNGIBLE_MANAGER, SWAP_ROUTER_ADDRESS, WCANTO_ADDRESS } from "./constants";
import SwapRouter from "@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"

import { getOut, getPrice } from "./fetchPrice";
import { addLiquidityExternal } from "./addLiquidity";
import { connectingWithPoolContract } from "./deployPool";

export const SwapTokenContext = createContext()

export const SwapTokenContextProvider = ({ children }) => {

    const [account, setAccount] = useState("")
    const [ether, setEther] = useState("")
    const [networkConnect, setNetworkConnect] = useState("");
    const [tokenData, setTokenData] = useState([]);
    const [poolPositions, setPoolPositions] = useState([]);    

    const [getAllLiquidity, setGetAllLiquidity] = useState([]);

    // tokens addresses
    const addToken = [
        // "0x826551890Dc65655a0Aceca109aB11AbDbD7a07B", // WCANTO
        // "0x80b5a32e4f032b2a058b4f29ec95eefeeb87adcd", // USDC 
        // "0xeceeefcee421d8062ef8d6b4d814efe4dc898265", // ATOM
        // "0x4e71a2e537b7f9d9413d3991d37958c0b5e1e503", // NOTE
        // "0x5FD55A1B9FC24967C4dB09C513C3BA0DFa7FF687", // ETH
        // "0xd567B3d7B8FE3C79a1AD8dA978812cfC4Fa05e75" // USDT

        "0x379a16dcBA59bb9bB8244C75e4E1FC8f554A720E", // Usdc (testnet)
        "0xB1F0b69976Cd7EA7e181E07827872738Ba1Eb7D3", // Note (testnet)
        "0xd6307DBAdc6398308307f5E60f2544220B48ba94" // Wcanto (testnet)

    ]

    const checkBalances = async () => {
        const userAccount = await checkIfWalletConnected();
        setAccount(userAccount);
        const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);
        const balance = await provider.getBalance(userAccount);
        setEther(ethers.utils.formatEther(balance));

        addToken.map(async (el, i) => {
            const contract = new ethers.Contract(el, ERC20, provider);
            const userBalance = await contract.balanceOf(userAccount);
            const convertTokenBal = ethers.utils.formatEther(userBalance);
            const index = tokenData.findIndex(p => p.tokenAddress.toLowerCase() == el.toLowerCase());
            tokenData[index]["tokenBalance"] = convertTokenBal;
        })
    }

    const fetchingData = async () => {
        try {
            const userAccount = await checkIfWalletConnected();
            setAccount(userAccount);
            const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);
            const balance = await provider.getBalance(userAccount);
            const network = await provider.getNetwork();
            setNetworkConnect(network.name);
            setEther(ethers.utils.formatEther(balance));

            addToken.map(async (el, i) => {
                const contract = new ethers.Contract(el, ERC20, provider);
                const userBalance = await contract.balanceOf(userAccount);
                const convertTokenBal = ethers.utils.formatEther(userBalance);
                const symbol = await contract.symbol();
                const name = await contract.name();
                console.log(symbol, name, convertTokenBal);

                tokenData.push({
                    name: symbol == "WETH" ? "Wrapped Canto" : name,
                    symbol: symbol == "WETH" ? "WCANTO" : symbol,
                    tokenBalance: convertTokenBal,
                    tokenAddress: el,
                })
            })
        } catch (err) {
            console.log("error while fetching data", err);
        }
    }

    const wrapEth = async (amount) => {
        try {
            const web3modal = new Web3Modal();
            const connection = await web3modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            // const accountAddress = await signer.getAddress();   

            const weth = new ethers.Contract(
                WCANTO_ADDRESS,
                WETH9.abi,
                provider
            );

            const deposit = await weth.connect(signer).deposit(
                {
                    gasLimit: 1000000,
                    value: ethers.utils.parseEther(amount)
                }
            );

            const tx = await deposit.wait();
            console.log(tx)
            alert(`Transaction succeeded, hash: ${tx.transactionHash}`)
            await checkBalances();
        } catch (err) {
            console.log("error while wrapping canto", err)
        }
    }

    const unwrapEth = async (amount) => {
        try {
            const web3modal = new Web3Modal();
            const connection = await web3modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();

            const weth = new ethers.Contract(
                WCANTO_ADDRESS,
                WETH9.abi,
                provider
            );

            const withdraw = await weth.connect(signer).withdraw(
                ethers.utils.parseEther(amount),
                {
                    gasLimit: 1000000,
                }
            );

            const tx = await withdraw.wait();
            console.log(tx)
            alert(`Transaction succeeded, hash: ${tx.transactionHash}`);
            await checkBalances();
        } catch (err) {
            console.log("error while unwrapping canto", err)
        }
    }

    const singleSwapFromEth = async (token2, swapAmount, slippage, deadline, fee) => {
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const accountAddress = await signer.getAddress();

        const swaprouter = new ethers.Contract(
            SWAP_ROUTER_ADDRESS,
            SwapRouter.abi,
            provider
        );

        const out = await getOut(WCANTO_ADDRESS, token2, fee, ethers.utils.parseEther(swapAmount));
        const a = ethers.FixedNumber.from(slippage);
        const b = ethers.FixedNumber.from(100);
        const c = ethers.FixedNumber.from(1).subUnsafe(a.divUnsafe(b))
        const d = ethers.BigNumber.from(c);
        const e = ethers.BigNumber.from(out).mul(d);

        const params = {
            tokenIn: WCANTO_ADDRESS,
            tokenOut: token2,
            fee: fee,
            recipient: accountAddress,
            deadline: Math.floor(Date.now() / 1000) + (60 * deadline),
            amountIn: ethers.utils.parseEther(swapAmount),
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        }

        const data = swaprouter.interface.encodeFunctionData("exactInputSingle", [params]);

        const txArgs = {
            to: SWAP_ROUTER_ADDRESS,
            from: accountAddress,
            data: data,
            value: ethers.utils.parseEther(swapAmount),
            gasLimit: "1000000"
        }

        const tx = await signer.sendTransaction(txArgs);
        const reciept = await tx.wait()
        alert(`Transaction succeeded, hash: ${reciept.transactionHash}`);
        await checkBalances();
    }

    const singleSwapToken = async (token1, token2, swapAmount, slippage, deadline, fee) => {
        console.log(token1, token2, swapAmount, slippage, deadline, fee);
        try {
            const web3modal = new Web3Modal();
            const connection = await web3modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const accountAddress = await signer.getAddress();

            const swaprouter = new ethers.Contract(
                SWAP_ROUTER_ADDRESS,
                SwapRouter.abi,
                provider
            );

            const token = new ethers.Contract(
                token1,
                ERC20,
                provider
            );


            const out = await getOut(token1, token2, fee, ethers.utils.parseEther(swapAmount));
            const a = ethers.FixedNumber.from(slippage);
            const b = ethers.FixedNumber.from(100);
            const c = ethers.FixedNumber.from(1).subUnsafe(a.divUnsafe(b))
            const d = ethers.BigNumber.from(c);
            const e = ethers.BigNumber.from(out).mul(d);

            const params = {
                tokenIn: token1,
                tokenOut: token2,
                fee: fee,
                recipient: accountAddress,
                deadline: Math.floor(Date.now() / 1000) + (60 * deadline),
                amountIn: ethers.utils.parseEther(swapAmount),
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            }


            const approvalResp = await token.connect(signer).approve(
                SWAP_ROUTER_ADDRESS,
                ethers.utils.parseEther(swapAmount)
            );

            console.log(approvalResp)
            console.log(params)


            const transaction = await swaprouter.connect(signer).exactInputSingle(
                params,
                {
                    gasLimit: 2000000
                }
            );

            console.log(transaction)

            const tx = await transaction.wait();
            console.log(tx);
            alert(`Transaction succeeded, hash: ${tx.transactionHash}`);

            await checkBalances();

        } catch (err) {
            console.log("error while single swapping", err);
        }
    }

    useEffect(() => {
        fetchingData();
    }, [])


    return (
        <SwapTokenContext.Provider value={{ account, networkConnect, ether, tokenData, singleSwapToken, wrapEth, unwrapEth, singleSwapFromEth, checkBalances }}>
            {children}
        </SwapTokenContext.Provider>
    )
}





// {
//     "hash": "0x6802d710b8c5b74782810699ed77ac1e62fa74823fd7f455701f7bf1859591dc",
//     "type": 2,
//     "accessList": null,
//     "blockHash": null,
//     "blockNumber": null,
//     "transactionIndex": null,
//     "confirmations": 0,
//     "from": "0x8F4AB0bD3586EdD445e4e6cD75FC0bcE9e3dD0C0",
//     "gasPrice": {
//         "type": "BigNumber",
//         "hex": "0x01238103e800"
//     },
//     "maxPriorityFeePerGas": {
//         "type": "BigNumber",
//         "hex": "0x77359400"
//     },
//     "maxFeePerGas": {
//         "type": "BigNumber",
//         "hex": "0x01238103e800"
//     },
//     "gasLimit": {
//         "type": "BigNumber",
//         "hex": "0x1e8480"
//     },
//     "to": "0xD51C75be4C264b48724F7913fa142b22b2A8D497",
//     "value": {
//         "type": "BigNumber",
//         "hex": "0x00"
//     },
//     "nonce": 209,
//     "data": "0x414bf389000000000000000000000000d6307dbadc6398308307f5e60f2544220b48ba94000000000000000000000000b1f0b69976cd7ea7e181e07827872738ba1eb7d300000000000000000000000000000000000000000000000000000000000001f40000000000000000000000008f4ab0bd3586edd445e4e6cd75fc0bce9e3dd0c000000000000000000000000000000000000000000000000000000000642863a30000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
//     "r": "0x2e55a50b043ea330c8894c19e43f39188339323653aaabb6926709adc17fc8cc",
//     "s": "0x1205e0a2a491027d401545c9d8ae4d66e08827ebe4cd6a880751f2289b7a7e72",
//     "v": 1,
//     "creates": null,
//     "chainId": 0
// }



////////////



// {
//     "hash": "0x3298c949ce219490b3db0cf3e4b9d82c1f13f7f95c897d0ee04348dc8cabf016",
//     "type": 2,
//     "accessList": null,
//     "blockHash": null,
//     "blockNumber": null,
//     "transactionIndex": null,
//     "confirmations": 0,
//     "from": "0x8F4AB0bD3586EdD445e4e6cD75FC0bcE9e3dD0C0",
//     "gasPrice": {
//         "type": "BigNumber",
//         "hex": "0x01238103e800"
//     },
//     "maxPriorityFeePerGas": {
//         "type": "BigNumber",
//         "hex": "0x77359400"
//     },
//     "maxFeePerGas": {
//         "type": "BigNumber",
//         "hex": "0x01238103e800"
//     },
//     "gasLimit": {
//         "type": "BigNumber",
//         "hex": "0x1e8480"
//     },
//     "to": "0xD51C75be4C264b48724F7913fa142b22b2A8D497",
//     "value": {
//         "type": "BigNumber",
//         "hex": "0x00"
//     },
//     "nonce": 211,
//     "data": "0x414bf389000000000000000000000000379a16dcba59bb9bb8244c75e4e1fc8f554a720e000000000000000000000000b1f0b69976cd7ea7e181e07827872738ba1eb7d300000000000000000000000000000000000000000000000000000000000001f40000000000000000000000008f4ab0bd3586edd445e4e6cd75fc0bce9e3dd0c000000000000000000000000000000000000000000000000000000000642863e80000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
//     "r": "0x4548e6ef329089ce07e33241a86696d69f8189a7ac4c251efd83d6f3d48672c1",
//     "s": "0x0220126cca6540a4d72a0a90d787bd0b1bbe758428574212f702a68160b2905a",
//     "v": 1,
//     "creates": null,
//     "chainId": 0
// }