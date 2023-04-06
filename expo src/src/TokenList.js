import { View, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";

export const TokenList = ({ tokenData, setOpenTokenBox }) => {
    return (
        <View style={{
            position: "absolute",
            right: 0,
            top: 60,
            marginRight: 15,
            backgroundColor: "white",
            padding: 15,
            borderRadius: 15,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        }}>
            <View
                style={{
                    display: "flex",
                    flexDirection: "row",
                    minWidth: 200,
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 15
                }}
            >
                <Text style={{fontSize: 20, fontWeight: "600" }}>Your token list</Text>
                <TouchableOpacity onPress={() => setOpenTokenBox(false)}>                    
                    <Icon name="close" size={20} color="black" />
                </TouchableOpacity>
            </View>
            {
                tokenData.map((el, i) => {
                    return (
                        <View
                            key={i}
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: 10
                            }}
                        >
                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }} >
                                <Text
                                    style={{
                                        padding: 8,
                                        backgroundColor: "rgb(43,101,237)",
                                        borderRadius: 10,
                                        color: "white"
                                    }}
                                >{el.symbol}</Text>
                                <Text style={{ marginHorizontal: 15 }}>{Number(el.tokenBalance).toFixed(6)}</Text>
                            </View>
                            <Text style={{ color: "rgb(43,101,237)" }}>{el.name}</Text>
                        </View>
                    )
                })
            }

        </View>
    )
}