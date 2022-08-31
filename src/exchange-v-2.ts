import { Match as MatchEvent } from "../generated/ExchangeV2/ExchangeV2";
import { Transaction } from "../generated/schema";
import {
  BigInt,
  ByteArray,
  Bytes,
  ethereum,
  TypedMap,
} from "@graphprotocol/graph-ts";
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
  getNFTType,
} from "./rarible-helper";

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
    // entity.paymentAmount = event.params.newRightFill;
    entity.paymentAmount = event.params.newRightFill.plus(
      event.params.newRightFill
        .times(BigInt.fromI32(250))
        .div(BigInt.fromI32(10000))
    );
    entity.nftType = rightAsset.assetClass;
    entity.nftInterface = getNFTType(rightAsset.address);
    entity.tokenType = leftAsset.assetClass;
    entity.blockHeight = event.block.number;
    entity.save();
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
    entity.paymentAmount = event.params.newLeftFill.plus(
      event.params.newLeftFill
        .times(BigInt.fromI32(250))
        .div(BigInt.fromI32(10000))
    );
    entity.nftType = leftAsset.assetClass;
    entity.nftInterface = getNFTType(leftAsset.address);
    entity.tokenType = rightAsset.assetClass;
    entity.blockHeight = event.block.number;
    entity.save();
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
