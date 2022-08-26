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
  decodeAsset,
  SPECIAL,
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
  //  Light
  let asset = decodeAsset(
    event.params.leftAsset.data,
    event.params.leftAsset.assetClass
  );
  entity.leftClass = asset.assetClass;
  entity.leftAddress = asset.address;
  entity.leftId = asset.id;
  entity.leftAssetdata = event.params.leftAsset.data.toHexString();
  //  Right
  asset = decodeAsset(
    event.params.rightAsset.data,
    event.params.rightAsset.assetClass
  );
  entity.rightClass = asset.assetClass;
  entity.rightAddress = asset.address;
  entity.rightId = asset.id;
  entity.rightAssetdata = event.params.rightAsset.data.toHexString();

  entity.save();
}
