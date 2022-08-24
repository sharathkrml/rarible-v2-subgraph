import { Match as MatchEvent } from "../generated/ExchangeV2/ExchangeV2";
import { Match } from "../generated/schema";
import { ethereum } from "@graphprotocol/graph-ts";
export function handleMatch(event: MatchEvent): void {
  let entity = Match.load(event.transaction.hash.toHexString());
  if (!entity) {
    entity = new Match(event.transaction.hash.toHexString());
  }
  entity.save();
}
