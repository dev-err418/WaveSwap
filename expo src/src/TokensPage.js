import { useEffect, useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity } from "react-native";
import { NavBar } from "./NavBar";
import { ethers } from "ethers";
import { MAINNET_URL } from "./constants";
const UniswapV3Pool = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json")

const numberWithSpaces = (x) => {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return parts.join(".");
}

export const TokensPage = () => {

    const [openModel, setOpenModel] = useState(false);
    const [openTokenBox, setOpenTokenBox] = useState(false);
    const [vol, setVol] = useState({
        "0x379a16dcBA59bb9bB8244C75e4E1FC8f554A720E": {
            volume: "loading...",
            swaps: "loading..."
        },
        "0xd6307DBAdc6398308307f5E60f2544220B48ba94": {
            volume: "loading...",
            swaps: "loading..."
        },
        "0xB1F0b69976Cd7EA7e181E07827872738Ba1Eb7D3": {
            volume: "loading...",
            swaps: "loading..."
        },
    });

    const [allTokenList, setAllTokenList] = useState([
        {
            number: 1,
            id: "canto",
            image: "https://raw.githubusercontent.com/Canto-Network/list/main/logos/token-logos/token/canto.png",
            name: "wCANTO",
            symbol: "WCANTO",
            address: "0xd6307DBAdc6398308307f5E60f2544220B48ba94"
        },
        {
            number: 2,
            id: "note",
            image: "https://raw.githubusercontent.com/Canto-Network/list/main/logos/token-logos/token/note.svg",
            name: "Note",
            symbol: "NOTE",
            address: "0xB1F0b69976Cd7EA7e181E07827872738Ba1Eb7D3"
        },
        {
            number: 3,
            id: "usd-coin",
            image: "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png?1547042389",
            name: "Usdc",
            symbol: "USDC",
            address: "0x379a16dcBA59bb9bB8244C75e4E1FC8f554A720E"
        }
    ])
    const [copyAllTokenList, setCopyAllTokenList] = useState(allTokenList);
    const [search, setSearch] = useState("");
    const [searchItem, setSearchItem] = useState(search);

    const [prices, setPrices] = useState({});

    useEffect(() => {
        var obj = {};
        for (let i = 0; i < allTokenList.length; i++) {
            const el = allTokenList[i];
            fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${el.id}&vs_currencies=usd`)
                .then((data) => data.json())
                .then(data => {
                    const k = el.address;                    
                    obj[k] = data[el.id].usd;
                })
        }
        // console.log(obj);
        setPrices(obj);
    }, [])

    useEffect(() => {
        const main = async () => {

            const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);

            var volume = {
                "0xAf37e8525E6bb1ac8095ccDD07360a63a480DD3A": {
                    token0: "0x379a16dcBA59bb9bB8244C75e4E1FC8f554A720E",
                    token1: "0xd6307DBAdc6398308307f5E60f2544220B48ba94",
                    volume0: 0,
                    volume1: 0,
                    swaps: 0
                },
                "0x9B289151b006F51359e46b61587892989DE7A670": {
                    token0: "0x379a16dcBA59bb9bB8244C75e4E1FC8f554A720E",
                    token1: "0xB1F0b69976Cd7EA7e181E07827872738Ba1Eb7D3",
                    volume0: 0,
                    volume1: 0,
                    swaps: 0
                },
                "0xbFb490aC8f9B17d26106d66361C36Ee0BB0f691d": {
                    token0: "0xB1F0b69976Cd7EA7e181E07827872738Ba1Eb7D3",
                    token1: "0xd6307DBAdc6398308307f5E60f2544220B48ba94",
                    volume0: 0,
                    volume1: 0,
                    swaps: 0
                },
            };

            const keys = Object.keys(volume);

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];

                const contract = new ethers.Contract(
                    key,
                    UniswapV3Pool.abi,
                    provider
                );

                let eventFilter = contract.filters.Swap();
                let events = await contract.queryFilter(eventFilter, -9995, "latest");

                for (let j = 0; j < events.length; j++) {
                    const amount0 = ethers.utils.formatEther(events[j].args.amount0).toString();
                    const amount1 = ethers.utils.formatEther(events[j].args.amount1).toString();

                    volume[key]["volume0"] += Math.abs(amount0);
                    volume[key]["volume1"] += Math.abs(amount1);
                    volume[key]["swaps"] += 1
                }
            }

            var volumes = {
                "0x379a16dcBA59bb9bB8244C75e4E1FC8f554A720E": {
                    volume: 0,
                    swaps: 0
                },
                "0xd6307DBAdc6398308307f5E60f2544220B48ba94": {
                    volume: 0,
                    swaps: 0
                },
                "0xB1F0b69976Cd7EA7e181E07827872738Ba1Eb7D3": {
                    volume: 0,
                    swaps: 0
                },
            }

            for (let i = 0; i < keys.length; i++) {
                volumes[volume[keys[i]].token0].volume += volume[keys[i]].volume0;
                volumes[volume[keys[i]].token1].volume += volume[keys[i]].volume1;
                volumes[volume[keys[i]].token0].swaps += volume[keys[i]].swaps;
                volumes[volume[keys[i]].token1].swaps += volume[keys[i]].swaps;

            }

            setVol(volumes);

        }

        main();
    }, [])

    const onHandleSearch = (value) => {

        const filteredTokens = allTokenList.filter(({ name }) => name.toLocaleLowerCase().includes(value.toLowerCase()));

        if (filteredTokens.length === 0) {
            setAllTokenList(copyAllTokenList);
        } else {
            setAllTokenList(filteredTokens);
        }
    }

    const onClearSearch = () => {
        if (allTokenList.length && copyAllTokenList.length) {
            setAllTokenList(copyAllTokenList);
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => setSearch(searchItem), 500);
        return () => clearTimeout(timer);
    }, [searchItem])

    useEffect(() => {
        if (search) {
            onHandleSearch(search);
        } else {
            onClearSearch();
        }
    }, [search])

    return (
        <View>
            <NavBar openModel={openModel} setOpenModel={setOpenModel} setOpenTokenBox={setOpenTokenBox} openTokenBox={openTokenBox} current={1} />
            <View style={{ paddingHorizontal: 15 }}>
                <Text style={{ fontWeight: "600", fontSize: 20, marginTop: 45, marginBottom: 15, color: "rgb(43,101,237)" }} >Top tokens on WaveSwap</Text>
                <TextInput
                    placeholder="Filter tokens..."
                    onChange={(e) => setSearchItem(e.target.value)}
                    value={searchItem}
                    style={{
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 0,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,

                        borderColor: "rgb(43,101,237)",
                        color: "rgb(43,101,237)",
                        borderWidth: 1,
                        borderRadius: 15,
                        height: 50,
                        paddingLeft: 15,
                        maxWidth: "calc(100vw - 30px)",
                        width: "50vw",
                        minWidth: 300,
                        outline: "none",
                    }}
                />
            </View>
            <View style={{
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: 0.37,
                shadowRadius: 7.49,
                elevation: 12,

                marginHorizontal: 15,
                borderRadius: 15,
                marginTop: 20
            }}>
                <View style={{
                    display: "flex",
                    flexDirection: "row",
                    paddingVertical: 25,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    borderBottomColor: "lightgray",
                    borderBottomWidth: 1
                }} >
                    <Text style={{ width: "5%", paddingLeft: 15, fontWeight: "700", fontSize: 15 }}>#</Text>
                    <Text style={{ width: "calc(25% + 30px + 25px)", paddingLeft: 15, fontWeight: "700", fontSize: 15 }}>Symbol</Text>
                    <Text style={{ width: "25%", fontWeight: "700", fontSize: 15 }}>Price</Text>
                    <Text style={{ width: "20%", fontWeight: "700", fontSize: 15 }}>swaps</Text>
                    <Text style={{ width: "25%", fontWeight: "700", fontSize: 15 }}>Volume (24h)</Text>
                </View>
                
                {allTokenList.map((el, i) => {
                    return (
                        <View
                            key={i}
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ width: "5%", paddingLeft: 15, borderBottomLeftRadius: i == 4 ? 10 : 0, paddingVertical: 25 }}>{i + 1}</Text>
                            <Image source={el.image} style={{ height: 30, width: 30, marginLeft: 15, marginRight: 10 }} />
                            <Text style={{ width: "25%", fontWeight: "700" }}>{el.symbol}</Text>
                            <Text style={{ width: "25%", fontWeight: "700" }}>{prices[el.address]} $</Text>
                            <Text style={{ width: "20%" }}>{vol[el.address].swaps}</Text>
                            <Text style={{ width: "25%" }}>{numberWithSpaces(Number(vol[el.address].volume * prices[el.address]).toFixed(2))} $</Text>
                        </View>
                    )
                })}
            </View>
        </View>
    )
}