/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import { useParams } from "next/navigation";

export default function RequestDetails() {
  const params = useParams();
  const [requestDetails, setRequestDetails] = useState<any>(null);
  const [responseDetails, setResponseDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const QueryURL =
    "https://api.studio.thegraph.com/query/97506/privado-zkevm/version/latest";
  const client = new ApolloClient({
    uri: QueryURL,
    cache: new InMemoryCache(),
  });

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const query = `{
          zkpresponseSubmitteds(where: {requestId: "${params.requestId}"}) {
            requestId
            transactionHash
            caller
            blockTimestamp
          }
          zkprequestSets(where: {requestId: "${params.requestId}"}) {
            requestId
            transactionHash
            validator
            requestOwner
            metadata
          }
        }`;

        const { data } = await client.query({
          query: gql(query),
        });

        setRequestDetails(data.zkprequestSets[0]);
        setResponseDetails(data.zkpresponseSubmitteds[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching details:", error);
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [params.requestId]);

  const formatMetadata = (metadataString: string) => {
    try {
      const metadata = JSON.parse(metadataString);
      const body = metadata.body;

      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Circuit Details:</h3>
            {body.scope.map((item: any, index: number) => (
              <div key={index} className="ml-4 space-y-2">
                <p>
                  Circuit ID:{" "}
                  <span className="text-blue-500">{item.circuitId}</span>
                </p>
                <p>
                  ID: <span className="text-blue-500">{item.id}</span>
                </p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Query:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm text-gray-900">
                {JSON.stringify(body.scope[0].query, null, 2)}
              </code>
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Transaction Data:</h3>
            <div className="ml-4">
              <p>
                Chain ID:{" "}
                <span className="text-blue-500">
                  {body.transaction_data.chain_id}
                </span>
              </p>
              <p>
                Contract:{" "}
                <span className="text-blue-500">
                  {body.transaction_data.contract_address}
                </span>
              </p>
              <p>
                Network:{" "}
                <span className="text-blue-500">
                  {body.transaction_data.network}
                </span>
              </p>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      return <p className="text-red-500">Invalid metadata format</p>;
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!requestDetails) {
    return <div className="p-8">Request not found</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Request Details</h1>
      <div className="space-y-4 bg-muted/20 p-6 rounded-lg mb-8">
        <div>
          <h2 className="text-sm text-muted-foreground">Request ID</h2>
          <p className="font-mono">{requestDetails.requestId}</p>
        </div>
        <div>
          <h2 className="text-sm text-muted-foreground">Transaction Hash</h2>
          <p className="font-mono break-all">
            {requestDetails.transactionHash}
          </p>
        </div>
        <div>
          <h2 className="text-sm text-muted-foreground">Validator</h2>
          <p className="font-mono break-all">{requestDetails.validator}</p>
        </div>
        <div>
          <h2 className="text-sm text-muted-foreground">Request Owner</h2>
          <p className="font-mono break-all">{requestDetails.requestOwner}</p>
        </div>
        <div>
          <h2 className="text-sm text-muted-foreground">Metadata</h2>
          <div className="font-mono break-all mt-2">
            {requestDetails.metadata ? (
              formatMetadata(requestDetails.metadata)
            ) : (
              <p>No metadata available</p>
            )}
          </div>
        </div>
      </div>

      {responseDetails ? (
        <>
          <h2 className="text-xl font-bold mb-6">Response Details</h2>
          <div className="space-y-4 bg-muted/20 p-6 rounded-lg">
            <div>
              <h2 className="text-sm text-muted-foreground">
                Transaction Hash
              </h2>
              <p className="font-mono break-all">
                {responseDetails.transactionHash}
              </p>
            </div>
            <div>
              <h2 className="text-sm text-muted-foreground">Caller</h2>
              <p className="font-mono break-all">{responseDetails.caller}</p>
            </div>
            <div>
              <h2 className="text-sm text-muted-foreground">Block Timestamp</h2>
              <p className="font-mono">{responseDetails.blockTimestamp}</p>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-4 bg-muted/20 p-6 rounded-lg">
          <div>
            <h2 className="text-xl font-bold text-red-500">
              Proof Status: Not Verified
            </h2>
          </div>
        </div>
      )}
    </div>
  );
}
