import { View, Text, TextInput, TouchableOpacity, Dimensions } from "react-native";
import { useContext, useEffect, useState } from "react";
import { useNavigation } from '@react-navigation/native';

import { Model } from "./Model";
import { TokenList } from "./TokenList";
import { SwapTokenContext } from "./SwapContext";

export const NavBar = ({openModel, setOpenModel, openTokenBox, setOpenTokenBox, current}) => {
    const menuItems = [
        {
            name: "Swap",
            link: "/"
        },
        {
            name: "Tokens",
            link: "/"
        },
        {
            name: "Pools",
            link: "/"
        }
    ]      
    
    const navigation = useNavigation()
    const { ether, account, networkConnect, connectWallet, tokenData } = useContext(SwapTokenContext)

    const {width} = Dimensions.get("window")

    return (
        <View style={{
            display: "flex",
            flexDirection: "row",
            width: "100vw",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 15,
            paddingHorizontal: 15,            
        }} >
            {
                width < 500 ? <Text></Text> : <Text style={{fontWeight: "800", fontSize: 22, color: "rgb(43,101,237)"}}>WaveSwap</Text>
            }
            <View style={{
                display: "flex",
                flexDirection: "row",  
                paddingHorizontal: 2,
                paddingVertical: 2,
                borderRadius: 15,
                borderColor: "rgb(43,101,237)",
                borderWidth: 1,  
                position: "absolute",
                left: "50vw",
                transform: "translateX(-50%)",
            }}>                
                {
                    menuItems.map((el, i) => {                        
                        return (
                            <TouchableOpacity 
                                key={i}
                                style={{
                                    paddingHorizontal: 13,
                                    paddingVertical: 13,
                                    borderRadius: 15,
                                    backgroundColor: current == i ? "rgb(43,101,237)" : "none"
                                }}
                                onPress={() => navigation.navigate(el.name)}
                            >
                                <Text style={{color: current == i ? "white" : "black"}}>{el.name}</Text>
                            </TouchableOpacity>
                        )
                    })
                }
            </View>
            <View 
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center"
                }}
            >
                {
                    width > 750 ?
                    <Text style={{ marginRight: 10, fontWeight: "600", color: "rgb(43,101,237)" }} >{Number(ether).toFixed(4)} CANTO</Text> : null
                }
                <TouchableOpacity 
                    onPress={() => {
                        if (!account) {
                            setOpenModel(true);
                        } else {
                            setOpenTokenBox(!openTokenBox);
                        }
                    }}                 
                    style={{ 
                        borderRadius: 15,
                        backgroundColor: "rgb(43,101,237)",
                        padding: 15
                    }}
                >
                    <Text style={{color: "white"}}>{account ? String(account).substring(0,7) + "..." + String(account).slice(-3) : "Connect"}</Text>
                </TouchableOpacity>
            </View>
            {
                openModel && (
                    <Model setOpenModel={setOpenModel} connectWallet={connectWallet} />
                )
            }
            {
                openTokenBox && (
                    <TokenList tokenData={tokenData} setOpenTokenBox={setOpenTokenBox} />
                )
            }
        </View>
    )
}