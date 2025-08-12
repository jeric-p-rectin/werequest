// app/components/Profile.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { FaUserCircle } from "react-icons/fa";

/**
 * Full frontend-only Profile component:
 * - Loads /api/profile/get-profile
 * - All requested fields editable for non-admin users
 * - Client-side validation according to schema
 * - Computes read-only age from birthday
 * - On Save: validates, stores payload to localStorage, shows preview (no backend update)
 */

type Role = "admin" | "super admin" | string | undefined;

interface ProfileData {
  username?: string;
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  extName?: string;
  fullName?: string;
  birthday?: string; // ISO date string
  birthPlace?: string;
  age?: number;
  gender?: string;
  civilStatus?: string;
  nationality?: string;
  religion?: string;
  phoneNumber?: string;
  houseNo?: string;
  purok?: string;
  workingStatus?: string;
  sourceOfIncome?: string;
  votingStatus?: string;
  educationalAttainment?: string;
  // you can add other fields if needed later
}

interface EditableFields extends ProfileData {
  password?: string;
  confirmPassword?: string;
}

const PUROK_OPTIONS = ["purok1", "purok2", "purok3", "purok4", "purok5", "purok6", "purok7"];
const GENDER_OPTIONS = ["male", "female"];
const CIVIL_STATUS_OPTIONS = ["single", "married", "widow", "separated"];
const WORKING_STATUS_OPTIONS = ["employed", "unemployed", "self-employed", "student", "retired"];
const VOTING_OPTIONS = ["registered", "not-registered"];
const EDUCATION_OPTIONS = ["elementary", "highschool", "vocational", "college", "postgraduate"];

