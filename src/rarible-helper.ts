import {
  Address,
  BigInt,
  Bytes,
  ethereum,
  TypedMap,
} from "@graphprotocol/graph-ts";
import { log } from "@graphprotocol/graph-ts";
import { ERC1155 as ERC1155Metadata } from "../generated/ExchangeV2/ERC1155";
import { ERC721MetaData } from "../generated/ExchangeV2/ERC721MetaData";
export const ERC20 = "ERC20";
export const ETH = "ETH";
export const ERC721 = "ERC721";
export const ERC1155 = "ERC1155";
export const COLLECTION = "COLLECTION";
export const CRYPTOPUNKS = "CRYPTOPUNKS";
export const SPECIAL = "SPECIAL";

export const ZERO_ADDRESS = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);
export const BIGINT_ZERO = BigInt.fromI32(0);

export const classMap = new TypedMap<string, string>();
classMap.set("0xaaaebeba", ETH);
classMap.set("0x8ae85d84", ERC20);
classMap.set("0x73ad2146", ERC721);
classMap.set("0x973bb640", ERC1155);
classMap.set("0xf63c2825", COLLECTION);
classMap.set("0x3e6b89d4", CRYPTOPUNKS);

export const V1 = "0x4c234266";
export const V2 = "0x23d235ef";

export const FEE_250 =
  "10000000000000000000000001cf0df2a5a20cd61d68d4489eebbf85b8d39e18a00000000000000000000000000000000000000000000000000000000000000fa";

export function normalFee(orderData: string): boolean {
  if (orderData.endsWith(FEE_250)) {
    return true;
  }
  return false;
}

export function getClass(assetClass: Bytes): string {
  let res = classMap.get(assetClass.toHexString());
  if (res) {
    return res;
  }
  return SPECIAL;
}
export class Asset {
  address: Address;
  id: BigInt;
  assetClass: string;
  constructor(address: Address, id: BigInt, assetClass: string) {
    this.address = address;
    this.id = id;
    this.assetClass = assetClass;
  }
}
export function decodeAsset(data: Bytes, type: string): Asset {
  if (type == ERC20) {
    let decoded = ethereum.decode("(address)", data);
    if (decoded != null) {
      let decodedTuple = decoded.toTuple();
      let asset = new Asset(
        decodedTuple[0].toAddress(),
        BigInt.fromI32(0),
        type
      );
      return asset;
    }
  } else if (type == ERC721 || type == ERC1155) {
    let decoded = ethereum.decode("(address,uint256)", data);
    if (decoded != null) {
      let decodedTuple = decoded.toTuple();
      let address = decodedTuple[0].toAddress();
      let id = decodedTuple[1].toBigInt();
      let asset = new Asset(address, id, type);
      return asset;
    }
  } else if (type == SPECIAL) {
    let decoded = ethereum.decode("(address,uint256,uint256)", data);
    if (decoded != null) {
      let decodedTuple = decoded.toTuple();
      let address = decodedTuple[0].toAddress();
      let id = decodedTuple[2].toBigInt();
      let asset = new Asset(address, id, type);
      return asset;
    }
  }
  let asset = new Asset(ZERO_ADDRESS, BIGINT_ZERO, type);
  return asset;
}

export function getNFTType(nftAddress: Address): string {
  let erc721contract = ERC721MetaData.bind(nftAddress);
  let erc1155contract = ERC1155Metadata.bind(nftAddress);
  let supportsEIP721Identifier = erc721contract.try_supportsInterface(
    Bytes.fromByteArray(Bytes.fromHexString("0x80ac58cd"))
  );
  if (supportsEIP721Identifier.reverted) {
    return "";
  } else {
    if (supportsEIP721Identifier.value) {
      return "ERC721";
    }
  }
  let supportsERC1155Identifier = erc1155contract.try_supportsInterface(
    Bytes.fromByteArray(Bytes.fromHexString("0xd9b67a26"))
  );
  if (supportsERC1155Identifier.reverted) {
    return "";
  } else {
    if (supportsERC1155Identifier.value) {
      return "ERC1155";
    }
  }
  return "";
}

export function decodeOriginFees(exchangeType: Bytes, data: Bytes): BigInt {
  if (exchangeType.toHexString() == V1) {
    let dataString = data.toHexString();
    let cleanedData = dataString.slice(2);
    let payoutLengthStartingIndex = 128;
    let payoutLengthBytes = Bytes.fromHexString(
      "0x" +
        cleanedData.slice(
          payoutLengthStartingIndex,
          payoutLengthStartingIndex + 64
        )
    );
    let decoded = ethereum.decode("(uint256)", payoutLengthBytes)!.toTuple();
    let payoutLength = decoded[0].toBigInt();

    let originFeeStartIndex =
      payoutLength.toI32() * 128 + (payoutLengthStartingIndex + 64);
    let originFeeLengthBytes = Bytes.fromHexString(
      "0x" + cleanedData.slice(originFeeStartIndex, originFeeStartIndex + 64)
    );
    decoded = ethereum.decode("(uint256)", originFeeLengthBytes)!.toTuple();
    let originFeeLength = decoded[0].toBigInt();
    return originFeeLength;

  }
  return BIGINT_ZERO;
}
