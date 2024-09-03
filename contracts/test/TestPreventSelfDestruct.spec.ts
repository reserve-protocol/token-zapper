import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('PreventSelfDestruct', () => {
  it('should not revert', async () => {
    const TestPreventTampering = await ethers.getContractFactory(
      'TestPreventTampering'
    )
    const testPreventTampering = await TestPreventTampering.deploy()
    await testPreventTampering.deployed()
    await testPreventTampering.shouldNotRevert()
  })
  it('should revert', async () => {
    const TestPreventTampering = await ethers.getContractFactory(
      'TestPreventTampering'
    )
    const testPreventTampering = await TestPreventTampering.deploy()
    await testPreventTampering.deployed()
    try {
      await testPreventTampering.shouldRevert()
    } catch (e: any) {
      console.log(e.message)
      expect(e.message).to.equal(
        "VM Exception while processing transaction: reverted with reason string 'PreventTampering: Code has changed'"
      )
    }
  })
  it('should not revert2', async () => {
    const TestPreventTampering = await ethers.getContractFactory(
      'TestPreventTampering'
    )
    const testPreventTampering = await TestPreventTampering.deploy()
    await testPreventTampering.deployed()
    await testPreventTampering.markedRevertOnCodeHashChangeDontRevert()
  })
})
