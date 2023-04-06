import { useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import Icon3 from "react-native-vector-icons/Entypo";
import { FACOTRY_ADDRESS, MAINNET_URL, NON_FUNGIBLE_MANAGER } from "./constants";
import { ethers } from "ethers";
import { checkIfWalletConnected } from "./appFeatures";
import NonfungiblePositionManager from "@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json";
import UniswapV3Factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import UniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"
import { SwapTokenContext } from "./SwapContext";
import { TickMath } from "@uniswap/v3-sdk";
import JSBI from "jsbi";

const sqrtToPrice = (sqrt, decimals0, decimals1, isJsbi=true) => {    
    let numerator;
    if (isJsbi) {
        numerator = Number(JSBI.from(sqrt).toString()) ** 2;
    } else {
        numerator = sqrt ** 2;
    }
    const denominator = 2 ** 192;
    let ratio = numerator / denominator;
    const shiftDecimals = Math.pow(10, decimals0 - decimals1);
    ratio = ratio * shiftDecimals;

    return ratio;
}

const InRange = () => {
    return (
        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: 5, backgroundColor: "rgb(43,101,237)", borderRadius: 8 }}>
            <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: "green", marginRight: 5}} />
            <Text style={{fontSize: 10, color: "white", fontWeight: "600"}}>in range</Text>
        </View>
    )
}

const OutRange = () => {
    return (
        <View style={{ display: "flex", flexDirection: "row", alignItems: "center", padding: 5, backgroundColor: "rgb(43,101,237)", borderRadius: 8 }}>
            <View style={{height: 10, width: 10, borderRadius: 10, backgroundColor: "red", marginRight: 5}} />
            <Text style={{fontSize: 10, color: "white", fontWeight: "600"}}>out of range</Text>
        </View>
    )
}

