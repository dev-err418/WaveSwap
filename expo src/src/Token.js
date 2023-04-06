import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";

export const Token = ({ setOpenSettings, slippage, setSlippage, deadline, setDeadline }) => {

    const onChanged = (text, setToken, p) => {
        let newText = '';
        let numbers = '0123456789.';
        if (!p) {
            numbers = '0123456789'
        }
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
        setToken(newText);
    }

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
                backgroundColor: "white",
                width: 300,
                borderRadius: 15,
                padding: 15,

            }} >
                <View style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between"
                }}>
                    <Text style={{fontSize: 20, fontWeight: "600", marginBottom: 15}} >Settings</Text>
                    <TouchableOpacity onPress={() => setOpenSettings(false)}>
                        <Icon name="close" size={20} color="black" />
                    </TouchableOpacity>
                </View>
                <Text>Slippage tolerence</Text>
                <View style={{
                    display: "flex",
                    flexDirection: "row",
                    marginTop: 10
                }} >
                    <Text></Text>
                    <TouchableOpacity style={{
                        padding: 8,
                        borderRadius: 10,
                        backgroundColor: "rgb(43,101,237)",
                    }}>
                        <Text style={{ color: "white" }}>Slippage</Text>
                    </TouchableOpacity>
                    <TextInput
                        value={slippage + " %"}
                        onChange={(e) => onChanged(e.nativeEvent.text, setSlippage, true)}
                        style={{
                            borderRadius: 10,
                            borderColor: "rgb(43,101,237)",
                            borderWidth: 1,
                            paddingLeft: 10,
                            marginLeft: 5,
                            width: "100%"
                        }}
                    />
                </View>
                <View style={{
                    display: "flex",
                    flexDirection: "row",
                    marginTop: 10
                }}>
                    <TextInput
                        value={deadline + " min"}
                        onChange={(e) => onChanged(e.nativeEvent.text, setDeadline, false)}                        
                        style={{
                            borderRadius: 10,
                            borderColor: "rgb(43,101,237)",
                            borderWidth: 1,
                            paddingRight: 10,
                            marginRight: 5,
                            textAlign: "right",
                            width: "100%"
                        }}
                    />
                    <TouchableOpacity style={{
                        padding: 8,
                        borderRadius: 10,
                        backgroundColor: "rgb(43,101,237)",
                    }}>
                        <Text style={{color: "white"}}>deadline</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}