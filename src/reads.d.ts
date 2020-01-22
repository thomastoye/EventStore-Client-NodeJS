import { EventStoreConnection } from "../index";
import * as types from "./types";
import * as streams from "./generated/streams_pb";
export declare class Reads {
    readAllForwards(this: EventStoreConnection, position: types.Position, maxCount: number, resolveLinksTo?: boolean, filter?: types.Filter, userCredentials?: types.UserCredentials): Promise<types.ResolvedEvent[]>;
    static convertToEventRecord(event: streams.ReadResp.ReadEvent.RecordedEvent | undefined): types.EventRecord | null;
}
