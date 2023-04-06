import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { Percent, Token } from "@uniswap/sdk-core";
import { NonfungiblePositionManager, Pool, Position, nearestUsableTick } from "@uniswap/v3-sdk";
import { FACOTRY_ADDRESS, NON_FUNGIBLE_MANAGER } from "./constants";
import UniswapV3Factory from "@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json";
import ERC20 from "../abi/ERC20.json"

const artifacts = {
    NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
    WETH9: require("./WETH9.json"),
    UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
}

async function getPoolData(poolContract) {
    const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
        poolContract.tickSpacing(),
        poolContract.fee(),
        poolContract.liquidity(),
        poolContract.slot0(),
    ])

    return {
        tickSpacing: tickSpacing,
        fee: fee,
        liquidity: liquidity,
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
    }
}

export const addLiquidityExternal = async (
    tokenAddress1,
    tokenAddress2,
    poolFee,
    tokenAmount1,
    tokenAmount2,
    minTick_,
    maxTick_,
    timeout
) => {
    console.log(ethers.utils.parseEther(tokenAmount1), ethers.utils.parseEther(tokenAmount2), ethers.utils.parseUnits("1", "ether"))
    const web3modal = new Web3Modal();
    const connection = await web3modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const accountAddress = await signer.getAddress();

    const factory = new ethers.Contract(
        FACOTRY_ADDRESS,
        UniswapV3Factory.abi,
        provider
    );

    const poolAddress = factory.connect(provider).getPool(tokenAddress1, tokenAddress2, poolFee);

    const TETHER_ADDRESS = tokenAddress1;
    const USDC_ADDRESS = tokenAddress2;

    const usdtContract = new ethers.Contract(TETHER_ADDRESS, ERC20, provider)
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20, provider)

    await usdtContract.connect(signer).approve(NON_FUNGIBLE_MANAGER, ethers.utils.parseEther(tokenAmount1))
    await usdcContract.connect(signer).approve(NON_FUNGIBLE_MANAGER, ethers.utils.parseEther(tokenAmount2))

    const poolContract = new ethers.Contract(poolAddress, artifacts.UniswapV3Pool.abi, provider)

    const poolData = await getPoolData(poolContract)

    const UsdtToken = new Token(31337, TETHER_ADDRESS, 18, 'USDT', 'Tether')
    const UsdcToken = new Token(31337, USDC_ADDRESS, 18, 'USDC', 'UsdCoin')

    const pool = new Pool(
        UsdtToken,
        UsdcToken,
        poolData.fee,
        poolData.sqrtPriceX96.toString(),
        poolData.liquidity.toString(),
        poolData.tick
    )

    const position = new Position({
        pool: pool,
        liquidity: ethers.utils.parseEther('1'),
        tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
        tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
    })

    const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts

    const params = {
        token1: USDC_ADDRESS,
        token0: TETHER_ADDRESS,
        fee: poolData.fee,
        tickLower: nearestUsableTick(-887270, poolData.tickSpacing),
        tickUpper: nearestUsableTick(887270, poolData.tickSpacing),
        amount0Desired: "2000000000000000000",
        amount1Desired: "500000000000000000",
        amount0Min: 0,
        amount1Min: 0,
        recipient: accountAddress,
        deadline: Math.floor(Date.now() / 1000) + (60 * 10)
    }

    const nonfungiblePositionManager = new ethers.Contract(
        NON_FUNGIBLE_MANAGER,
        artifacts.NonfungiblePositionManager.abi,
        provider
    )

    const tx = await nonfungiblePositionManager.connect(signer).mint(
        params,
        { gasLimit: '1000000' }
    )
    const receipt = await tx.wait()

    console.log(receipt);

    if (receipt) {
        alert(`Transaction succeed ! Hash : ${receipt["transactionHash"]}`);
    }

    return receipt;
}