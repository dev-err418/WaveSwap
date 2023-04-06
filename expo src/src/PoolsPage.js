import {View, Text, useWindowDimensions} from "react-native";
import { NavBar } from "./NavBar";
import { useContext, useState } from "react";

import { PoolAdd } from "./PoolAdd"
import { PoolConnect } from "./PoolConnect"
import { SwapTokenContext } from "./SwapContext";

export const PoolsPage = () => {

    const [openModel, setOpenModel] = useState(false);
    const [openTokenBox, setOpenTokenBox] = useState(false);

    const { account, createLiquidityAndPool, tokenData, getAllLiquidity, poolPositions  } = useContext(SwapTokenContext);

    const [closePool, setClosePool] = useState(false);

    const {width} = useWindowDimensions();

    

    return (
        <View> 
            {width < 650 ? (
                <View style={{height: "calc(100vh - 80px)", width: "100vw", display:"flex", justifyContent:"center", alignItems: "center"}} >
                    <Text>Screen too small, not supported for now...</Text>
                </View>
            ): (
                <View>
                    <NavBar openModel={openModel} setOpenModel={setOpenModel} setOpenTokenBox={setOpenTokenBox} openTokenBox={openTokenBox} current={2} />            
                    {closePool ? <PoolAdd 
                        account={account} 
                        setClosePool={setClosePool} 
                        tokenData={tokenData} 
                        openModelTopBar={openModel || openTokenBox} 
                        createLiquidityAndPool={createLiquidityAndPool}
                    /> : <PoolConnect
                        account={account} 
                        setClosePool={setClosePool}
                        getAllLiquidity={getAllLiquidity}
                        setOpenModel={setOpenModel}
                        poolPositions={poolPositions}
                    />}  
                </View>                                       
            )}  
        </View>
    )
}