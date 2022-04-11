import { Order } from '../types'
import { MoonbeamEvent } from '@subql/contract-processors/dist/moonbeam'
import { BigNumber } from 'ethers'

// event Listed(address from,address to,uint256 sopo_id,uint256 nft_id,address nft_programe_address);
type ListEventArgs = [string, string, BigNumber, BigNumber, string] & {
  from: string
  to: string
  sopo_id: BigNumber
  nft_id: BigNumber
  nft_programe_address: string
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
