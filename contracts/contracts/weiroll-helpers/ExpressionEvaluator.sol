// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

/**
 * Allows us to evaluate complex math expressions with up to 4 inputs
 */
contract ExpressionEvaluator {
  function evalExpression(
    uint256 a,
    uint256 b,
    uint256 c,
    uint256 d,
    uint256 ops
  ) public pure returns (uint256) {
    uint256[] memory state = new uint256[](4);
    state[0] = a;
    state[1] = b;
    state[2] = c;
    state[3] = d;
    for (uint256 i; i < 32; ) {
      // Format: |sel out': 2 bits|sel a': 2 bits|sel b': 2 bits|op: 2bits|
      // Each op is 8 bytes long, you can have up to 32 operations and 4 inputs.
      // sel = a=0, b=1, c=2, d=3
      // ops = +=0, -=1, *=2, /=3
      // operation: out' = a' op b'
      // Special case: a = a + a => exit
      uint256 op = 0xff & (ops >> (i * 8));
      if (op == 0) {
        break;
      }
      if ((op & 3) == 0) {
        state[(op >> 6) & 3] = state[(op >> 4) & 3] + state[(op >> 2) & 3];
      } else if ((op & 3) == 1) {
        state[(op >> 6) & 3] = state[(op >> 4) & 3] - state[(op >> 2) & 3];
      } else if ((op & 3) == 2) {
        state[(op >> 6) & 3] = state[(op >> 4) & 3] * state[(op >> 2) & 3];
      } else if ((op & 3) == 3) {
        state[(op >> 6) & 3] = state[(op >> 4) & 3] / state[(op >> 2) & 3];
      }
      unchecked {
        i++;
      }
    }
    return state[0];
  }
}
