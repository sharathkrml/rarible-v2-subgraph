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
} from "./rarible-helper";
export function handleMatch(event: MatchEvent): void {
  // let entity = Match.load(event.transaction.hash.toHexString());
  // if (!entity) {
  //   entity = new Match(event.transaction.hash.toHexString());
  // }
  // entity.leftMaker = event.params.leftMaker.toHexString();
  // entity.rightMaker = event.params.rightMaker.toHexString();
  // entity.newLeftFill = event.params.newLeftFill;
  // entity.newRightFill = event.params.newRightFill;
  // //  Light
  // let asset = decodeAsset(
  //   event.params.leftAsset.data,
  //   event.params.leftAsset.assetClass
  // );
  // entity.leftClass = asset.assetClass;
  // entity.leftAddress = asset.address;
  // entity.leftId = asset.id;
  // entity.leftAssetdata = event.params.leftAsset.data.toHexString();
  // //  Right
  // asset = decodeAsset(
  //   event.params.rightAsset.data,
  //   event.params.rightAsset.assetClass
  // );
  // entity.rightClass = asset.assetClass;
  // entity.rightAddress = asset.address;
  // entity.rightId = asset.id;
  // entity.rightAssetdata = event.params.rightAsset.data.toHexString();
  // entity.save();
  let leftAsset = decodeAsset(
    event.params.leftAsset.data,
    event.params.leftAsset.assetClass
  );
  let rightAsset = decodeAsset(
    event.params.rightAsset.data,
    event.params.rightAsset.assetClass
  );
  // let entity = Test.load(event.transaction.hash.toHexString());
  // if (!entity) {
  //   entity = new Test(event.transaction.hash.toHexString());
  // }
  // entity.leftAddress = leftAsset.address.toHexString();
  // entity.leftClass = leftAsset.assetClass;
  // entity.leftId = leftAsset.id;

  if (leftAsset.assetClass == ERC20 || leftAsset.assetClass == ETH) {
    // right is NFT
    let entity = Transaction.load(
      event.transaction.hash.toHexString() +
        "-" +
        rightAsset.address.toHexString() +
        "-" +
        rightAsset.id.toHexString()
    );
    if (!entity) {
      entity = new Transaction(
        event.transaction.hash.toHexString() +
          "-" +
          rightAsset.address.toHexString() +
          "-" +
          rightAsset.id.toHexString()
      );
    }
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
    entity.save();
  } else {
    // left is NFT
    let entity = Transaction.load(
      event.transaction.hash.toHexString() +
        "-" +
        leftAsset.address.toHexString() +
        "-" +
        leftAsset.id.toHexString()
    );
    if (!entity) {
      entity = new Transaction(
        event.transaction.hash.toHexString() +
          "-" +
          leftAsset.address.toHexString() +
          "-" +
          leftAsset.id.toHexString()
      );
    }
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
    entity.save();
  }
}
