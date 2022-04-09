import { SubstrateExtrinsic, SubstrateEvent, SubstrateBlock } from '@subql/types'
import { StarterEntity, Transaction, Order } from '../types'
import { Balance } from '@polkadot/types/interfaces'
import { MoonbeamEvent } from '@subql/contract-processors/dist/moonbeam'
import { BigNumber } from 'ethers'

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  //Create a new starterEntity with ID using block hash
  let record = new StarterEntity(block.block.header.hash.toString())
  //Record block number
  record.field1 = block.block.header.number.toNumber()
  await record.save()
}

export async function handleEvent(event: SubstrateEvent): Promise<void> {
  const {
    event: {
      data: [account, balance]
    }
  } = event
  //Retrieve the record by its ID
  const record = await StarterEntity.get(event.block.block.header.hash.toString())
  record.field2 = account.toString()
  //Big integer type Balance of a transfer event
  record.field3 = (balance as Balance).toBigInt()
  await record.save()
}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
  const record = await StarterEntity.get(extrinsic.block.block.header.hash.toString())
  //Date type timestamp
  record.field4 = extrinsic.block.timestamp
  //Boolean tyep
  record.field5 = true
  await record.save()
}

type TransferEventArgs = [string, string, BigNumber] & { from: string; to: string; tokenId: BigNumber }

// event Listed(address from,address to,uint256 sopo_id,uint256 nft_id,address nft_programe_address);
type ListEventArgs = [string, string, BigNumber, BigNumber, string] & {
  from: string
  to: string
  sopo_id: BigNumber
  nft_id: BigNumber
  nft_programe_address: string
}

export async function handleMoonriverEvent(event: MoonbeamEvent<TransferEventArgs>): Promise<void> {
  const transaction = new Transaction(event.transactionHash)

  transaction.blockNumber = Math.trunc(event.blockNumber)
  transaction.blockTimestamp = event.blockTimestamp
  transaction.tokenId = event.args.tokenId.toBigInt()
  transaction.from = event.args.from
  transaction.to = event.args.to
  transaction.contractAddress = event.address

  await transaction.save()
}

export async function handleListedEvent(event: MoonbeamEvent<ListEventArgs>): Promise<void> {
  const order = new Order(event.transactionHash)

  order.owner = event.args.from
  order.contractAddress = event.args.nft_programe_address
  order.onSale = false
  order.price = 0
  order.tokenId = event.args.nft_id.toBigInt()
  order.sopoId = event.args.nft_id.toBigInt()

  await order.save()
}
