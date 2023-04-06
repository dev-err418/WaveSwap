import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useEffect, useState } from "react"
import Icon from "react-native-vector-icons/AntDesign";

export const SearchToken = ({ openToken, tokens, token, tokenData, bannedAddresses, hideCanto=false}) => {
    
    const [allTokens, setAllTokens] = useState([])

    useEffect(() => {
        if (!hideCanto) {        
            const a = tokenData.concat({
                symbol: "CANTO",
                name: "Canto",
                tokenBalance: "",
                tokenAddress: "CANTO"
            })
            setAllTokens(a); 
        } else {
            setAllTokens(tokenData);
        }       
    }, [])

    return (
        <View
            style={{
                position: "fixed",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100vw",
                height: "100vh",
                padding: "none",
                top: 0,
                left: 0,
                backgroundColor: "rgba(25, 25, 25, 0.5)",
            }}
        >
            <View style={{
                position: "absolute",
                width: 400,
                padding: 15,
                backgroundColor: "white",
                borderRadius: 15
            }}>
                <View style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 15
                }}>
                    <Text style={{ fontSize: 20, fontWeight: "600" }}>Select a token</Text>
                    <TouchableOpacity onPress={() => openToken(false)}>
                        <Icon name="close" size={20} color="black" />
                    </TouchableOpacity>
                </View>
                <TextInput 
                    style={{
                        borderRadius: 10,
                        borderColor: "rgb(43,101,237)",
                        borderWidth: 1,
                        paddingLeft: 10,                        
                        width: "100%",
                        outline: "none",
                        height: 40,
                        marginBottom: 15
                    }}
                    placeholder="Search token address" 
                />
                <View style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between"
                }} >
                    {allTokens.map((el, i) => {                    
                        return (
                            <TouchableOpacity
                                disabled={bannedAddresses.includes(el.tokenAddress.toLowerCase()) ? true : false}
                                onPress={() => {                                    
                                    tokens({
                                        name: el.symbol,
                                        image: "",
                                        balance: el.tokenBalance,
                                        address: el.tokenAddress
                                    });
                                    openToken(false)
                                }}
                                key={i}
                                style={{                                    
                                    backgroundColor: token == el.tokenAddress.toLowerCase() ? "rgb(43,101,237)" : bannedAddresses.includes(el.tokenAddress.toLowerCase()) && el.tokenAddress.toLowerCase() != token? "lightgray" : "white",
                                    borderColor: "rgb(43,101,237)",
                                    borderWidth: token == el.tokenAddress.toLowerCase() ? 0 : 1,
                                    borderRadius: 8,
                                    padding: 8,
                                    minWidth: (400 - 30) / 5 - 10,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{
                                    color: token == el.tokenAddress.toLowerCase() ? "white" : "black",
                                }}>{el.symbol}</Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </View>
        </View>
    )
}