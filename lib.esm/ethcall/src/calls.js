import multicallAbi from './abi/multicall.json';
import Contract from './contract';
function getEthBalance(address, multicallAddress) {
    const multicall = new Contract(multicallAddress, multicallAbi);
    return multicall.getEthBalance(address);
}
export default getEthBalance;
//# sourceMappingURL=calls.js.map