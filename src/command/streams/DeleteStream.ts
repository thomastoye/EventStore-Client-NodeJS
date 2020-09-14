import { DeleteReq } from "../../../generated/streams_pb";
import { StreamIdentifier, Empty } from "../../../generated/shared_pb";
import { StreamsClient } from "../../../generated/streams_grpc_pb";
import { Revision, DeleteResult, ESDBConnection } from "../../types";
import { Command } from "../Command";
import { convertToCommandError } from "../CommandError";

export class DeleteStream extends Command {
  private readonly _stream: string;
  private _revision: Revision;

  constructor(stream: string) {
    super();
    this._stream = stream;
    this._revision = Revision.Any;
  }

  /**
   * Asks the server to check the stream is at specific revision before writing events.
   * @param revision
   */
  expectedRevision(revision: Revision): DeleteStream {
    this._revision = revision;
    return this;
  }

  /**
   * Sends asynchronously the delete command to the server.
   */
  async execute(connection: ESDBConnection): Promise<DeleteResult> {
    const req = new DeleteReq();
    const options = new DeleteReq.Options();
    const identifier = new StreamIdentifier();
    identifier.setStreamname(Buffer.from(this._stream).toString("base64"));

    options.setStreamIdentifier(identifier);

    switch (this._revision.__typename) {
      case "exact": {
        options.setRevision(this._revision.revision);
        break;
      }

      case "no_stream": {
        options.setNoStream(new Empty());
        break;
      }

      case "stream_exists": {
        options.setStreamExists(new Empty());
        break;
      }

      case "any": {
        options.setAny(new Empty());
        break;
      }
    }

    req.setOptions(options);

    const client = await connection._client(StreamsClient);
    return new Promise<DeleteResult>((resolve, reject) => {
      client.delete(req, this.metadata, (error, resp) => {
        if (error) {
          return reject(convertToCommandError(error));
        }

        const result: DeleteResult = {};

        if (resp.hasPosition()) {
          const grpcPos = resp.getPosition()!;

          result.position = {
            commit: grpcPos.getCommitPosition(),
            prepare: grpcPos.getPreparePosition(),
          };
        }

        return resolve(result);
      });
    });
  }
}