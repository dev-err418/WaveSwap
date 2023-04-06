import { View, Text } from "react-native";
import {useEffect, useState} from "react";
import { NavBar } from "./NavBar";
import { SwapSection } from "./SwapSection"
import { checkIfWalletConnected, connectWallet } from "./appFeatures";

const Home = () => {

    const [openModel, setOpenModel] = useState(false);
    const [openTokenBox, setOpenTokenBox] = useState(false);

    return (
        <View>
            <NavBar openModel={openModel} setOpenModel={setOpenModel} setOpenTokenBox={setOpenTokenBox} openTokenBox={openTokenBox} current={0} />
            <SwapSection accounts="hey" tokenData="DATA" openModel={openModel || openTokenBox} setOpenModel={setOpenModel} />
        </View>
    );
};

export default Home;
