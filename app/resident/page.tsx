"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ResidentData {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  extName: string;
  birthday: string;
  birthPlace: string;
  gender: string;
  civilStatus: string;
  nationality: string;
  religion: string;
  email: string;
  phoneNumber: string;
  houseNo: string;
  purok: string;
  workingStatus: string;
  sourceOfIncome: string;
  votingStatus: string;
  educationalAttainment: string;
  soloParent: boolean;
  fourPsBeneficiary: boolean;
  pwd: boolean;
  pwdType: string | null;
}

export default function ResidentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resident, setResident] = useState<ResidentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/");
      return;
    }

    // Validate user role
    if (session.user.role !== 'resident') {
      router.push("/");
      return;
    }

    // Fetch resident data
    const fetchResident = async () => {
      try {
        const response = await fetch(`/api/get-resident?id=${session.user.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Error fetching resident details");
        }

        setResident(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Error fetching resident details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResident();
  }, [session, status, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-700">Loading...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Data Found</h2>
          <p className="text-gray-600">Resident information not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-green-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Resident Information</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-800">
                  {resident.firstName} {resident.middleName} {resident.lastName} {resident.extName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Birthday</label>
                <p className="text-gray-800">{new Date(resident.birthday).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Birth Place</label>
                <p className="text-gray-800">{resident.birthPlace}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Gender</label>
                <p className="text-gray-800">{resident.gender}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Civil Status</label>
                <p className="text-gray-800">{resident.civilStatus}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Nationality</label>
                <p className="text-gray-800">{resident.nationality}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Religion</label>
                <p className="text-gray-800">{resident.religion}</p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-800">{resident.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                <p className="text-gray-800">{resident.phoneNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Address</label>
                <p className="text-gray-800">House No. {resident.houseNo}, Purok {resident.purok}</p>
              </div>
            </div>
          </section>

          {/* Work and Education */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Work and Education</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Working Status</label>
                <p className="text-gray-800">{resident.workingStatus}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Source of Income</label>
                <p className="text-gray-800">{resident.sourceOfIncome || "N/A"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Educational Attainment</label>
                <p className="text-gray-800">{resident.educationalAttainment}</p>
              </div>
            </div>
          </section>

          {/* Additional Information */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Voting Status</label>
                <p className="text-gray-800">{resident.votingStatus}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Solo Parent</label>
                <p className="text-gray-800">{resident.soloParent ? "Yes" : "No"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">4Ps Beneficiary</label>
                <p className="text-gray-800">{resident.fourPsBeneficiary ? "Yes" : "No"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">PWD</label>
                <p className="text-gray-800">{resident.pwd ? "Yes" : "No"}</p>
              </div>
              {resident.pwd && resident.pwdType && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">PWD Type</label>
                  <p className="text-gray-800">{resident.pwdType}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
