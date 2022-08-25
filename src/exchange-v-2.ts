import { Match as MatchEvent } from "../generated/ExchangeV2/ExchangeV2";
import { Match } from "../generated/schema";
import { ByteArray, Bytes, ethereum, TypedMap } from "@graphprotocol/graph-ts";
import {
  classMap,
  ETH,
  ERC20,
  ERC721,
  ERC1155,
  getClass,
} from "./rarible-helper";
export function handleMatch(event: MatchEvent): void {
  let entity = Match.load(event.transaction.hash.toHexString());
  if (!entity) {
    entity = new Match(event.transaction.hash.toHexString());
  }
  entity.leftMaker = event.params.leftMaker.toHexString();
  entity.rightMaker = event.params.rightMaker.toHexString();
  entity.newLeftFill = event.params.newLeftFill;
  entity.newRightFill = event.params.newRightFill;
  // entity.leftAssetClass = event.params.leftAsset.assetClass.toHexString();
  entity.leftClass = getClass(event.params.leftAsset.assetClass);
  if (entity.leftClass == ERC20) {
    let decoded = ethereum.decode("(address)", event.params.leftAsset.data);
    if (decoded) {
      let decodedTuple = decoded.toTuple();
      entity.leftAddress = decodedTuple[0].toAddress();
    }
  } else if (entity.leftClass == ERC721 || entity.leftClass == ERC1155) {
    let decoded = ethereum.decode(
      "(address,uint256)",
      event.params.leftAsset.data
    );
    if (decoded) {
      let decodedTuple = decoded.toTuple();
      entity.leftAddress = decodedTuple[0].toAddress();
      entity.leftId = decodedTuple[1].toBigInt();
    }
  } else if (entity.leftClass == null) {
    let decoded = ethereum.decode(
      "(address,uint256,uint256)",
      event.params.leftAsset.data
    );
    if (decoded) {
      let decodedTuple = decoded.toTuple();
      entity.leftAddress = decodedTuple[0].toAddress();
      entity.leftId = decodedTuple[2].toBigInt();
    }
  }
  entity.leftAssetdata = event.params.leftAsset.data.toHexString();
  entity.rightClass = getClass(event.params.rightAsset.assetClass);

  // entity.rightAssetClass = event.params.rightAsset.assetClass.toHexString();
  if (entity.rightClass == ERC20) {
    let decoded = ethereum.decode("(address)", event.params.rightAsset.data);
    if (decoded) {
      let decodedTuple = decoded.toTuple();
      entity.rightAddress = decodedTuple[0].toAddress();
    }
  } else if (entity.rightClass == ERC721 || entity.rightClass == ERC1155) {
    let decoded = ethereum.decode(
      "(address,uint256)",
      event.params.rightAsset.data
    );
    if (decoded) {
      let decodedTuple = decoded.toTuple();
      entity.rightAddress = decodedTuple[0].toAddress();
      entity.rightId = decodedTuple[1].toBigInt();
    }
  } else if (entity.rightClass == null) {
    let decoded = ethereum.decode(
      "(address,uint256,uint256)",
      event.params.rightAsset.data
    );
    if (decoded) {
      let decodedTuple = decoded.toTuple();
      entity.rightAddress = decodedTuple[0].toAddress();
      entity.rightId = decodedTuple[2].toBigInt();
    }
  }
  entity.rightAssetdata = event.params.rightAsset.data.toHexString();

  entity.save();
}
