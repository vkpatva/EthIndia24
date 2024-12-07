"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { QRCode } from "react-qrcode-logo";

export default function Home() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userData, setUserData] = useState<any>(null);
  const [universalLink, setUniversalLink] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);

  // Check URL parameters and fetch data on component mount
  useEffect(() => {
    const success = searchParams.get("success");
    const id = searchParams.get("id");

    if (success === "True" && id) {
      setCurrentStep(2);
      fetchUserData(id);
    }
  }, [searchParams]);

  const fetchUserData = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/credential?id=${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      setError("Failed to fetch user data. Please try again.");
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigilockerConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/connect", {
        method: "POST",
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No redirect URL received");
      }
    } catch (error) {
      setError("Failed to connect to DigiLocker. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueCredential = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        name: userData.aadhaar.name,
        dob: userData.aadhaar.dateOfBirth,
        gender: userData.aadhaar.gender || "",
        address: `${userData.aadhaar.address.house} ${userData.aadhaar.address.street}`,
        city: userData.aadhaar.address.postOffice,
        pincode: userData.aadhaar.address.pin,
      });

      const response = await fetch(`/api/issue?${params}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to issue credential");
      }

      const data = await response.json();
      setUniversalLink(data.universalLink);
      setDeepLink(data.deepLink);
    } catch (error) {
      setError("Failed to issue credential. Please try again.");
      console.error("Error issuing credential:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWallet = () => {
    if (universalLink) {
      window.location.href = universalLink;
    }
  };

  const steps = [
    {
      id: 1,
      name: "Login to Digilocker",
      status: currentStep >= 1 ? "complete" : "upcoming",
    },
    {
      id: 2,
      name: "Add to Wallet",
      status: currentStep >= 2 ? "complete" : "upcoming",
    },
  ];

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <nav aria-label="Progress" className="mb-8 px-4 py-8">
        <ol
          role="list"
          className="flex items-center justify-between max-w-full"
        >
          {steps.map((step, stepIdx) => (
            <li
              key={step.name}
              className={cn(
                stepIdx !== steps.length - 1 ? "w-full" : "",
                "relative"
              )}
            >
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                {stepIdx !== steps.length - 1 && (
                  <div
                    className={cn(
                      step.status === "current" ? "bg-gray-200" : "bg-gray-200",
                      "h-0.5 w-full"
                    )}
                  />
                )}
              </div>
              <div
                className={cn(
                  "relative flex h-8 w-8 items-center justify-center rounded-full",
                  step.status === "current"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-500"
                )}
              >
                <span className="text-sm font-medium">{step.id}</span>
                <span
                  className={cn(
                    "absolute mt-24 w-max text-sm font-medium",
                    step.status === "current" ? "text-black" : "text-gray-500"
                  )}
                >
                  {step.name}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      <div className="bg-white rounded-lg shadow-lg p-8 min-h-[400px] border border-gray-200">
        {currentStep === 1 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold">Login to Digilocker</h2>

            <div className="space-y-6">
              <h3 className="text-xl font-medium">
                Advantages of Verifiable Credentials
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="font-medium">🔒 Enhanced Security</h4>
                  <p className="text-gray-600">
                    Cryptographically secure and tamper-evident credentials that
                    ensure data integrity
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">🔐 Privacy Focused</h4>
                  <p className="text-gray-600">
                    Share only required information with selective disclosure
                    capabilities
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">✨ Instant Verification</h4>
                  <p className="text-gray-600">
                    Quick and efficient verification process without manual
                    intervention
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">🌐 Interoperability</h4>
                  <p className="text-gray-600">
                    Works across different systems and platforms using standard
                    protocols
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Button
                  onClick={handleDigilockerConnect}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect to DigiLocker"
                  )}
                </Button>

                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Generate Credentials</h2>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Fetching your data...</span>
              </div>
            )}

            {error && <div className="text-red-600 py-2">{error}</div>}

            {userData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Name
                      </label>
                      <p className="text-lg">
                        {userData.aadhaar?.name || "Ajay Srivastav"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Address
                      </label>
                      <p className="text-lg">
                        {`${userData.aadhaar?.address.house} ${userData.aadhaar?.address.street}` ||
                          "F-1202, KT Nagar, Abu Road , Rajasthan"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Date of Birth
                      </label>
                      <p className="text-lg">
                        {userData.aadhaar?.dateOfBirth || "1999-01-01"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        City
                      </label>
                      <p className="text-lg">
                        {userData.aadhaar?.address.postOffice || "Abu"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Pincode
                      </label>
                      <p className="text-lg">
                        {userData.aadhaar?.address.pin || "389991"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <div className="w-96 h-96 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    {universalLink ? (
                      <QRCode
                        value={deepLink || ""}
                        size={384} // slightly smaller than container to ensure padding
                      />
                    ) : (
                      <p className="text-gray-500">QR Code will appear here</p>
                    )}
                  </div>
                  <Button
                    className="w-48"
                    onClick={
                      universalLink ? handleAddToWallet : handleIssueCredential
                    }
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : universalLink ? (
                      "Add to Webwallet"
                    ) : (
                      "Generate Credential"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
