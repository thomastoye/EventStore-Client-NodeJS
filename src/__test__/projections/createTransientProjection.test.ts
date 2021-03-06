import { createTestNode } from "../utils";

import {
  ESDBConnection,
  EventStoreConnection,
  createTransientProjection,
} from "../..";

describe("createOneTimeProjection", () => {
  const node = createTestNode();
  let connection!: ESDBConnection;

  beforeAll(async () => {
    await node.up();
    connection = EventStoreConnection.builder()
      .defaultCredentials({ username: "admin", password: "changeit" })
      .sslRootCertificate(node.certPath)
      .singleNodeConnection(node.uri);
  });

  afterAll(async () => {
    await node.down();
  });

  it("succeeds", async () => {
    const PROJECTION_NAME = "transient";

    await expect(
      createTransientProjection(
        PROJECTION_NAME,
        `
        fromAll()
          .when({
            $init: function (state, ev) {
              return {};
            }
          });
      `
      ).execute(connection)
    ).resolves.toBeUndefined();
  });
});
