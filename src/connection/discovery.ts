import * as dns from "dns";
import { promisify } from "util";
import { ChannelCredentials } from "@grpc/grpc-js";

import { MemberInfo as GrpcMemberInfo } from "../../generated/gossip_pb";
import { GossipClient } from "../../generated/gossip_grpc_pb";
import { Empty } from "../../generated/shared_pb";
import VNodeState = GrpcMemberInfo.VNodeState;

import { EndPoint, MemberInfo, NodePreference } from "../types";
import { RANDOM } from "../constants";
import { ClusterSettings } from ".";
import { debug } from "../utils/debug";

const resolveDns = promisify(dns.resolve);

export async function discoverEndpoint(
  settings: ClusterSettings,
  credentials: ChannelCredentials
): Promise<EndPoint> {
  while (true) {
    try {
      const candidates: EndPoint[] =
        "endpoints" in settings
          ? settings.endpoints
          : await resolveDomainName(settings.domain);

      debug.connection(`Starting discovery for candidates: %O`, candidates);

      for (const candidate of candidates) {
        try {
          const members = await listClusterMembers(candidate, credentials);
          const preference = settings.nodePreference ?? RANDOM;
          const endpoint = determineBestNode(preference, members);
          if (endpoint) return Promise.resolve(endpoint);
        } catch (error) {
          debug.connection(
            `Failed to get cluster list from ${candidate.address}:${candidate.port}`,
            error.toString()
          );
          continue;
        }
      }
    } catch (error) {
      debug.connection(`Failed to resolve dns: `, error.toString());
    }

    await asyncSetTimeout(500);
  }
}

const resolveDomainName = async (
  domain: string | EndPoint
): Promise<EndPoint[]> => {
  const host: EndPoint =
    typeof domain === "string" ? { address: domain, port: 2113 } : domain;

  debug.connection(`Resolving domain name ${host.address}`);

  try {
    debug.connection(`Resolving "A" records`);
    const records = await resolveA(host);
    return records;
  } catch (error) {
    debug.connection(
      'Failed to resolve "A" records with error %s',
      error.toString()
    );
  }

  try {
    debug.connection(`Resolving "SRV" records`);
    const records = await resolveSRV(host);
    return records;
  } catch (error) {
    debug.connection(
      'Failed to resolve "SRV" records with error %s',
      error.toString()
    );
  }

  throw new Error("Unable to resolve DNS");
};

const resolveA = async (host: EndPoint): Promise<EndPoint[]> => {
  const records = await resolveDns(host.address, "A");
  if (!records.length) throw new Error('No "A" records returned');
  return records.map<EndPoint>((record) => ({
    address: record,
    port: host.port,
  }));
};

const resolveSRV = async (host: EndPoint): Promise<EndPoint[]> => {
  const records = await resolveDns(host.address, "SRV");
  if (!records.length) throw new Error('No "SRV" records returned');
  return records.map<EndPoint>((record) => ({
    address: record.name,
    port: record.port,
  }));
};

function inAllowedStates(member: MemberInfo): boolean {
  switch (member.state) {
    case VNodeState.SHUTDOWN:
      return false;
    default:
      return true;
  }
}

function asyncSetTimeout(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

function determineBestNode(
  preference: NodePreference,
  members: MemberInfo[]
): EndPoint | undefined {
  const sorted = members
    .filter(inAllowedStates)
    .sort((a, b) => a.state - b.state);

  debug.connection(
    `Determining best node with preference "%s" from members: %O`,
    preference,
    members
  );

  let finalMember;
  switch (preference) {
    case "leader":
      finalMember = sorted.find((member) => member.state === VNodeState.LEADER);
      if (finalMember && finalMember.httpEndpoint) {
        debug.connection(`Chose member: %O`, finalMember);
        return {
          address: finalMember.httpEndpoint.address,
          port: finalMember.httpEndpoint.port,
        };
      }
      break;

    case "follower":
      finalMember = sorted
        .filter((member) => member.state === VNodeState.FOLLOWER)
        .sort(() => Math.random() - 0.5)
        .shift();

      debug.connection(`Chose member: %O`, finalMember);

      if (finalMember && finalMember.httpEndpoint) {
        return {
          address: finalMember.httpEndpoint.address,
          port: finalMember.httpEndpoint.port,
        };
      }
      break;

    default:
    case "random":
      finalMember = sorted.sort(() => Math.random() - 0.5).shift();

      debug.connection(`Chose member: %O`, finalMember);
      if (finalMember && finalMember.httpEndpoint) {
        return {
          address: finalMember.httpEndpoint.address,
          port: finalMember.httpEndpoint.port,
        };
      }
      break;
  }
}

function listClusterMembers(
  seed: EndPoint,
  credentials: ChannelCredentials
): Promise<MemberInfo[]> {
  const uri = `${seed.address}:${seed.port}`;
  const client = new GossipClient(uri, credentials);

  return new Promise((resolve, reject) => {
    client.read(new Empty(), (error, info) => {
      if (error) return reject(error);

      const members: MemberInfo[] = [];

      for (const grpcMember of info.getMembersList()) {
        let httpEndpoint;
        const grpcHttpEndpoint = grpcMember.getHttpEndPoint();

        if (grpcHttpEndpoint) {
          httpEndpoint = {
            address: grpcHttpEndpoint.getAddress(),
            port: grpcHttpEndpoint.getPort(),
          };
        }

        const member: MemberInfo = {
          instanceId: grpcMember.getInstanceId()?.getString(),
          timeStamp: parseInt(grpcMember.getTimeStamp(), 10),
          state: grpcMember.getState(),
          isAlive: grpcMember.getIsAlive(),
          httpEndpoint,
        };

        members.push(member);
      }

      return resolve(members);
    });
  });
}
