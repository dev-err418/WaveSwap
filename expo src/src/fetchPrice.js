import { ethers, parseUnits, Contract } from "ethers";
import ERC20 from "../abi/ERC20.json";
import WETH9 from "./WETH9.json";
import { MAINNET_URL, QUOTER_ADDRESS, QUOTER_V2_ADDRESS, FACOTRY_ADDRESS, WCANTO_ADDRESS } from "./constants";

const { abi: FactoryABI} = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json")
const { abi: UniswapV3PoolABI } = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");
const { abi: QuoterV2ABI } = require("@uniswap/v3-periphery/artifacts/contracts/lens/QuoterV2.sol/QuoterV2.json");
// const { getAbi, getPoolImmutables } = require("./priceHelpers");

const sqrtToPrice = (sqrt, decimals0, decimals1, token0IsInput=true) => {
    const numerator = sqrt ** 2;
    const denominator = 2 ** 192;
    let ratio = numerator / denominator;
    const shiftDecimals = Math.pow(10, decimals0 - decimals1);
    ratio = ratio * shiftDecimals;

    return ratio;
}

// tokenA = from
// tokenB = to
export const getOut = async (tokenA, tokenB, fee, amountIn) => {
    const provider = new ethers.providers.JsonRpcProvider(MAINNET_URL);

    var token0, token1;
    if (tokenA > tokenB) {
        token1 = tokenA;
        token0 = tokenB;
    } else {
        token0 = tokenA;
        token1 = tokenB;
    }

    const quoter = new Contract(
        QUOTER_V2_ADDRESS,
        QuoterV2ABI,
        provider
    );
    
    const params = {
        tokenIn: tokenA,
        tokenOut: tokenB,
        fee: fee,
        amountIn: amountIn,
        sqrtPriceLimitX96: 0
    }

    const quotedOut = await quoter.callStatic.quoteExactInputSingle(params);

    // const factory = new ethers.Contract(
    //     FACOTRY_ADDRESS,
    //     FactoryABI,
    //     provider
    // );

    // const poolAddress = await factory.connect(provider).getPool(tokenA, tokenB, fee);
    
    // const poolContract = new ethers.Contract(
    //     poolAddress,
    //     UniswapV3PoolABI,
    //     provider
    // );

    // const slot0 = await poolContract.slot0();
    // const sqrtPriceX96 = slot0.sqrtPriceX96;

    // const sqrtPriceX96After = quotedOut.sqrtPriceX96After;

    // const token0IsInput = tokenA === token0;    

    // const price = sqrtToPrice(sqrtPriceX96, 18, 18, token0IsInput);
    // const priceNext = sqrtToPrice(sqrtPriceX96After, 18, 18, token0IsInput);

    // console.log(sqrtPriceX96.toString(), sqrtPriceX96After.toString(), price, priceNext);


    
    


    return quotedOut.amountOut;
}