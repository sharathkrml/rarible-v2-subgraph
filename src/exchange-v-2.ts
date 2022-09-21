import {
  DirectAcceptBidCall,
  DirectPurchaseCall,
  ExchangeV2,
  MatchOrdersCall,
} from "../generated/ExchangeV2/ExchangeV2";
import {
  DirectPurchase,
  DirectTransaction,
  Transaction,
  DirectAcceptBid,
} from "../generated/schema";
import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  ethereum,
  log,
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
  calculatedTotal,
} from "./rarible-helper";

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

    tx.total = calculatedTotal(
      orderLeft.makeAsset.value,
      orderLeft.dataType,
      orderLeft.data
    );
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

    tx.total = calculatedTotal(
      orderRight.makeAsset.value,
      orderRight.dataType,
      orderRight.data
    );
    tx.blockHeight = call.block.number;

    tx.save();
  }
}

export function handleDirectPurchase(call: DirectPurchaseCall): void {
  let entity = DirectPurchase.load(call.transaction.hash.toHexString());
  if (!entity) {
    entity = new DirectPurchase(call.transaction.hash.toHexString());
  }
  entity.blockNumber = call.block.number;

  let direct = call.inputs.direct;
  let nftClass = getClass(direct.nftAssetClass);
  let decodedNFT = decodeAsset(direct.nftData, nftClass);
  entity.nftAddress = decodedNFT.address;
  entity.nftId = decodedNFT.id;
  entity.blockNumber = call.block.number;
  entity.sellOrderMaker = direct.sellOrderMaker;
  entity.sellOrderNftAmount = direct.sellOrderNftAmount;
  entity.nftAssetClass = direct.nftAssetClass;
  entity.nftData = direct.nftData;
  entity.sellOrderPaymentAmount = direct.sellOrderPaymentAmount;
  entity.paymentToken = direct.paymentToken;
  entity.sellOrderSalt = direct.sellOrderSalt;
  entity.sellOrderStart = direct.sellOrderStart;
  entity.sellOrderEnd = direct.sellOrderEnd;
  entity.sellOrderDataType = direct.sellOrderDataType;
  entity.sellOrderData = direct.sellOrderData;
  entity.sellOrderSignature = direct.sellOrderSignature;
  entity.buyOrderPaymentAmount = direct.buyOrderPaymentAmount;
  entity.buyOrderNftAmount = direct.buyOrderNftAmount;
  entity.buyOrderData = direct.buyOrderData;
  entity.save();

  let tx = getOrCreateDirectTransaction(
    call.transaction.hash,
    decodedNFT.address,
    decodedNFT.id
  );
  tx.hash = call.transaction.hash.toHexString();
  tx.nftAddress = decodedNFT.address;
  tx.nftId = decodedNFT.id;
  tx.from = direct.sellOrderMaker;
  tx.to = call.from; ///Todo
  tx.paymentTokenAddress = direct.paymentToken;
  tx.originFee = getOriginFees(direct.sellOrderDataType, direct.sellOrderData);
  tx.save();
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
export function getOrCreateDirectTransaction(
  hash: Bytes,
  nftAddress: Bytes,
  nftId: BigInt
): DirectTransaction {
  let entity = DirectTransaction.load(
    hash.toHexString() +
      "-" +
      nftAddress.toHexString() +
      "-" +
      nftId.toHexString()
  );
  if (!entity) {
    entity = new DirectTransaction(
      hash.toHexString() +
        "-" +
        nftAddress.toHexString() +
        "-" +
        nftId.toHexString()
    );
  }
  return entity;
}

export function handleDirectAcceptBid(call: DirectAcceptBidCall): void {
  let entity = DirectAcceptBid.load(call.transaction.hash.toHexString());
  if (!entity) {
    entity = new DirectAcceptBid(call.transaction.hash.toHexString());
  }
  entity.blockNumber = call.block.number;
  entity.save();
}
