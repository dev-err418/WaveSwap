import { View, Text, TouchableOpacity, TextInput, Image, Dimensions, ActivityIndicator } from "react-native";
import { useState, useEffect, useContext } from "react";
import {Token} from "./Token";
import { SearchToken } from "./SearchToken";
import { SwapTokenContext } from "./SwapContext";
import Icon from "react-native-vector-icons/Ionicons";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
import { getOut } from "./fetchPrice";
import { ethers } from "ethers"
import { WCANTO_ADDRESS } from "./constants";

export const SwapSection = ({openModel, setOpenModel}) => {

    const [openSettings, setOpenSettings] = useState(false);
    const [openToken, setOpenToken] = useState(false);
    const [openTokenTwo, setOpenTokenTwo] = useState(false);
    const [firstLoad, setFirstLoad] = useState(false);
    const [slippage, setSlippage] = useState(0.25);
    const [deadline, setDeadline] = useState(10);
    const [swapping, setSwapping] = useState(false);


    const { connectWallet, ether, account, getPrice, tokenData, singleSwapToken, wrapEth, unwrapEth, singleSwapFromEth } = useContext(SwapTokenContext)

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

    const [tokenOneInput, setTokenOneInput] = useState("1.0000");
    const [tokenTwoInput, setTokenTwoInput] = useState("0.0000");
    const [ownedTokenOne, setOwnedTokenOne] = useState("");
    const [ownedTokenTwo, setOwnedTokenTwo] = useState("");
    const [i1, setI1] = useState(0);
    const [i2, setI2] = useState(0);

    const getNewPrice = async () => {
        if (tokenOne.address != "CANTO" && tokenTwo.address != "CANTO") {
            if (Number(tokenOneInput) == 0) {
                return setTokenTwoInput("0.0000")
            }        
            const out = await getOut(tokenOne.address, tokenTwo.address, 500, ethers.utils.parseEther(tokenOneInput));                         
            setTokenTwoInput(Number(ethers.utils.formatEther(out)).toFixed(4).toString())
            setFirstLoad(true);
        } else if (tokenOne.address == "CANTO" && tokenTwo.address != WCANTO_ADDRESS) {
            const out = await getOut(WCANTO_ADDRESS, tokenTwo.address, 500, ethers.utils.parseEther(tokenOneInput));
            setTokenTwoInput(Number(ethers.utils.formatEther(out)).toFixed(4).toString())
            setFirstLoad(true);
        } else if (tokenOne.address != WCANTO_ADDRESS && tokenTwo.address == "CANTO") {
            const out = await getOut(tokenOne.address, WCANTO_ADDRESS, 500, ethers.utils.parseEther(tokenOneInput));
            setTokenTwoInput(Number(ethers.utils.formatEther(out)).toFixed(4).toString())
            setFirstLoad(true);
        } else if ((tokenOne.address == "CANTO" && tokenTwo.address == WCANTO_ADDRESS) || (tokenOne.address == WCANTO_ADDRESS && tokenTwo.address == "CANTO")) {
            setTokenTwoInput(tokenOneInput);
        }
    }

    const checkBalances = () => {
        if (tokenData.length == 3) {
            var i1_ = tokenData.findIndex(function(token) {
                return token.tokenAddress.toLowerCase() == tokenOne.address.toLowerCase();
            });
            var i2_ = tokenData.findIndex(function(token) {
                return token.tokenAddress.toLowerCase() == tokenTwo.address.toLowerCase();
            });                
            if (i1 != -1) {                                    
                setI1(i1_);
            } else {                
                setI1(-1);
            }

            if (i2 != -1) {                
                setI2(i2_)
            } else {                
                setI2(-1);
            }
        } else {                
            setTimeout(checkBalances, 500);
        }
    }

    const checkBalancesAgain = () => {
        // i1
        if (i1 == -1) {
            // tokenA is canto
            // console.log(Number(ether).toFixed(4), ownedTokenOne);
            // if (Number(ether).toFixed(4) == ownedTokenOne) {
            //     // tokenA balance is same (did not change)
            //     setTimeout(checkBalancesAgain, 500);
            // } else {
            //     // tokenA balance changed
            //     setOwnedTokenOne(Number(ether).toFixed(4));
            // }
        } else {
            // tokenA is not canto
            if (Number(tokenData[i1].tokenBalance).toFixed(4) == ownedTokenOne) {
                setTimeout(checkBalancesAgain, 500);
            } else {
                setOwnedTokenOne(Number(tokenData[i1].tokenBalance).toFixed(4));
            }
        }

        if (i2 == -1) {
            // tokenB is canto
            // if (Number(ether).toFixed(4) == ownedTokenOne) {
            //     // tokenA balance is same (did not change)
            //     setTimeout(checkBalancesAgain, 500);
            // } else {
            //     // tokenA balance changed
            //     setOwnedTokenTwo(Number(ether).toFixed(4));
            // }
        } else {
            // tokenA is not canto
            if (Number(tokenData[i2].tokenBalance).toFixed(4) == ownedTokenTwo) {
                setTimeout(checkBalancesAgain, 500);
            } else {
                setOwnedTokenTwo(Number(tokenData[i2].tokenBalance).toFixed(4));
            }
        }
    }

    useEffect(() => {
        if (tokenData.length != 3) {
            return
        }
        if (i1 != -1) {
            setOwnedTokenOne(Number(tokenData[i1].tokenBalance).toFixed(4));
        } else {
            setOwnedTokenOne(Number(ether).toFixed(4))
        }

        if (i2 != -1) {
            setOwnedTokenTwo(Number(tokenData[i2].tokenBalance).toFixed(4));
        } else {
            setOwnedTokenTwo(Number(ether).toFixed(4))
        }
    }, [i1, i2]);

    useEffect(() => {        
        getNewPrice();        
        checkBalances();
    }, [tokenOne.address, tokenTwo.address])

    useEffect(() => {           
        const timer = setTimeout(() => getNewPrice(), 1000);
        return () => clearTimeout(timer);
    }, [tokenOneInput, tokenTwoInput])

    const onChanged = (text) => {
        let newText = '';
        let numbers = '0123456789.';
        let gotPoint = false;
    
        for (var i=0; i < text.length; i++) {
            if(numbers.indexOf(text[i]) > -1) {
                if (!gotPoint || text[i] != ".") {
                    newText = newText + text[i];   
                }
                if (text[i] == ".") {
                    gotPoint = true;
                }                                                                             
            }
        }

        if (newText == "") {
            setTokenOneInput("0")
        } else {
            setTokenOneInput(newText);
        }
    }

    const {width} = Dimensions.get("window");

    return (
        <View style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100vw",
            height: "calc(100vh - 65px)",
            zIndex:  openModel ? -1 : 1           
        }}>            
            { width < 500 ? null : <Image source={require("../img/logo.png")} style={{aspectRatio: 11/3, width: "100vw", position: "fixed", transform: "translateY(-5vh)"}} />}
            <View style={{
                backgroundColor: "white",
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                width: 300,
                borderTopRightRadius: 15,
                borderTopLeftRadius: 15,
                height: 180,
                display: "flex",
                justifyContent: "center"
            }}>
                <TouchableOpacity
                    style={{
                        position: "absolute",
                        top: 15,
                        right: 15
                    }}
                    onPress={() => setOpenSettings(true)}
                >
                    <Icon name="settings-outline" size={25} color="black" />
                </TouchableOpacity>                
                <TouchableOpacity 
                    onPress={() => setOpenToken(true)}
                    style={{
                        textAlign: "center",                        
                    }}
                >
                    <Text style={{
                        fontSize: 20,
                        fontWeight: "500"
                    }}>
                        {tokenOne.name}
                    </Text>
                </TouchableOpacity>
                <Text style={{textAlign: "center", fontSize: 12, color: "rgb(43,101,237)"}}>{ownedTokenOne ? i1 == -1 ? `(${Number(ether).toFixed(4)})` : `(${ownedTokenOne})` : ""}</Text>
                <TextInput 
                    style={{
                        outline: "none",
                        fontSize: 35,
                        fontWeight: "600",
                        textAlign: "center",
                        marginTop: 15
                    }} 
                    value={tokenOneInput} 
                    onChange={(e) => firstLoad ? onChanged(e.nativeEvent.text) : null}  
                    keyboardType="numeric"
                    maxLength={10}                                                         
                />
            </View>
            <View style={{
                backgroundColor: "white",
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                width: 300,
                borderBottomRightRadius: 15,
                borderBottomLeftRadius: 15,
                height: 180,
                marginTop: 4,
                display: "flex",
                justifyContent: "center"
            }}>     
                <TouchableOpacity 
                    style={{
                        position: "absolute",
                        width: 40,
                        height: 40,
                        borderRadius: 40,
                        backgroundColor: "rgb(43,101,237)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        top: "calc(-20px - 2px)",
                        left: "calc(150px - 20px)",

                    }}
                    onPress={() => {
                        const temp = tokenOne;
                        const quantityTemp = tokenOneInput;
                        setTokenOne(tokenTwo);
                        setTokenTwo(temp);
                        setTokenOneInput(tokenTwoInput);
                        setTokenTwoInput(quantityTemp);
                    }}
                >
                    <Icon2 size={30} color={"white"} name="swap-vertical" />
                </TouchableOpacity>                      
                <TouchableOpacity 
                    onPress={() => setOpenTokenTwo(true)}                    
                    style={{
                        textAlign: "center",
                    }}
                >
                    <Text style={{
                        fontSize: 20,
                        fontWeight: "500",                        
                    }}>
                        {tokenTwo.name}
                    </Text>
                </TouchableOpacity>
                <Text style={{textAlign: "center", fontSize: 12, color: "rgb(43,101,237)"}}>{ownedTokenTwo ? i2 == -1 ? `(${Number(ether).toFixed(4)})` : `(${ownedTokenTwo})` : ""}</Text>
                <TextInput 
                    style={{
                        outline: "none",
                        fontSize: 35,
                        fontWeight: "600",
                        textAlign: "center",
                        marginTop: 15
                    }} 
                    editable={false}
                    value={tokenTwoInput} 
                />
            </View>
            
            <TouchableOpacity 
                style={{
                    width: 300,
                    height: 50,
                    marginTop: 15,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 15,
                    backgroundColor: "rgb(43,101,237)",
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
                onPress={async () => {
                    if (!account) {
                        setOpenModel(true);
                    }

                    if (tokenOne.address == "CANTO" && tokenTwo.address == "0xd6307DBAdc6398308307f5E60f2544220B48ba94") {
                        setSwapping(true);
                        await wrapEth(tokenOneInput);
                        setSwapping(false);
                        checkBalancesAgain();
                        
                    } else if (tokenOne.address == "0xd6307DBAdc6398308307f5E60f2544220B48ba94" && tokenTwo.address == "CANTO") {
                        setSwapping(true);
                        await unwrapEth(tokenOneInput);
                        setSwapping(false);
                        checkBalancesAgain();
                    } else {
                        if (tokenOne.address == "CANTO") {
                            setSwapping(true);
                            await singleSwapFromEth(tokenTwo.address, tokenOneInput, slippage * 100, deadline, 500);
                            setSwapping(false);
                            checkBalancesAgain();
                        } else if (tokenTwo.address == "CANTO") {
                            alert("Can't swap to native CANTO in the GUI for now...")
                        } else {
                            setSwapping(true);
                            await singleSwapToken(tokenOne.address, tokenTwo.address, tokenOneInput, slippage * 100, deadline, 500);
                            setSwapping(false);
                            checkBalancesAgain();
                        }
                    }
                }}
            >                
            {
                swapping ? <ActivityIndicator size="small" color="white" /> : <Text style={{color: "white", fontWeight: "600"}}>{account ? (tokenOne.address == "CANTO" && tokenTwo.address == "0xd6307DBAdc6398308307f5E60f2544220B48ba94") ? "Wrap CANTO" : (tokenOne.address == "0xd6307DBAdc6398308307f5E60f2544220B48ba94" && tokenTwo.address == "CANTO") ? "Unwrap WCANTO" : "Swap" : "Connect Wallet"}</Text>
            }                
            </TouchableOpacity>
            
            {
                    openSettings && (
                        <Token setOpenSettings={setOpenSettings} setSlippage={setSlippage} slippage={slippage} deadline={deadline} setDeadline={setDeadline} />
                    )
                }

            {openToken && (
                <SearchToken openToken={setOpenToken} tokens={setTokenOne} token={tokenOne.address.toLowerCase()} tokenData={tokenData} bannedAddresses={[tokenOne.address.toLowerCase(), tokenTwo.address.toLowerCase()]} />
            )}
            
            {openTokenTwo && (
                <SearchToken openToken={setOpenTokenTwo} tokens={setTokenTwo} token={tokenTwo.address.toLowerCase()} tokenData={tokenData} bannedAddresses={[tokenOne.address.toLowerCase(), tokenTwo.address.toLowerCase()]} />
            )}

        </View>
    )
}