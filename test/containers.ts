import {StartedTestContainer} from "testcontainers/dist/test-container";

const {GenericContainer} = require('testcontainers');

export class Containers {
    private static image = 'docker.pkg.github.com/eventstore/eventstore-client-grpc-testdata/eventstore-client-grpc-testdata';
    private static version = '6.0.0-preview1.0.1869-buster-slim';

    static emptyDatabase(): Promise<StartedTestContainer> {
        return new GenericContainer(this.image, this.version)
            .withEnv('EVENTSTORE_CERTIFICATE_FILE', '/opt/eventstore/dev-ca/server1.pfx')
            .withEnv('EVENTSTORE_CERTIFICATE_PASSWORD', 'changeit')
            .withExposedPorts(2113)
            .start()
    }
}
