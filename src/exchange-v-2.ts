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
  decodeFee
} from "./rarible-helper";
import { log } from "matchstick-as";

export function handleMatchOrders(call: MatchOrdersCall): void {
  let orderLeft = call.inputs.orderLeft;
  let orderRight = call.inputs.orderRight;
  let tx = getOrCreateTransaction(call.transaction.hash);
  tx.from = call.from;
  tx.leftMaker = orderLeft.maker;
  tx.leftMakeAssetTypeClass = orderLeft.makeAsset.assetType.assetClass.toHexString();
  tx.leftMakeAssetTypeData = orderLeft.makeAsset.assetType.data.toHexString();
  tx.leftMakeAssetValue = orderLeft.makeAsset.value;
  // LibOrderDataParseLeft(orderLeft);
  // LibOrderDataParseRight(orderRight);
  tx.leftTaker = orderLeft.taker;
  tx.leftTakeAssetTypeClass = orderLeft.takeAsset.assetType.assetClass.toHexString();
  tx.leftTakeAssetTypeData = orderLeft.takeAsset.assetType.data.toHexString();
  tx.leftTakeAssetValue = orderLeft.takeAsset.value
  tx.leftDatatype = orderLeft.dataType.toHexString();
  tx.leftData = orderLeft.data.toHexString();
  tx.leftDataLength = BigInt.fromI32(orderLeft.data.length);
  tx.leftFee = decodeFee(orderLeft.data.toHexString())

  tx.rightMaker = orderRight.maker;
  tx.rightMakeAssetTypeClass = orderRight.makeAsset.assetType.assetClass.toHexString();
  tx.rightMakeAssetTypeData = orderRight.makeAsset.assetType.data.toHexString();
  tx.rightMakeAssetValue = orderRight.makeAsset.value;

  tx.rightTaker = orderRight.taker;
  tx.rightTakeAssetTypeClass = orderRight.takeAsset.assetType.assetClass.toHexString();
  tx.rightTakeAssetTypeData = orderRight.takeAsset.assetType.data.toHexString();
  tx.rightTakeAssetValue = orderRight.takeAsset.value;
  tx.rightDatatype = orderRight.dataType.toHexString();
  tx.rightData = orderRight.data.toHexString();
  tx.rightDataLength = BigInt.fromI32(orderRight.data.length);
  tx.rightFee = decodeFee(orderRight.data.toHexString())

  tx.save();
}

// export function getOrCreateTransaction(hash: Bytes, asset: Asset): Transaction {
//   let entity = Transaction.load(
//     hash.toHexString() +
//       "-" +
//       asset.address.toHexString() +
//       "-" +
//       asset.id.toHexString()
//   );
//   if (!entity) {
//     entity = new Transaction(
//       hash.toHexString() +
//         "-" +
//         asset.address.toHexString() +
//         "-" +
//         asset.id.toHexString()
//     );
//   }
//   return entity;
// }

export function getOrCreateTransaction(hash: Bytes): Transaction {
  let entity = Transaction.load(hash.toHexString());
  if (!entity) {
    entity = new Transaction(hash.toHexString());
  }
  return entity;
}
