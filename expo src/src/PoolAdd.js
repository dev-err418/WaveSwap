import { useEffect, useState } from "react";
import { Token } from "./Token";
import { SearchToken } from "./SearchToken";
import { TouchableOpacity, View, Text, TextInput } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import Icon2 from "react-native-vector-icons/Ionicons";
import Icon3 from "react-native-vector-icons/Entypo";
import { addLiquidityExternal } from "./addLiquidity";
import { TickMath } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { ethers } from "ethers";
import { FACOTRY_ADDRESS, MAINNET_URL } from "./constants";
import UniswapV3Factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import UniswapV3Pool from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"
 
const sqrtToPrice = (sqrt, decimals0, decimals1) => {    
    const numerator = sqrt ** 2;
    const denominator = 2 ** 192;
    let ratio = numerator / denominator;
    const shiftDecimals = Math.pow(10, decimals0 - decimals1);
    ratio = ratio * shiftDecimals;

    return ratio;
}

const priceToSqrt = (price, decimals0, decimals1) => {    
    return Math.sqrt((price / Math.pow(10, decimals0 - decimals1)) * 2 ** 192);
}

export const PoolAdd = ({openModelTopBar, setClosePool, account, tokenData, createLiquidityAndPool}) => {

    const [openModel, setOpenModel] = useState(false); // not used
    const [openTokenModelOne, setOpenTokenModelOne] = useState(false);
    const [openTokenModelTwo, setOpenTokenModelTwo] = useState(false);
    const [active, setActive] = useState(1);
    const [openFee, setOpenFee] = useState(false);
    const [minPrice, setMinPrice] = useState(0.0000);
    const [maxPrice, setMaxPrice] = useState(0.0000);
    const [ownedTokenOne, setOwnedTokenOne] = useState("");
    const [ownedTokenTwo, setOwnedTokenTwo] = useState("");    

    const feePairs = [
        {
            fee: "0.05%",
            info: "Stable",
            number: "0% select",
            feeSystem: 500
        },
        {
            fee: "0.3%",
            info: "Standard",
            number: "0% select",
            feeSystem: 3000
        },
        {
            fee: "1%",
            info: "Volatile",
            number: "0% select",
            feeSystem: 10000
        }
    ]

    const minPriceRange = (text) => {
        if (text == "+") {
            setMinPrice(minPrice + 1);
        } else if (text == "-") {
            setMinPrice(minPrice - 1);
        }
    }

    const maxPriceRange = (text) => {
        if (text == "+") {
            setMaxPrice(maxPrice + 1);
        } else if (text == "-") {
            setMaxPrice(maxPrice - 1);
        }
    }

    const [fee, setFee] = useState(500);
    const [slippage, setSlippage] = useState(0.25);
    const [deadline, setDeadline] = useState(10);
    // const [tokenAmountOne, setTokenAmountOne] = useState(0);
    // const [tokenAmountTwo, setTokenAmountTwo] = useState(0);
    const [tokenInputOne, setTokenInputOne] = useState("");
    const [tokenInputTwo, setTokenInputTwo] = useState("");    

    const [currentPrice, setCurrentPrice] = useState(-1);

    const [tokenOne, setTokenOne] = useState({
        name: "WCANTO",
        image: "",
        address: "0xd6307DBAdc6398308307f5E60f2544220B48ba94",        
        balance: 0
    })
    const [tokenTwo, setTokenTwo] = useState({
        name: "NOTE",
        image: "",
        address: "0xB1F0b69976Cd7EA7e181E07827872738Ba1Eb7D3",
        balance: 0
    })

    const getPrice = async () => {
        setCurrentPrice(-1);
        const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);
        const factory = new ethers.Contract(
            FACOTRY_ADDRESS,
            UniswapV3Factory.abi,
            provider
        );

        // should be fee instead of 500 !!!
        const poolAddress = await factory.connect(provider).getPool(tokenOne.address, tokenTwo.address, 500);

        const pool = new ethers.Contract(
            poolAddress,
            UniswapV3Pool.abi,
            provider
        );

        const slot0 = await pool.connect(provider).slot0();
        const sqrtPrice = slot0.sqrtPriceX96;

        const price = sqrtToPrice(sqrtPrice, 18, 18);

        console.log(price);
        setCurrentPrice(Number(price).toFixed(4))
    }

    useEffect(() => {
        getPrice();
    }, [tokenOne.address, tokenTwo.address])

    // useEffect(() => {
        // TickMath.getTickAtSqrtRatio();
        // const a = priceToSqrt(1.5, 18, 18);
        // console.log(JSBI.BigInt(a));
        // console.log(TickMath.MAX_TICK, TickMath.MIN_TICK, TickMath.getTickAtSqrtRatio( JSBI.BigInt(a) ),);
    // }, []);    

    useEffect(() => {                      
        const checkBalances = () => {
            if (tokenData.length == 3) {
                var i1 = tokenData.findIndex(function(token) {
                    return token.tokenAddress.toLowerCase() == tokenOne.address.toLowerCase();
                });
                var i2 = tokenData.findIndex(function(token) {
                    return token.tokenAddress.toLowerCase() == tokenTwo.address.toLowerCase();
                });
                if (i1 != -1) {                    
                    setOwnedTokenOne(Number(tokenData[i1].tokenBalance).toFixed(4));
                } else {
                    setOwnedTokenOne(Number(ether).toFixed(4));
                }

                if (i2 != -1) {
                    setOwnedTokenTwo(Number(tokenData[i2].tokenBalance).toFixed(4));
                } else {
                    setOwnedTokenTwo(Number(ether).toFixed(4));
                }
            } else {                
                setTimeout(checkBalances, 500);
            }
        }
        
        checkBalances();
    }, [tokenOne.address, tokenTwo.address])

    const onChanged = (text, setToken, fixed=false) => {
        let newText = '';
        let numbers = '0123456789.';
        let gotPoint = false;
        let j = 0;
    
        for (var i=0; i < text.length; i++) {
            if(numbers.indexOf(text[i]) > -1) {
                if (!gotPoint || text[i] != ".") {
                    if (fixed && gotPoint) {
                        if (j < 4) {
                            newText = newText + text[i]; 
                            j++;  
                        }
                    } else {
                        newText = newText + text[i];  
                    }
                }
                if (text[i] == ".") {
                    gotPoint = true;
                }                                                                             
            }
        }

        if (newText == "") {
            setToken("0")
        } else {
            setToken(newText);
        }
        
    }


    return (
        <View style={{ height: "calc(100vh - 47px - 15px)", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", zIndex: openModelTopBar ? -1 : 1 }} >
            <View style={{
                width: 590,
                maxWidth: "calc(100vw - 30px)",
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,

                borderRadius: 15,
                padding: 15,                
            }}>
                {/* top view */}
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <TouchableOpacity onPress={() => setClosePool(false)}>
                        <Icon name="arrowleft" size={25} color={"black"} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, fontWeight: "600" }}>Add liquidity</Text>
                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }} >
                        <TouchableOpacity style={{ marginRight: 10 }} onPress={() => {
                            setActive(1);
                            setFee(500);
                            setSlippage(0.25);
                            setDeadline(10);
                            setTokenInputOne("");
                            setTokenInputTwo("");
                            setMinPrice(0);
                            setMaxPrice(0);
                        }}>
                            <Text style={{ color: "rgb(43,101,237)" }}>clear all</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setOpenModel(true)}>
                            <Icon2 name="settings-outline" size={25} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 20 }}>
                    {/* left */}
                    <View style={{ width: "calc(50% - 10px)" }} >
                        <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 15, marginTop: 25 }} >Select pair</Text>
                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                            <TouchableOpacity onPress={() => setOpenTokenModelOne(true)} style={{
                                backgroundColor: "rgb(43,101,237)",
                                borderRadius: 15,
                                width: "calc(50% - 7.5px)",
                                height: 40,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <Text style={{ color: "white", fontWeight: "500" }}>{tokenOne.name}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setOpenTokenModelTwo(true)} style={{
                                backgroundColor: "rgb(43,101,237)",
                                borderRadius: 15,
                                width: "calc(50% - 7.5px)",
                                height: 40,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center"
                            }}>
                                <Text style={{ color: "white", fontWeight: "500" }}>{tokenTwo.name}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginTop: 15,
                            borderColor: "rgb(43,101,237)",
                            borderWidth: 1,
                            padding: 10,
                            borderRadius: 15
                        }} >
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: "500" }} >Fee tier</Text>
                                <Text>The % you will earn in fees</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    if (openFee) {
                                        setOpenFee(false)
                                    } else {
                                        setOpenFee(true)
                                    }
                                }}

                                style={{
                                    padding: 10,
                                    borderRadius: 10,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backgroundColor: "rgb(43,101,237)"
                                }}
                            >
                                <Text style={{ fontWeight: "500", color: "white" }} >{openFee ? "Hide" : "Open"}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                            {openFee &&

                                feePairs.map((el, i) => {
                                    return (
                                        <TouchableOpacity 
                                            key={i + 1} 
                                            onPress={() => {
                                                setActive(i + 1),
                                                setFee(el.feeSystem)
                                            }} 
                                            style={{
                                                backgroundColor: active == i + 1 ? "rgb(43,101,237)" : "none",
                                                borderRadius: 10,
                                                padding: 10,
                                                borderColor: active != i + 1 ? "rgb(43,101,237)" : "none",
                                                borderWidth: active != i + 1 ? 1 : 0,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center"
                                            }}
                                        >
                                            <Text style={{ color: active == i + 1 ? "white" : "black" }}>{el.fee}</Text>
                                            {/* <Text>{active == i + 1 ? <Text>"bruk"</Text> : null}</Text> */}
                                            <Text style={{ marginTop: 2, color: active == i + 1 ? "white" : "black" }}>{el.info}</Text>
                                            {/* <Text>{el.number}</Text> */}
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </View>
                        <View>
                            <Text style={{ fontSize: 16, fontWeight: "500", marginVertical: 10 }}>Deposit amounts</Text>
                            <View style={{ display: "flex", flexDirection: "row" }}>
                                <TextInput value={tokenInputOne} onChange={(e) => onChanged(e.nativeEvent.text, setTokenInputOne)} placeholder={ownedTokenOne} placeholderTextColor={"darkgray"} style={{
                                    paddingLeft: 10,
                                    fontSize: 20,
                                    borderColor: "rgb(43,101,237)",
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    height: 40,
                                    fontWeight: "300",
                                    width: "100%",                                    
                                }} />
                                <View style={{ height: 40, padding: 10, borderRadius: 10, backgroundColor: "rgb(43,101,237)", position: "absolute", right: 0 }} >
                                    <Text style={{ color: "white" }}>{tokenOne.name}</Text>
                                </View>
                            </View>
                            <View style={{ display: "flex", flexDirection: "row", marginTop: 5 }}>
                                <TextInput value={tokenInputTwo} onChange={(e) => onChanged(e.nativeEvent.text, setTokenInputTwo)} placeholder={ownedTokenTwo} placeholderTextColor={"darkgray"} style={{
                                    paddingLeft: 10,
                                    fontSize: 20,
                                    borderColor: "rgb(43,101,237)",
                                    borderWidth: 1,
                                    borderRadius: 10,
                                    height: 40,
                                    fontWeight: "300",
                                    // width: "100%"
                                }} />
                                <View style={{ height: 40, padding: 10, borderRadius: 10, backgroundColor: "rgb(43,101,237)", position: "absolute", right: 0 }} >
                                    <Text style={{ color: "white" }}>{tokenTwo.name}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    {/* right */}

                    <View style={{ width: "calc(50% - 10px)" }} >
                        <Text style={{ fontSize: 16, fontWeight: "500", marginVertical: 10 }}>Set price range</Text>
                        {currentPrice != -1 ? <Text>Current price : {currentPrice} {tokenOne.name} per {tokenTwo.name}</Text> : null}
                        <Icon3 name={"wallet"} color={"rgb(43,101,237)"} size={80} style={{ textAlign: "center", marginVertical: 10 }} />                        
                        <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }} >
                            <View style={{
                                width: "calc(50% - 7.5px)",
                                borderRadius: 10,
                                borderColor: "rgb(43,101,237)",
                                borderWidth: 1,
                                justifyContent: "center",
                                alignItems: "center",
                                display: "flex",
                                marginTop: 10,
                                paddingTop: 5
                            }}>
                                <Text>Min price</Text> 
                                <TextInput style={{height: 30, width: "calc(100% - 20px)", textAlign: "center", marginVertical: 5}} value={minPrice} onChange={(e) => onChanged(e.nativeEvent.text, setMinPrice, true)} />                               
                                {/* <TouchableOpacity style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5, width: "calc(100% - 30px)" }} onPress={(e) => minPriceRange(e.target.innerText)}>
                                    <View style={{backgroundColor: "rgb(43,101,237)", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10}} ><Text style={{color: "white"}}>-</Text></View>
                                        <Text>{minPrice}</Text>
                                    <View style={{backgroundColor: "rgb(43,101,237)", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10}}><Text style={{color: "white"}}>+</Text></View>
                                </TouchableOpacity> */}
                                <Text style={{ fontSize: 12, marginTop: 4 }}>WCANTO / USDC</Text>
                            </View>
                            <View style={{
                                width: "calc(50% - 7.5px)",
                                borderRadius: 10,
                                borderColor: "rgb(43,101,237)",
                                borderWidth: 1,
                                justifyContent: "center",
                                alignItems: "center",
                                display: "flex",                                
                                marginTop: 10,
                                paddingTop: 5
                            }}>
                                <Text>Max price</Text>
                                {/* <TouchableOpacity style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5, width: "calc(100% - 30px)" }} onPress={(e) => maxPriceRange(e.target.innerText)}> */}
                                <TextInput style={{height: 30, width: "calc(100% - 20px)", textAlign: "center", marginVertical: 5}} value={maxPrice} onChange={(e) => onChanged(e.nativeEvent.text, setMaxPrice, true)} />
                                    {/* <View style={{backgroundColor: "rgb(43,101,237)", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10}} ><Text style={{color: "white"}}>-</Text></View>
                                        <Text>{maxPrice}</Text>
                                    <View style={{backgroundColor: "rgb(43,101,237)", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 10}}><Text style={{color: "white"}}>+</Text></View> */}
                                    {/* <TextInput keyboardType="number" placeholder="0.000" min="0.000" step="0.001" onChange={(e) => setMaxPrice(e.target.value)} /> */}
                                {/* </TouchableOpacity> */}
                                <Text style={{ fontSize: 12, marginTop: 4 }}>WCANTO / USDC</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={{ width: "100%", height: 30, borderRadius: 10, backgroundColor: "rgb(43,101,237)", marginTop: 10, display: "flex", justifyContent: "center", alignItems: "center" }} 
                            onPress={() => {
                                if (tokenInputOne == 0 || tokenInputTwo == 0) {
                                    return alert("Quantities can't be equal to zero.");
                                }
                                addLiquidityExternal(
                                    tokenOne.address,
                                    tokenTwo.address,
                                    500,
                                    tokenInputOne,
                                    tokenInputTwo,
                                    TickMath.MIN_TICK,
                                    TickMath.MAX_TICK,
                                    deadline
                                )
                            }}
                        >
                            <Text style={{ color: "white" }}>Add full range</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => {
                                if (maxPrice < minPrice) {
                                    return alert("The minimum price should be less than the maximum price !")
                                } else if (minPrice == 0) {
                                    return alert("The minimum price should not be 0 !");
                                } else if (tokenInputOne == 0 || tokenInputTwo == 0) {
                                    return alert("Quantities can't be equal to zero.")
                                }                                                               
                                                      
                                addLiquidityExternal(
                                    tokenOne.address,
                                    tokenTwo.address,
                                    500,
                                    tokenInputOne,
                                    tokenInputTwo,
                                    TickMath.getTickAtSqrtRatio(JSBI.BigInt(priceToSqrt(minPrice, 18, 18))),
                                    TickMath.getTickAtSqrtRatio(JSBI.BigInt(priceToSqrt(maxPrice, 18, 18))),
                                    deadline
                                )
                            }} 
                            style={{ width: "100%", height: 50, borderRadius: 10, backgroundColor: "rgb(43,101,237)", marginTop: 10, display: "flex", justifyContent: "center", alignItems: "center" }} >
                            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }} >Add liquidity</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {
                    openModel && (
                        <Token setOpenSettings={setOpenModel} setSlippage={setSlippage} slippage={slippage} deadline={deadline} setDeadline={setDeadline} />
                    )
                }

                {
                    openTokenModelOne && (
                        <SearchToken hideCanto={true} tokens={setTokenOne} tokenData={tokenData} openToken={setOpenTokenModelOne} token={tokenOne.address.toLowerCase()} bannedAddresses={[tokenOne.address.toLowerCase(), tokenTwo.address.toLowerCase()]} />
                    )

                
                }

                {
                    openTokenModelTwo && (
                        <SearchToken hideCanto={true} tokens={setTokenTwo} tokenData={tokenData} openToken={setOpenTokenModelTwo} token={tokenTwo.address.toLowerCase()} bannedAddresses={[tokenOne.address.toLowerCase(), tokenTwo.address.toLowerCase()]} />
                    )
                }
            </View>
        </View>
    )
}