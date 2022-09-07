import { MatchOrdersCall } from "../generated/ExchangeV2/ExchangeV2";
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
  getExchange,
  getOriginFees,
} from "./rarible-helper";
import { log } from "matchstick-as";

export function handleMatchOrders(call: MatchOrdersCall): void {
  let orderLeft = call.inputs.orderLeft;
  let orderRight = call.inputs.orderRight;
  let leftAssetType = getClass(orderLeft.makeAsset.assetType.assetClass);
  let rightAssetType = getClass(orderRight.makeAsset.assetType.assetClass);
  let leftAsset = decodeAsset(
    orderLeft.makeAsset.assetType.data,
    leftAssetType
  );
  let rightAsset = decodeAsset(
    orderRight.makeAsset.assetType.data,
    rightAssetType
  );
  if (leftAssetType == ETH || leftAssetType == ERC20) {
    let tx = getOrCreateTransaction(
      call.transaction.hash,
      rightAsset.address,
      rightAsset.id
    );
    tx.hash = call.transaction.hash.toHexString();
    tx.from = orderRight.maker;
    tx.to = orderLeft.maker;
    tx.nftSide = "RIGHT";
    tx.nftAddress = rightAsset.address;
    tx.nftId = rightAsset.id;
    tx.paymentTokenAddress = leftAsset.address;
    tx.nftValue = orderRight.makeAsset.value;
    tx.nftTakeValue = orderRight.takeAsset.value;
    tx.paymentValue = orderLeft.makeAsset.value;
    tx.paymentTakeValue = orderLeft.takeAsset.value;

    tx.nftData = orderRight.data.toHexString();
    tx.nftDataLength = BigInt.fromI32(orderRight.data.toHexString().length);
    tx.paymentData = orderLeft.data.toHexString();
    tx.paymentDataLength = BigInt.fromI32(orderLeft.data.toHexString().length);
    tx.originFee = getOriginFees(orderLeft.dataType, orderLeft.data);
    tx.blockHeight = call.block.number;
    tx.exchange = getExchange(orderLeft.dataType);
    tx.save();
  } else {
    let tx = getOrCreateTransaction(
      call.transaction.hash,
      leftAsset.address,
      leftAsset.id
    );
    tx.hash = call.transaction.hash.toHexString();
    tx.from = orderLeft.maker;
    tx.to = orderRight.maker;
    tx.nftSide = "LEFT";
    tx.nftAddress = leftAsset.address;
    tx.nftId = leftAsset.id;
    tx.paymentTokenAddress = rightAsset.address;
    tx.nftValue = orderLeft.makeAsset.value;
    tx.nftTakeValue = orderLeft.takeAsset.value;
    tx.paymentValue = orderRight.makeAsset.value;
    tx.paymentTakeValue = orderRight.takeAsset.value;

    tx.nftData = orderLeft.data.toHexString();
    tx.nftDataLength = BigInt.fromI32(orderLeft.data.toHexString().length);
    tx.paymentData = orderRight.data.toHexString();
    tx.paymentDataLength = BigInt.fromI32(orderRight.data.toHexString().length);
    tx.exchange = getExchange(orderRight.dataType);

    tx.originFee = getOriginFees(orderRight.dataType, orderRight.data);
    tx.blockHeight = call.block.number;

    tx.save();
  }
}

export function getOrCreateTransaction(
  hash: Bytes,
  nftAddress: Bytes,
  nftId: BigInt
): Transaction {
  let entity = Transaction.load(
    hash.toHexString() +
      "-" +
      nftAddress.toHexString() +
      "-" +
      nftId.toHexString()
  );
  if (!entity) {
    entity = new Transaction(
      hash.toHexString() +
        "-" +
        nftAddress.toHexString() +
        "-" +
        nftId.toHexString()
    );
  }
  return entity;
}
