/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomiclabs/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "ERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20__factory>;
    getContractFactory(
      name: "IERC20Metadata",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Metadata__factory>;
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "IUniswapV2Callee",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV2Callee__factory>;
    getContractFactory(
      name: "IUniswapV2ERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV2ERC20__factory>;
    getContractFactory(
      name: "IUniswapV2Factory",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV2Factory__factory>;
    getContractFactory(
      name: "IUniswapV2Pair",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV2Pair__factory>;
    getContractFactory(
      name: "UniswapV2ERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.UniswapV2ERC20__factory>;
    getContractFactory(
      name: "UniswapV2Pair",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.UniswapV2Pair__factory>;
    getContractFactory(
      name: "IBasketHandler",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IBasketHandler__factory>;
    getContractFactory(
      name: "IBooster",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IBooster__factory>;
    getContractFactory(
      name: "IChainLinkFeedRegistry",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IChainLinkFeedRegistry__factory>;
    getContractFactory(
      name: "IConvexBaseRewardsPool",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IConvexBaseRewardsPool__factory>;
    getContractFactory(
      name: "IBooster",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IBooster__factory>;
    getContractFactory(
      name: "IConvexWrapper",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IConvexWrapper__factory>;
    getContractFactory(
      name: "CEther",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.CEther__factory>;
    getContractFactory(
      name: "IComptroller",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IComptroller__factory>;
    getContractFactory(
      name: "ICToken",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ICToken__factory>;
    getContractFactory(
      name: "IMain",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IMain__factory>;
    getContractFactory(
      name: "IPermit2",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IPermit2__factory>;
    getContractFactory(
      name: "IRETHRouter",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IRETHRouter__factory>;
    getContractFactory(
      name: "IRToken",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IRToken__factory>;
    getContractFactory(
      name: "IStaticATokenLM",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IStaticATokenLM__factory>;
    getContractFactory(
      name: "IStETH",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IStETH__factory>;
    getContractFactory(
      name: "IWrappedNative",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IWrappedNative__factory>;
    getContractFactory(
      name: "IWStETH",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IWStETH__factory>;
    getContractFactory(
      name: "IZapper",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IZapper__factory>;
    getContractFactory(
      name: "IZapperExecutor",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IZapperExecutor__factory>;

    getContractAt(
      name: "ERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20>;
    getContractAt(
      name: "IERC20Metadata",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Metadata>;
    getContractAt(
      name: "IERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "IERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "IUniswapV2Callee",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV2Callee>;
    getContractAt(
      name: "IUniswapV2ERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV2ERC20>;
    getContractAt(
      name: "IUniswapV2Factory",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV2Factory>;
    getContractAt(
      name: "IUniswapV2Pair",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV2Pair>;
    getContractAt(
      name: "UniswapV2ERC20",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.UniswapV2ERC20>;
    getContractAt(
      name: "UniswapV2Pair",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.UniswapV2Pair>;
    getContractAt(
      name: "IBasketHandler",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IBasketHandler>;
    getContractAt(
      name: "IBooster",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IBooster>;
    getContractAt(
      name: "IChainLinkFeedRegistry",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IChainLinkFeedRegistry>;
    getContractAt(
      name: "IConvexBaseRewardsPool",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IConvexBaseRewardsPool>;
    getContractAt(
      name: "IBooster",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IBooster>;
    getContractAt(
      name: "IConvexWrapper",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IConvexWrapper>;
    getContractAt(
      name: "CEther",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.CEther>;
    getContractAt(
      name: "IComptroller",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IComptroller>;
    getContractAt(
      name: "ICToken",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.ICToken>;
    getContractAt(
      name: "IMain",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IMain>;
    getContractAt(
      name: "IPermit2",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IPermit2>;
    getContractAt(
      name: "IRETHRouter",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IRETHRouter>;
    getContractAt(
      name: "IRToken",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IRToken>;
    getContractAt(
      name: "IStaticATokenLM",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IStaticATokenLM>;
    getContractAt(
      name: "IStETH",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IStETH>;
    getContractAt(
      name: "IWrappedNative",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IWrappedNative>;
    getContractAt(
      name: "IWStETH",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IWStETH>;
    getContractAt(
      name: "IZapper",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IZapper>;
    getContractAt(
      name: "IZapperExecutor",
      address: string,
      signer?: ethers.Signer
    ): Promise<Contracts.IZapperExecutor>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.utils.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
  }
}
