import { useState } from "react";

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isInternational: boolean;
  ageConfirmed: boolean;
}

interface CheckoutFormProps {
  onSubmit: (data: CheckoutFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  hasAgeRestrictedItems: boolean;
}

export default function CheckoutForm({
  onSubmit,
  onCancel,
  isSubmitting,
  hasAgeRestrictedItems,
}: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    firstName: "",
    lastName: "",
    email: "",
    confirmEmail: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
    isInternational: false,
    ageConfirmed: false,
  });

  const [emailError, setEmailError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email !== formData.confirmEmail) {
      setEmailError("Email addresses do not match");
      return;
    }
    setEmailError("");
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: newValue,
      };

      // Check email match when either email field changes
      if (name === "email" || name === "confirmEmail") {
        const email = name === "email" ? newValue : prev.email;
        const confirmEmail =
          name === "confirmEmail" ? newValue : prev.confirmEmail;
        setEmailError(
          email !== confirmEmail ? "Email addresses do not match" : ""
        );
      }

      return newData;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-purple-700"
          >
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-purple-700"
          >
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-purple-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 ${
              emailError ? "border-red-300" : "border-purple-300"
            }`}
          />
        </div>

        <div>
          <label
            htmlFor="confirmEmail"
            className="block text-sm font-medium text-purple-700"
          >
            Confirm Email
          </label>
          <input
            type="email"
            name="confirmEmail"
            id="confirmEmail"
            required
            value={formData.confirmEmail}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 ${
              emailError ? "border-red-300" : "border-purple-300"
            }`}
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-600">{emailError}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-purple-700"
          >
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-purple-700"
          >
            Address
          </label>
          <input
            type="text"
            name="address"
            id="address"
            required
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-purple-700"
          >
            City
          </label>
          <input
            type="text"
            name="city"
            id="city"
            required
            value={formData.city}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-purple-700"
          >
            State
          </label>
          <input
            type="text"
            name="state"
            id="state"
            required
            value={formData.state}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label
            htmlFor="zipCode"
            className="block text-sm font-medium text-purple-700"
          >
            ZIP Code
          </label>
          <input
            type="text"
            name="zipCode"
            id="zipCode"
            required
            value={formData.zipCode}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          />
        </div>

        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-purple-700"
          >
            Country
          </label>
          <select
            name="country"
            id="country"
            required
            value={formData.country}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="MX">Mexico</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {hasAgeRestrictedItems && (
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              name="ageConfirmed"
              id="ageConfirmed"
              required
              checked={formData.ageConfirmed}
              onChange={handleChange}
              className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor="ageConfirmed"
              className="font-medium text-purple-700"
            >
              Age Confirmation
            </label>
            <p className="text-purple-500">
              I confirm that I am at least 21 years old and will provide valid
              ID upon pickup.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-purple-700 bg-white border border-purple-300 rounded-md shadow-sm hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !!emailError}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Processing..." : "Complete Order"}
        </button>
      </div>
    </form>
  );
}
