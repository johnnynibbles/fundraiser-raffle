import { useState } from "react";

interface CheckoutFormProps {
  totalTickets: number;
  totalPrice: number;
  onSubmit: (formData: CheckoutFormData) => void;
  onCancel: () => void;
  hasAgeRestrictedItems: boolean;
}

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

function CheckoutForm({
  totalTickets,
  totalPrice,
  onSubmit,
  onCancel,
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
  const [formErrors, setFormErrors] = useState<{
    ageConfirmed?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email match
    if (formData.email !== formData.confirmEmail) {
      setEmailError("Email addresses do not match");
      return;
    }

    // Validate age confirmation if needed
    if (hasAgeRestrictedItems && !formData.ageConfirmed) {
      setFormErrors({ ageConfirmed: "You must confirm you are 21 or older" });
      return;
    }

    setEmailError("");
    setFormErrors({});
    onSubmit(formData);
  };

  const handleEmailChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isConfirm: boolean
  ) => {
    const newEmail = e.target.value;
    if (isConfirm) {
      setFormData({ ...formData, confirmEmail: newEmail });
      setEmailError(
        newEmail !== formData.email ? "Email addresses do not match" : ""
      );
    } else {
      setFormData({ ...formData, email: newEmail });
      setEmailError(
        newEmail !== formData.confirmEmail ? "Email addresses do not match" : ""
      );
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const isInternational = e.target.value !== "US";
    setFormData({
      ...formData,
      country: e.target.value,
      isInternational,
      // Clear state if international
      state: isInternational ? "" : formData.state,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Checkout</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Tickets: {totalTickets}</span>
            <span>Total Price: ${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => handleEmailChange(e, false)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="confirmEmail"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Email Address
              </label>
              <input
                type="email"
                id="confirmEmail"
                required
                value={formData.confirmEmail}
                onChange={(e) => handleEmailChange(e, true)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  emailError ? "border-red-300" : "border-gray-300"
                }`}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <select
              id="country"
              required
              value={formData.country}
              onChange={handleCountryChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="MX">Mexico</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Street Address
            </label>
            <input
              type="text"
              id="address"
              required
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                required
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            {!formData.isInternational && (
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State
                </label>
                <input
                  type="text"
                  id="state"
                  required
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-medium text-gray-700"
              >
                {formData.isInternational ? "Postal Code" : "ZIP Code"}
              </label>
              <input
                type="text"
                id="zipCode"
                required
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData({ ...formData, zipCode: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {hasAgeRestrictedItems && (
            <div className="mt-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="ageConfirmed"
                    type="checkbox"
                    checked={formData.ageConfirmed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ageConfirmed: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="ageConfirmed"
                    className="font-medium text-gray-700"
                  >
                    I confirm that I am 21 years of age or older
                  </label>
                  {formErrors.ageConfirmed && (
                    <p className="mt-1 text-red-600">
                      {formErrors.ageConfirmed}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !!emailError ||
                (hasAgeRestrictedItems && !formData.ageConfirmed)
              }
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Purchase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CheckoutForm;