export const PoolConnect = ({ account, setClosePool, setOpenModel }) => {

    const [loading, setLoading] = useState(false);
    const [poolPositions, setPoolPositions] = useState({});
    const { tokenData } = useContext(SwapTokenContext);

    const fetchingData = async () => {
        try {            
            const userAccount = await checkIfWalletConnected();
            const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);
            

            const manager = new ethers.Contract(
                NON_FUNGIBLE_MANAGER,
                NonfungiblePositionManager.abi,
                provider,
            );

            const factory = new ethers.Contract(
                FACOTRY_ADDRESS,
                UniswapV3Factory.abi,
                provider
            );

            const nftBalance = await manager.connect(provider).balanceOf(userAccount);            

            setLoading(true);
            for (let i = 0; i < Number(nftBalance.toString()); i++) {
                const tokenId = await manager.connect(provider).tokenOfOwnerByIndex(userAccount, i);
                const position = await manager.connect(provider).positions(tokenId);
                const pool = await factory.connect(provider).getPool(position.token0, position.token1, position.fee);

                const poolContract = new ethers.Contract(
                    pool,
                    UniswapV3Pool.abi,
                    provider
                );

                const currentRate = await poolContract.connect(provider).slot0();
                const up = position.tickUpper;
                const low = position.tickLower;

                const upPrice = sqrtToPrice(TickMath.getSqrtRatioAtTick(up), 18, 18);
                const lowPrice = sqrtToPrice(TickMath.getSqrtRatioAtTick(low), 18, 18);
                const currentPrice = sqrtToPrice(currentRate[0], 18, 18, false);                                   

                poolPositions[i] = {
                    token0: position.token0,
                    token1: position.token1,
                    fee: position.fee,
                    liquidity: position.liquidity,
                    minPrice: lowPrice,
                    maxPrice: upPrice,
                    currentPrice: currentPrice
                }


                setPoolPositions({
                    ...poolPositions, [i]: {
                        token0: position.token0,
                        token1: position.token1,
                        fee: position.fee,
                        liquidity: position.liquidity,
                        minPrice: lowPrice,
                        maxPrice: upPrice,
                        currentPrice: currentPrice
                    }
                })
            }            
        } catch (err) {
            console.log("error while fetching data", err);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchingData();
    }, [])

    return (
        <View style={{ height: "calc(100vh - 47px - 15px)", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", zIndex: -1 }}>
            <View
                style={{
                    width: 590,
                    borderRadius: 15,
                    padding: 15,
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 0,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Text style={{ fontSize: 20, fontWeight: "600" }}>Pool</Text>
                    <TouchableOpacity
                        style={{
                            paddingHorizontal: 13,
                            paddingVertical: 13,
                            borderRadius: 15,
                            backgroundColor: "rgb(43,101,237)"
                        }}
                        onPress={() => setClosePool(true)}
                    >
                        <Text style={{ color: "white" }}>+ New position</Text>
                    </TouchableOpacity>
                </View>

                <Icon3 name={"wallet"} color={"rgb(43,101,237)"} size={80} style={{ textAlign: "center", marginTop: 20, marginBottom: 30 }} />
                {
                    // remove -1 for real ...
                    Object.keys(poolPositions).length > 0 ? 
                    <View style={{width: "100%", display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 10}} >
                        <Text style={{ fontSize: 16, fontWeight: "600", textAlign: "left", marginLeft: 15 }}>Positions :</Text>             
                        <Text style={{color: "gray", marginLeft: 10, fontWeight: "600", marginRight: 10}}>(found {Object.keys(poolPositions).length} pools for now)</Text>
                        { loading ? <ActivityIndicator size={"small"} color={"gray"} /> : null}
                    </View> :
                        <Text style={{ marginBottom: account ? 30 : null }}>Your active positions will appear here.</Text>
                }
                
                <ScrollView style={{ height: Object.keys(poolPositions).length >= 3 ? "calc(3* 50px + 3*15px + 15px)" : `calc(${Object.keys(poolPositions).length} * 50px + ${Object.keys(poolPositions).length} * 15px + 15px)`, width: "100%", paddingTop: 10 }}>
                    {Object.keys(poolPositions).map((el, i) => {

                        if (poolPositions[el].token1 == "0xbb23B503C5f05F3Eb2668402e97Ab9181bA4AC60") {
                            return;
                        }

                        const ind = tokenData.findIndex(p => p.tokenAddress.toLowerCase() == poolPositions[el].token0.toLowerCase())
                        const ind1 = tokenData.findIndex(p => p.tokenAddress.toLowerCase() == poolPositions[el].token1.toLowerCase())

                        return (
                            <View key={i} style={{
                                display: "flex",
                                flexDirection: "row",
                                width: "calc(100% - 30px)",
                                justifyContent: "space-between",
                                marginLeft: 15,
                                alignItems: "center",
                                marginBottom: 15,
                                height: 55,
                                borderRadius: 15,
                                padding: 15,
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 0,
                                },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                elevation: 5,

                            }} >
                                <View style={{display:"flex", justifyContent: "space-between"}}>
                                    <Text style={{ fontWeight: "700", marginRight: 30, marginBottom: 5 }}>{ind >= 0 ? tokenData[ind].symbol : null} / {ind1 >= 0 ? tokenData[ind1].symbol : poolPositions[el].token1}</Text>                                
                                    <View style={{display:"flex", flexDirection:"row", alignItems: "center"}} >
                                        <Text style={{fontSize: 12, color: "gray"}} >Min: </Text>
                                        <Text style={{fontSize: 12}}>{Number(poolPositions[el].minPrice).toFixed(4)} {ind >= 0 ? tokenData[ind].symbol : null} per {ind1 >= 0 ? tokenData[ind1].symbol : poolPositions[el].token1} ↔</Text>
                                        <Text style={{fontSize: 12, color: "gray"}}> Max :</Text>
                                        <Text style={{fontSize: 12}}>{Number(poolPositions[el].maxPrice).toFixed(4)} {ind >= 0 ? tokenData[ind].symbol : null} per {ind1 >= 0 ? tokenData[ind1].symbol : poolPositions[el].token1}</Text>
                                        {/* <Text>Min: {Number(poolPositions[el].minPrice).toFixed(4)} {ind >= 0 ? tokenData[ind].symbol : null} per {ind1 >= 0 ? tokenData[ind1].symbol : poolPositions[el].token1}  ↔ Max: {Number(poolPositions[el].maxPrice).toFixed(4)} {ind >= 0 ? tokenData[ind].symbol : null} per {ind1 >= 0 ? tokenData[ind1].symbol : poolPositions[el].token1}</Text>                                 */}
                                    </View>
                                </View>
                                {poolPositions[el].minPrice <= poolPositions[el].currentPrice && poolPositions[el].maxPrice >= poolPositions[el].currentPrice? <InRange /> : <OutRange />}
                            </View>
                        )
                    })}

                </ScrollView>
                {account ? null : (
                    <TouchableOpacity
                        style={{
                            borderRadius: 15,
                            backgroundColor: "rgb(43,101,237)",
                            padding: 15,
                            marginTop: 15,
                        }}
                        onPress={() => setOpenModel(true)}
                    >
                        <Text style={{ color: "white" }}>Connect wallet</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}