function computeAge(birthdayISO?: string) {
  if (!birthdayISO) return undefined;
  const b = new Date(birthdayISO);
  if (isNaN(b.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

function isAtLeast13YearsOld(birthdayISO?: string) {
  if (!birthdayISO) return false;
  const b = new Date(birthdayISO);
  if (isNaN(b.getTime())) return false;
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 13);
  // birthday must be <= minDate
  return b <= minDate;
}

export default function Profile() {
  const { data: session } = useSession();
  const role: Role = session?.user?.role;
  const isAdminUser = role === "admin" || role === "super admin";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editable, setEditable] = useState<EditableFields>({
    email: "",
    username: "",
    firstName: "",
    middleName: "",
    lastName: "",
    extName: "",
    fullName: "",
    birthday: "",
    birthPlace: "",
    age: undefined,
    gender: "",
    civilStatus: "",
    nationality: "Filipino",
    religion: "",
    phoneNumber: "",
    houseNo: "",
    purok: "",
    workingStatus: "",
    sourceOfIncome: "",
    votingStatus: "",
    educationalAttainment: "",
    password: "",
    confirmPassword: ""
  });

  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile/get-profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed to load profile");
      const data: ProfileData = result.data;

      // compute age
      const age = computeAge(data.birthday);

      setProfileData({ ...data, age });
      setEditable((prev) => ({
        ...prev,
        username: data.username || "",
        email: data.email || "",
        firstName: data.firstName || "",
        middleName: data.middleName || "",
        lastName: data.lastName || "",
        extName: data.extName || "",
        fullName: data.fullName || `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        birthday: data.birthday || "",
        birthPlace: data.birthPlace || "",
        age,
        gender: data.gender || "",
        civilStatus: data.civilStatus || "",
        nationality: data.nationality || "Filipino",
        religion: data.religion || "",
        phoneNumber: data.phoneNumber || "",
        houseNo: data.houseNo || "",
        purok: data.purok || "",
        workingStatus: data.workingStatus || "",
        sourceOfIncome: data.sourceOfIncome || "",
        votingStatus: data.votingStatus || "",
        educationalAttainment: data.educationalAttainment || "",
        password: "",
        confirmPassword: ""
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: keyof EditableFields, value: string) => {
    setEditable((prev) => {
      const next = { ...prev, [name]: value };

      // if birthday changed, recompute age and fullName when name parts change
      if (name === "birthday") {
        next.age = computeAge(value);
      }
      if (name === "firstName" || name === "lastName" || name === "extName") {
        const first = name === "firstName" ? value : prev.firstName || "";
        const last = name === "lastName" ? value : prev.lastName || "";
        const ext = name === "extName" ? value : prev.extName || "";
        next.fullName = `${first} ${last}${ext ? ", " + ext : ""}`.trim();
      }

      return next;
    });
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    // Common required fields from your JSON schema
    // personalInformation: firstName, lastName
    if (!isAdminUser) {
      if (!editable.firstName || editable.firstName.trim() === "") {
        errors.firstName = "First name is required";
      }
      if (!editable.lastName || editable.lastName.trim() === "") {
        errors.lastName = "Last name is required";
      }

      // birthInformation
      if (!editable.birthday) {
        errors.birthday = "Birthday is required";
      } else if (!isAtLeast13YearsOld(editable.birthday)) {
        errors.birthday = "User must be at least 13 years old";
      }
      if (!editable.birthPlace || editable.birthPlace.trim() === "") {
        errors.birthPlace = "Birth place is required";
      }

      // personalDetails
      if (!editable.gender) errors.gender = "Gender is required";
      if (!editable.civilStatus) errors.civilStatus = "Civil status is required";
      if (!editable.religion) errors.religion = "Religion is required";
      if (!editable.nationality) errors.nationality = "Nationality is required";

      // contactInformation
      if (!editable.email) errors.email = "Email is required";
      // simple email regex check
      if (editable.email && !/^\S+@\S+\.\S+$/.test(editable.email)) {
        errors.email = "Invalid email format";
      }
      if (!editable.phoneNumber) errors.phoneNumber = "Phone number is required";

      // address
      if (!editable.houseNo) errors.houseNo = "House number is required";
      if (!editable.purok) errors.purok = "Purok is required";

      // workAndStatus
      if (!editable.workingStatus) errors.workingStatus = "Working status is required";

      // additionalInformation
      if (!editable.votingStatus) errors.votingStatus = "Voting status is required";
      if (!editable.educationalAttainment) errors.educationalAttainment = "Educational attainment is required";

      // password rules already handled below for admin
    }

    // Password rules for admin only
    if (isAdminUser) {
      if (editable.password || editable.confirmPassword) {
        if (editable.password !== editable.confirmPassword) {
          errors.password = "Passwords do not match";
        }
        if (editable.password && editable.password.length < 6) {
          errors.password = "Password must be at least 6 characters";
        }
      }
    } else {
      // residents cannot change password locally
      if (editable.password || editable.confirmPassword) {
        errors.password = "Residents cannot change password";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCancel = () => {
    // revert to loaded profileData
    if (!profileData) return;
    setEditable((prev) => ({
      ...prev,
      username: profileData.username || "",
      email: profileData.email || "",
      firstName: profileData.firstName || "",
      middleName: profileData.middleName || "",
      lastName: profileData.lastName || "",
      extName: profileData.extName || "",
      fullName: profileData.fullName || `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim(),
      birthday: profileData.birthday || "",
      birthPlace: profileData.birthPlace || "",
      age: profileData.age,
      gender: profileData.gender || "",
      civilStatus: profileData.civilStatus || "",
      nationality: profileData.nationality || "Filipino",
      religion: profileData.religion || "",
      phoneNumber: profileData.phoneNumber || "",
      houseNo: profileData.houseNo || "",
      purok: profileData.purok || "",
      workingStatus: profileData.workingStatus || "",
      sourceOfIncome: profileData.sourceOfIncome || "",
      votingStatus: profileData.votingStatus || "",
      educationalAttainment: profileData.educationalAttainment || "",
      password: "",
      confirmPassword: ""
    }));
    setValidationErrors({});
    setIsEditing(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();

    setError(null);

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Build the payload that would be sent to backend
    const payload: Partial<ProfileData & { password?: string }> = {
      username: editable.username,
      email: editable.email,
      firstName: editable.firstName,
      middleName: editable.middleName,
      lastName: editable.lastName,
      extName: editable.extName,
      fullName: editable.fullName,
      birthday: editable.birthday,
      birthPlace: editable.birthPlace,
      age: editable.age,
      gender: editable.gender,
      civilStatus: editable.civilStatus,
      nationality: editable.nationality,
      religion: editable.religion,
      phoneNumber: editable.phoneNumber,
      houseNo: editable.houseNo,
      purok: editable.purok,
      workingStatus: editable.workingStatus,
      sourceOfIncome: editable.sourceOfIncome,
      votingStatus: editable.votingStatus,
      educationalAttainment: editable.educationalAttainment
    };

    if (isAdminUser && editable.password) {
      payload.password = editable.password;
    }

    const res = await fetch('/api/profile/edit-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (!result.success) { setError(result.error || 'Failed'); return; }

    // If/when you want to enable the real request, replace the above localStorage block
    // with something like:
    //
    // const res = await fetch('/api/profile/edit-profile', {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload)
    // });
    // const result = await res.json();
    // if (!result.success) { setError(result.error || 'Failed'); return; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 text-center">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <header className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-green-500 flex items-center justify-center bg-gray-50">
            <FaUserCircle className="w-20 h-20 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{profileData?.fullName || "User Profile"}</h1>
            <p className="text-black capitalize">{role || "user"}</p>
          </div>

          <div className="ml-auto flex gap-2">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Sign Out
            </button>
            <button
              onClick={() => { setIsEditing((s) => !s); setValidationErrors({}); }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {isEditing ? "Exit Edit" : "Edit Profile"}
            </button>
          </div>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          {/* ACCOUNT */}
          <section className="border-t pt-4">
            <h2 className="text-lg text-black font-medium mb-3">Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-black">Username</label>
                <input
                  name="username"
                  value={editable.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                  disabled={!isEditing || isAdminUser === false ? false : !isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                />
              </div>

              <div>
                <label className="block text-sm text-black">Email</label>
                <input
                  name="email"
                  type="email"
                  value={editable.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                />
                {validationErrors.email && <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>}
              </div>

              {isAdminUser && (
                <div>
                  <label className="block text-sm text-black">New Password</label>
                  <input
                    name="password"
                    type="password"
                    value={editable.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    value={editable.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    placeholder="Confirm new password"
                    className="mt-2 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                  {validationErrors.password && <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>}
                </div>
              )}
            </div>
          </section>

          {/* PERSONAL INFO */}
          {!isAdminUser && (
            <section>
              <h2 className="text-lg text-black font-medium mb-3">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-black">First Name *</label>
                  <input
                    value={editable.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  />
                  {validationErrors.firstName && <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm text-black">Middle Name</label>
                  <input
                    value={editable.middleName}
                    onChange={(e) => handleChange("middleName", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm text-black">Last Name *</label>
                  <input
                    value={editable.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  />
                  {validationErrors.lastName && <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>}
                </div>

                <div>
                  <label className="block text-sm">Extension Name</label>
                  <input
                    value={editable.extName}
                    onChange={(e) => handleChange("extName", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm text-black">Full Name (auto)</label>
                  <input
                    value={editable.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-black">Birthday *</label>
                  <input
                    type="date"
                    value={editable.birthday || ""}
                    onChange={(e) => handleChange("birthday", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split("T")[0]}
                  />
                  {validationErrors.birthday && <p className="text-red-500 text-sm mt-1">{validationErrors.birthday}</p>}
                </div>

                <div>
                  <label className="block text-sm text-black">Age</label>
                  <input
                    value={editable.age ?? ""}
                    disabled
                    className="mt-1 block w-full text-black rounded-md border-gray-300 shadow-sm bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-black">Birth Place *</label>
                  <input
                    value={editable.birthPlace}
                    onChange={(e) => handleChange("birthPlace", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  />
                  {validationErrors.birthPlace && <p className="text-red-500 text-sm mt-1">{validationErrors.birthPlace}</p>}
                </div>

                <div>
                  <label className="block text-sm text-black">Gender *</label>
                  <select
                    value={editable.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  >
                    <option value="">Select</option>
                    {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {validationErrors.gender && <p className="text-red-500 text-sm mt-1">{validationErrors.gender}</p>}
                </div>

                <div>
                  <label className="block text-sm text-black">Civil Status *</label>
                  <select
                    value={editable.civilStatus}
                    onChange={(e) => handleChange("civilStatus", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  >
                    <option value="">Select</option>
                    {CIVIL_STATUS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {validationErrors.civilStatus && <p className="text-red-500 text-sm mt-1">{validationErrors.civilStatus}</p>}
                </div>

                <div>
                  <label className="block text-sm text-black">Nationality *</label>
                  <input
                    value={editable.nationality}
                    onChange={(e) => handleChange("nationality", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  />
                  {validationErrors.nationality && <p className="text-red-500 text-sm mt-1">{validationErrors.nationality}</p>}
                </div>

                <div>
                  <label className="block text-sm text-black">Religion *</label>
                  <input
                    value={editable.religion}
                    onChange={(e) => handleChange("religion", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  />
                  {validationErrors.religion && <p className="text-red-500 text-sm mt-1">{validationErrors.religion}</p>}
                </div>
              </div>
            </section>
          )}

          {/* CONTACT & ADDRESS */}
          {!isAdminUser && (
            <section>
              <h2 className="text-lg text-black font-medium mb-3">Contact & Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-black">Phone Number *</label>
                  <input
                    value={editable.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  />
                  {validationErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{validationErrors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm text-black">House No. *</label>
                  <input
                    value={editable.houseNo}
                    onChange={(e) => handleChange("houseNo", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  />
                  {validationErrors.houseNo && <p className="text-red-500 text-sm mt-1">{validationErrors.houseNo}</p>}
                </div>

                <div>
                  <label className="block text-sm text-black">Purok *</label>
                  <select
                    value={editable.purok}
                    onChange={(e) => handleChange("purok", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  >
                    <option value="">Select</option>
                    {PUROK_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {validationErrors.purok && <p className="text-red-500 text-sm mt-1">{validationErrors.purok}</p>}
                </div>
              </div>
            </section>
          )}

          {/* WORK & ADDITIONAL */}
          {!isAdminUser && (
            <section>
              <h2 className="text-lg text-black font-medium mb-3">Work & Additional Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-black">Working Status *</label>
                  <select
                    value={editable.workingStatus}
                    onChange={(e) => handleChange("workingStatus", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  >
                    <option value="">Select</option>
                    {WORKING_STATUS_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                  {validationErrors.workingStatus && <p className="text-red-500 text-sm mt-1">{validationErrors.workingStatus}</p>}
                </div>

                <div>
                  <label className="block text-sm text-black">Source of Income</label>
                  <input
                    value={editable.sourceOfIncome}
                    onChange={(e) => handleChange("sourceOfIncome", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm text-black">Voting Status *</label>
                  <select
                    value={editable.votingStatus}
                    onChange={(e) => handleChange("votingStatus", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  >
                    <option value="">Select</option>
                    {VOTING_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                  {validationErrors.votingStatus && <p className="text-red-500 text-sm mt-1">{validationErrors.votingStatus}</p>}
                </div>

                <div>
                  <label className="block text-sm text-black">Educational Attainment *</label>
                  <select
                    value={editable.educationalAttainment}
                    onChange={(e) => handleChange("educationalAttainment", e.target.value)}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black"
                  >
                    <option value="">Select</option>
                    {EDUCATION_OPTIONS.map((ed) => <option key={ed} value={ed}>{ed}</option>)}
                  </select>
                  {validationErrors.educationalAttainment && <p className="text-red-500 text-sm mt-1">{validationErrors.educationalAttainment}</p>}
                </div>
              </div>
            </section>
          )}

          {/* ACTIONS */}
          {isEditing ? (
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Edit Profile
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
