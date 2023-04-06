import { TouchableOpacity, View, Text } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import { connectWallet } from "./appFeatures";

export const Model = ({setOpenModel, a}) => {
    
    const walletMenu = ["Metamask"]
    
    return (
        <View style={{
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
        }}>
            <View style={{
                backgroundColor: "white",
                borderRadius: 15,
                padding: 15,                 
            }} >
                <View style={{
                    display:"flex",
                    flexDirection: "row",
                    justifyContent: "space-between",                    
                }}>
                    <Text style={{fontSize: 20, fontWeight: "600", marginBottom: 15}}>Connect a wallet</Text>
                    <TouchableOpacity onPress={() => setOpenModel(false)}>
                        <Icon name="close" size={20} color="black" />
                    </TouchableOpacity>
                </View>
                <View style={{
                    display: "flex",
                    alignItems: "center"
                }} >
                    {walletMenu.map((el, i) => {
                        return (
                            <TouchableOpacity 
                                key={i} 
                                onPress={async () => {
                                    await connectWallet();
                                    setOpenModel(false);
                                }}
                                style={{
                                    paddingVertical: 15,
                                    borderRadius: 15,
                                    width: "calc(100%)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginTop: 15,
                                    backgroundColor: "rgb(43,101,237)",
                                }}
                            >
                                <Text style={{color: "white"}}>
                                    {el}
                                </Text>                        
                            </TouchableOpacity>
                        )
                    })}
                </View>
                <Text style={{marginTop: 15, textAlign: "center"}}>{`By connecting your wallet you become solely responsible\nfor the actions you perform on WaveSwap.`}</Text>
            </View>
        </View>
    )
}