import React, { useState } from "react";

const initialCompany = {
  name: "",
  legalName: "",
  industry: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  pincode: "",
};

export default function Company() {
  const [company, setCompany] = useState(initialCompany);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCompany((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Temporary frontend save.
    // Backend API can be connected later.
    localStorage.setItem("hrms_company", JSON.stringify(company));

    setSaved(true);
  };

  return (
    <div className="min-h-full bg-[#f7f7f2] p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-primary/40">
            Organization
          </p>

          <h1 className="mt-1 text-2xl font-black text-primary">
            Company
          </h1>

          <p className="mt-1 text-sm text-primary/60">
            Manage your company information and organization details.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-base font-bold text-primary">
                Company Information
              </h2>

              <p className="mt-1 text-xs text-primary/50">
                Enter the basic information used across the HRMS.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Company Name"
                name="name"
                value={company.name}
                onChange={handleChange}
                required
              />

              <Field
                label="Legal Name"
                name="legalName"
                value={company.legalName}
                onChange={handleChange}
              />

              <Field
                label="Industry"
                name="industry"
                value={company.industry}
                onChange={handleChange}
                placeholder="e.g. Information Technology"
              />

              <Field
                label="Company Email"
                name="email"
                type="email"
                value={company.email}
                onChange={handleChange}
              />

              <Field
                label="Phone"
                name="phone"
                value={company.phone}
                onChange={handleChange}
              />

              <Field
                label="Website"
                name="website"
                value={company.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="my-7 border-t border-primary/10" />

            <div className="mb-5">
              <h2 className="text-base font-bold text-primary">
                Company Address
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Address"
                name="address"
                value={company.address}
                onChange={handleChange}
                className="md:col-span-2"
              />

              <Field
                label="City"
                name="city"
                value={company.city}
                onChange={handleChange}
              />

              <Field
                label="State"
                name="state"
                value={company.state}
                onChange={handleChange}
              />

              <Field
                label="Country"
                name="country"
                value={company.country}
                onChange={handleChange}
              />

              <Field
                label="Pincode"
                name="pincode"
                value={company.pincode}
                onChange={handleChange}
              />
            </div>

            {/* Footer */}
            <div className="mt-7 flex items-center justify-end gap-3 border-t border-primary/10 pt-5">
              {saved && (
                <span className="text-xs font-semibold text-green-600">
                  Company details saved
                </span>
              )}

              <button
                type="submit"
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-bold text-primary/70">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-primary/10 bg-[#fafaf7] px-3.5 py-2.5 text-sm text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}