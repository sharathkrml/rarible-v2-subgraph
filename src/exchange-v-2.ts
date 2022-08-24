import { Match as MatchEvent } from "../generated/ExchangeV2/ExchangeV2";
import { Match } from "../generated/schema";
import { ethereum, TypedMap } from "@graphprotocol/graph-ts";
export const classMap = new TypedMap<string, string>();
classMap.set("0xaaaebeba", "ETH");
classMap.set("0x8ae85d84", "ERC20");
classMap.set("0x73ad2146", "ERC721");
classMap.set("0x973bb640", "ERC1155");
classMap.set("0xf63c2825", "COLLECTION");
classMap.set("0x3e6b89d4", "CRYPTOPUNKS");
export function handleMatch(event: MatchEvent): void {
  let entity = Match.load(event.transaction.hash.toHexString());
  if (!entity) {
    entity = new Match(event.transaction.hash.toHexString());
  }
  entity.leftHash = event.params.leftHash.toHexString();
  entity.rightHash = event.params.rightHash.toHexString();
  entity.leftMaker = event.params.leftMaker.toHexString();
  entity.rightMaker = event.params.rightMaker.toHexString();
  entity.newLeftFill = event.params.newLeftFill;
  entity.newRightFill = event.params.newRightFill;
  entity.leftAssetClass = event.params.leftAsset.assetClass.toHexString();
  entity.leftClass = classMap.get(
    event.params.leftAsset.assetClass.toHexString()
  );
  entity.leftAssetdata = event.params.leftAsset.data.toHexString();
  entity.rightClass = classMap.get(
    event.params.rightAsset.assetClass.toHexString()
  );
  entity.rightAssetClass = event.params.rightAsset.assetClass.toHexString();
  entity.rightAssetdata = event.params.rightAsset.data.toHexString();

  entity.save();
}
