import { useEffect, useRef, useState } from "react";
import TechnicianHeader from "../components/TechnicianProfile/TechnicianHeader";
import TechnicianAbout from "../components/TechnicianProfile/TechnicianAbout";
import TechnicianSkills from "../components/TechnicianProfile/TechnicianCertifications";
import TechnicianReviews from "../components/TechnicianProfile/TechnicianReviews";
import TechnicianVerificationModal from "../components/TechnicianProfile/TechnicianVerificationModal";
import { useAuth } from "../hooks/auth/useAuth";
import { useTechnicianProfile } from "../hooks/Technician/useTechnicianProfile";
import { useTechnicianCertifications } from "../hooks/Technician/useTechnicianCertifications";
import { uploadTechnicianProfileImage } from "../services/api/technicianUploads";
import { useTechnicianReviews } from "../hooks/Technician/useTechnicianReviews";
import { useLocation, useParams } from "react-router-dom";
import type { TechnicianAvailability } from "../services/api/types";

type TechnicianFormState = {
  name: string;
  specialization: string;
  location: string;
  years_experience: string;
  bio: string;
  short_description: string;
  skills: string;
  phone: string;
  email: string;
  availability: TechnicianAvailability;
};

const TechnicianProfile = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const isTechnicianUser = user?.role === "technician";
  const location = useLocation() as any;
  const { technicianId: technicianIdParam } = useParams();
  const viewProfileId = technicianIdParam ? Number(technicianIdParam) : location.state?.id;
  const ownerUserId = isTechnicianUser && !viewProfileId ? userId : undefined;

  const { profile, loading, error, createProfile, updateProfile, refresh } = useTechnicianProfile(ownerUserId, viewProfileId);
  const { certs, updateCertification, deleteCertification, loading: certLoading } =
    useTechnicianCertifications(ownerUserId);
  const { reviews } = useTechnicianReviews(viewProfileId || userId);

  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // form state
  const [form, setForm] = useState<TechnicianFormState>({
    name: "",
    specialization: "",
    location: "",
    years_experience: "",
    bio: "",
    short_description: "",
    skills: "",
    phone: "",
    email: "",
    availability: "Available",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        specialization: profile.specialization || "",
        location: profile.location || "",
        years_experience: profile.years_experience ? String(profile.years_experience) : "",
        bio: profile.bio || "",
        short_description: profile.short_description || "",
        skills: profile.skills?.join(", ") || "",
        phone: profile.contact?.phone || "",
        email: profile.contact?.email || "",
        availability: profile.availability || "Available",
      });
    }
  }, [profile]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      specialization: form.specialization,
      location: form.location,
      years_experience: form.years_experience ? Number(form.years_experience) : undefined,
      bio: form.bio,
      short_description: form.short_description,
      skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      contact: { phone: form.phone, email: form.email },
      availability: form.availability,
    };

    if (profile) {
      await updateProfile(payload);
    } else {
      await createProfile(payload);
    }
    await refresh();
    setIsEditModalOpen(false);
  };

  const handleProfileImageUpload = async (file: File) => {
    if (!userId) return;
    
    console.log(await uploadTechnicianProfileImage(userId, file))
    await refresh();
  };

  const experienceText = profile?.years_experience ? `${profile.years_experience} years` : undefined;
  const contactText = profile?.contact?.phone;
  const emailText = profile?.contact?.email;

  const isOwner = Boolean(userId && profile && profile.user_id === userId && !viewProfileId);

  if (!userId && !viewProfileId) {
    return <div className="p-6">Please log in to view profiles.</div>;
  }

  if (!viewProfileId && !isTechnicianUser) {
    return <div className="p-6">Open a technician profile from the directory to view details.</div>;
  }

  return (
    <section className="p-6 bg-surface-light dark:bg-surface-dark rounded-xl shadow-md space-y-6">
      {loading && <p>Loading profile...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Profile header */}
      {profile && (
        <TechnicianHeader
          name={profile.name}
          specialization={profile.specialization || ""}
          location={profile.location || ""}
          experience={experienceText}
          rating={profile.average_rating || 0}
          availability={profile.availability || "Available"}
          contact={contactText || undefined}
          email={emailText || undefined}
          verified={profile.verified}
          imageUrl={profile.profile_image_url || undefined}
          isTechnicianView={isOwner}
          onChangeAvailability={async (status) => {
            await updateProfile({ availability: status });
            await refresh();
          }}
          onEditProfile={() => setIsEditModalOpen(true)}
          onUploadImage={() => fileInputRef.current?.click()}
        />
      )}

      {/* Quick actions */}
      {isOwner && <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={() => setIsEditModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
        >
          {profile ? "Edit Profile" : "Create Profile"}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md text-sm font-medium"
        >
          Upload Photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleProfileImageUpload(file);
          }}
        />
      </div>}

      {/* Verification prompt (owner only) */}
      {profile && !profile.verified && isOwner && (
        <div className="text-xs md:text-sm bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Your account is currently unverified. Upload certifications for admin review.</span>
          <button onClick={() => setIsVerifyModalOpen(true)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-md text-xs md:text-sm font-medium transition">
            Verify Now
          </button>
        </div>
      )}

      {/* Certifications list */}
      {isOwner && <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">Certifications</h3>
          <button onClick={() => setIsVerifyModalOpen(true)} className="text-blue-600 text-sm">Add certification</button>
        </div>
        {certLoading && <p>Loading certifications...</p>}
        {certs.length === 0 && <p className="text-sm text-gray-500">No certifications uploaded.</p>}
        <ul className="space-y-2">
          {certs.map((c) => (
            <li key={c.id} className="flex items-center justify-between text-sm border p-2 rounded">
              <div>
                <div className="font-medium">{c.title || "Certification"}</div>
                <div className="text-gray-500">{c.verified ? "Verified" : "Pending"}</div>
              </div>
              {!c.verified && (
                <div className="flex gap-2">
                  <button className="text-blue-600" onClick={() => updateCertification(c.id, { title: c.title || "" })}>Edit</button>
                  <button className="text-red-600" onClick={() => deleteCertification(c.id)}>Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>}

      {/* Existing UI sections (bio/skills/reviews) use profile data when available */}
      {profile && (
        <>
          <TechnicianAbout
            bio={profile.bio || ""}
            summary={profile.short_description || ""}
            skills={profile.skills || []}
            specialization={profile.specialization || ""}
            verified={profile.verified}
          />
          <TechnicianSkills
            experience={experienceText}
            certifications={certs.map((c) => c.title || "Certification")}
            verified={profile.verified}
          />
          <TechnicianReviews reviews={reviews} verified={profile.verified} />
        </>
      )}

      {/* Verification Modal */}
      <TechnicianVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
    technicianId={String(profile?.user_id || userId)}
        specialization={form.specialization || profile?.specialization || ""}
        existingCertifications={certs.map((c) => c.title || "Certification")}
      />

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl p-6 space-y-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {profile ? "Edit profile" : "Create profile"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep your public profile up to date for builders and admins.
                </p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Specialization</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Electrical, Plumbing"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Location</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City / Region"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Years experience</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 5"
                    value={form.years_experience}
                    onChange={(e) => setForm({ ...form, years_experience: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Skills</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Comma separated skills"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Availability</label>
                  <select
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.availability}
                    onChange={(e) =>
                      setForm({ ...form, availability: e.target.value as TechnicianAvailability })
                    }
                  >
                    <option>Available</option>
                    <option>Busy</option>
                    <option>Away</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Phone</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contact number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contact email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-700 dark:text-gray-300">Short description</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="One-liner about your services"
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-700 dark:text-gray-300">Bio</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Share more about your experience and projects"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold">
                  {profile ? "Update Profile" : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default TechnicianProfile;
