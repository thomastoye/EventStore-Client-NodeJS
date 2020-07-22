// package: event_store.client.shared
// file: shared.proto

import * as jspb from "google-protobuf";

export class UUID extends jspb.Message {
  hasStructured(): boolean;
  clearStructured(): void;
  getStructured(): UUID.Structured | undefined;
  setStructured(value?: UUID.Structured): void;

  hasString(): boolean;
  clearString(): void;
  getString(): string;
  setString(value: string): void;

  getValueCase(): UUID.ValueCase;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UUID.AsObject;
  static toObject(includeInstance: boolean, msg: UUID): UUID.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: UUID, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UUID;
  static deserializeBinaryFromReader(message: UUID, reader: jspb.BinaryReader): UUID;
}

export namespace UUID {
  export type AsObject = {
    structured?: UUID.Structured.AsObject,
    string: string,
  }

  export class Structured extends jspb.Message {
    getMostSignificantBits(): number;
    setMostSignificantBits(value: number): void;

    getLeastSignificantBits(): number;
    setLeastSignificantBits(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Structured.AsObject;
    static toObject(includeInstance: boolean, msg: Structured): Structured.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Structured, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Structured;
    static deserializeBinaryFromReader(message: Structured, reader: jspb.BinaryReader): Structured;
  }

  export namespace Structured {
    export type AsObject = {
      mostSignificantBits: number,
      leastSignificantBits: number,
    }
  }

  export enum ValueCase {
    VALUE_NOT_SET = 0,
    STRUCTURED = 1,
    STRING = 2,
  }
}

export class Empty extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Empty.AsObject;
  static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Empty;
  static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
  export type AsObject = {
  }
}

export class StreamIdentifier extends jspb.Message {
  getStreamname(): Uint8Array | string;
  getStreamname_asU8(): Uint8Array;
  getStreamname_asB64(): string;
  setStreamname(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamIdentifier.AsObject;
  static toObject(includeInstance: boolean, msg: StreamIdentifier): StreamIdentifier.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: StreamIdentifier, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamIdentifier;
  static deserializeBinaryFromReader(message: StreamIdentifier, reader: jspb.BinaryReader): StreamIdentifier;
}

export namespace StreamIdentifier {
  export type AsObject = {
    streamname: Uint8Array | string,
  }
}
