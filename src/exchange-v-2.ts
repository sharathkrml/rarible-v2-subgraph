import { Match as MatchEvent } from "../generated/ExchangeV2/ExchangeV2";
import { Transaction } from "../generated/schema";
import { ByteArray, Bytes, ethereum, TypedMap } from "@graphprotocol/graph-ts";
import {
  classMap,
  ETH,
  ERC20,
  ERC721,
  ERC1155,
  getClass,
  decodeAsset,
  SPECIAL,
  Asset,
} from "./rarible-helper";
import * as airstack from "./modules/airstack";

export function handleMatch(event: MatchEvent): void {
  let leftAsset = decodeAsset(
    event.params.leftAsset.data,
    event.params.leftAsset.assetClass
  );
  let rightAsset = decodeAsset(
    event.params.rightAsset.data,
    event.params.rightAsset.assetClass
  );

  if (leftAsset.assetClass == ERC20 || leftAsset.assetClass == ETH) {
    // right is NFT
    let entity = getOrCreateTransaction(event.transaction.hash, rightAsset);

    entity.hash = event.transaction.hash.toHexString();
    entity.nftSide = "RIGHT";
    entity.from = event.params.rightMaker.toHexString();
    entity.to = event.params.leftMaker.toHexString();
    entity.nftAddress = rightAsset.address.toHexString();
    entity.nftId = rightAsset.id;
    entity.paymentToken = leftAsset.address.toHexString();
    entity.paymentAmount = event.params.newRightFill;
    entity.nftType = rightAsset.assetClass;
    entity.tokenType = leftAsset.assetClass;
    entity.blockHeight = event.block.number;
    entity.save();
    airstack.nft.trackNFTSaleTransactions(
      event.transaction.hash.toHexString(),
      [event.params.rightMaker],
      [event.params.leftMaker],
      [rightAsset.address],
      [rightAsset.id],
      leftAsset.address,
      event.params.newRightFill,
      event.block.timestamp,
      event.block.number
    );
  } else {
    // left is NFT
    let entity = getOrCreateTransaction(event.transaction.hash, leftAsset);
    entity.nftSide = "LEFT";
    entity.hash = event.transaction.hash.toHexString();
    entity.from = event.params.leftMaker.toHexString();
    entity.to = event.params.rightMaker.toHexString();
    entity.nftAddress = leftAsset.address.toHexString();
    entity.nftId = leftAsset.id;
    entity.paymentToken = rightAsset.address.toHexString();
    entity.paymentAmount = event.params.newLeftFill;
    entity.nftType = leftAsset.assetClass;
    entity.tokenType = rightAsset.assetClass;
    entity.blockHeight = event.block.number;
    entity.save();
    airstack.nft.trackNFTSaleTransactions(
      event.transaction.hash.toHexString(),
      [event.params.leftMaker],
      [event.params.rightMaker],
      [leftAsset.address],
      [leftAsset.id],
      rightAsset.address,
      event.params.newLeftFill,
      event.block.timestamp,
      event.block.number
    );
  }
}

export function getOrCreateTransaction(hash: Bytes, asset: Asset): Transaction {
  let entity = Transaction.load(
    hash.toHexString() +
      "-" +
      asset.address.toHexString() +
      "-" +
      asset.id.toHexString()
  );
  if (!entity) {
    entity = new Transaction(
      hash.toHexString() +
        "-" +
        asset.address.toHexString() +
        "-" +
        asset.id.toHexString()
    );
  }
  return entity;
}
