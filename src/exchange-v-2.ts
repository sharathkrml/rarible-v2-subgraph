import { Match as MatchEvent } from "../generated/ExchangeV2/ExchangeV2";
import { Match } from "../generated/schema";
import { ByteArray, Bytes, ethereum, TypedMap } from "@graphprotocol/graph-ts";
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
  // entity.leftAssetClass = event.params.leftAsset.assetClass.toHexString();
  entity.leftClass = classMap.get(
    event.params.leftAsset.assetClass.toHexString()
  );
  if (entity.leftClass == "ERC20") {
    let decoded = ethereum.decode("(address)", event.params.leftAsset.data);
    if (decoded) {
      let decodedTuple = decoded.toTuple();
      entity.leftAddress = decodedTuple[0].toAddress();
    }
  } else if (entity.leftClass == "ERC721" || entity.leftClass == "ERC1155") {
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
    // (id) = abi.decode(data[64:128],(uint256));
    // if (entity.leftAssetdata!.length > 194) {
    //   let idString = "0x" + entity.leftAssetdata!.slice(130, 194);
    //   let idBytes = Bytes.fromHexString(idString);
    //   let decodedId = ethereum.decode("(uint256)", idBytes);
    //   if (decodedId) {
    //     let decodedTuple = decodedId.toTuple();
    //     entity.leftId = decodedTuple[0].toBigInt();
    //   }
    // }
  }
  entity.leftAssetdata = event.params.leftAsset.data.toHexString();
  entity.rightClass = classMap.get(
    event.params.rightAsset.assetClass.toHexString()
  );
  // entity.rightAssetClass = event.params.rightAsset.assetClass.toHexString();
  entity.rightAssetdata = event.params.rightAsset.data.toHexString();

  entity.save();
}
