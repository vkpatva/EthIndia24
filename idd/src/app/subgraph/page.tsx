"use client";
import { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function Subgraph() {
  const [requestData, setRequestData] = useState([]);
  const [searchOwner, setSearchOwner] = useState("");
  const [searchRequestId, setSearchRequestId] = useState("");
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleRequestClick = (requestId: string) => {
    router.push(`/request/${requestId}`);
  };

  const QueryURL =
    "https://api.studio.thegraph.com/query/97506/privado-zkevm/version/latest";
  const client = new ApolloClient({
    uri: QueryURL,
    cache: new InMemoryCache(),
  });
  const query = `{
  zkprequestSets(first: 100, orderBy: blockTimestamp, orderDirection: desc) {
    requestId
    transactionHash
    validator
    requestOwner
    id
  }
}`;
  useEffect(() => {
    client
      .query({
        query: gql(query),
      })
      .then((data) => {
        setRequestData(data.data.zkprequestSets);
      })
      .catch((err) => {
        console.log("Error fetching data: ", err);
      });
  }, []);

  const filteredData = requestData.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (request: any) =>
      request.requestOwner.toLowerCase().includes(searchOwner.toLowerCase()) &&
      request.requestId.toLowerCase().includes(searchRequestId.toLowerCase())
  );

  // Add pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Universal Verifier Requests</h1>
        <div className="flex gap-4 flex-wrap">
          <Input
            placeholder="Search by request owner..."
            value={searchOwner}
            onChange={(e) => setSearchOwner(e.target.value)}
            className="max-w-md"
          />
          <Input
            placeholder="Search by request ID..."
            value={searchRequestId}
            onChange={(e) => setSearchRequestId(e.target.value)}
            className="max-w-md"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Request ID</TableHead>
              <TableHead className="font-semibold">Transaction Hash</TableHead>
              <TableHead className="font-semibold">Validator</TableHead>
              <TableHead className="font-semibold">Request Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map(
              (request: {
                requestId: string;
                transactionHash: string;
                validator: string;
                requestOwner: string;
                id: string;
              }) => (
                <TableRow key={request.requestId} className="hover:bg-muted/50">
                  <TableCell
                    className="font-mono cursor-pointer hover:text-blue-500 hover:underline"
                    onClick={() => handleRequestClick(request.requestId)}
                  >
                    {request.requestId}
                  </TableCell>
                  <TableCell className="font-mono truncate max-w-[200px]">
                    {request.transactionHash}
                  </TableCell>
                  <TableCell className="font-mono truncate max-w-[200px]">
                    {request.validator}
                  </TableCell>
                  <TableCell className="font-mono truncate max-w-[200px]">
                    {request.requestOwner}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add pagination controls below the table */}
      <div className="mt-4 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  onClick={() => setCurrentPage(i + 1)}
                  isActive={currentPage === i + 1}
                  className="cursor-pointer"
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
