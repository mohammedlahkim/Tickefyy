import React, { useState } from "react";
import { Link } from "react-router-dom";

const ContactUs = () => {
  // State for Contact Information (left section)
  const [contactInfo, setContactInfo] = useState({
    phone: "+212 0666666666",
    email: "demo@gmail.com",
    address: "Address",
  });

  // State for Contact US form (right section)
  const [formData, setFormData] = useState({
    fullName: "Mohammed Lahkim",
    email: "mohammedlahkim@gmail.com",
    phone: "0666666666",
    message: "",
    subject: "General Inquiry", // Default subject
  });

  // Handler for Contact Information inputs
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for Contact US form inputs
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handler for form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    // You can add logic here to send the form data to a backend
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Main Content */}
      <div
        className="w-full min-h-screen flex flex-col items-center bg-cover bg-center px-4 py-10 relative"
        style={{
          backgroundImage: "url('/stadium.jpg')",
          backgroundPosition: "center center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="relative w-full max-w-6xl flex mt-8 items-start">
          {/* Left Section - Contact Information */}
          <div className="w-1/3 flex flex-col space-y-6 pl-10">
            <h2 className="text-4xl font-bold bg-black bg-opacity-50 p-4 rounded-lg">
              Contact Information
            </h2>
            <p className="text-lg bg-black bg-opacity-50 p-4 rounded-lg">
              Say something to start a live chat!
            </p>

            {/* Contact Details with Editable Inputs */}
            <div className="bg-black bg-opacity-70 p-4 rounded-xl w-80">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <input
                  type="text"
                  name="phone"
                  value={contactInfo.phone}
                  onChange={handleContactInfoChange}
                  className="w-full p-2 bg-gray-200 text-black rounded-lg"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="bg-black bg-opacity-70 p-4 rounded-xl w-80">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="email"
                  name="email"
                  value={contactInfo.email}
                  onChange={handleContactInfoChange}
                  className="w-full p-2 bg-gray-200 text-black rounded-lg"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="bg-black bg-opacity-70 p-4 rounded-xl w-80">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.243l-4.243-4.243m0 0L9.172 7.757M12 12l-4.243 4.243m0 0l4.243-4.243m4.243 4.243L12 12m-7-7h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                  />
                </svg>
                <input
                  type="text"
                  name="address"
                  value={contactInfo.address}
                  onChange={handleContactInfoChange}
                  className="w-full p-2 bg-gray-200 text-black rounded-lg"
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* Social Media Icons */}
            <div className="flex space-x-4 mt-4">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M24 4.557a9.83 9.83 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.864 9.864 0 01-3.127 1.195 4.916 4.916 0 00-8.384 4.482A13.944 13.944 0 011.671 3.149 4.916 4.916 0 003.194 9.723a4.896 4.896 0 01-2.229-.616v.061a4.916 4.916 0 003.946 4.827 4.902 4.902 0 01-2.224.084 4.916 4.916 0 004.59 3.415A9.867 9.867 0 010 19.54a13.94 13.94 0 007.548 2.212c9.057 0 14.01-7.507 14.01-14.01 0-.213-.005-.426-.014-.637A10.025 10.025 0 0024 4.557z" />
                </svg>
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608C4.93 2.489 6.197 2.224 7.563 2.163 8.829 2.105 9.209 2.093 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.132 4.407.4 3.352 1.455 2.297 2.51 2.029 3.874 1.969 5.155 1.91 6.435 1.897 6.844 1.897 12s.013 5.565.072 6.845c.06 1.281.328 2.645 1.383 3.7 1.055 1.055 2.419 1.323 3.7 1.383 1.28.059 1.689.072 6.948.072s5.668-.013 6.948-.072c1.281-.06 2.645-.328 3.7-1.383 1.055-1.055 1.323-2.419 1.383-3.7.059-1.28.072-1.689.072-6.948s-.013-5.668-.072-6.948c-.06-1.281-.328-2.645-1.383-3.7C21.645 1.4 20.281 1.132 19 1.072 17.72.013 17.311 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                </svg>
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.467-1.332-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12 24 5.373 18.627 0 12 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Center Spacer */}
          <div className="w-1/3"></div>

          {/* Right Section - Contact Form */}
          <div className="w-1/3 flex flex-col items-end pr-10 space-y-6">
            <h2 className="text-5xl font-bold">
              Contact <span className="text-green-400">US</span>
            </h2>
            <p className="text-lg text-right">
              For a better experience for our clients, we provide support to help you
            </p>

            {/* Contact Form */}
            <div className="w-full max-w-md">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-gray-200 text-black rounded-lg"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-gray-200 text-black rounded-lg"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-gray-200 text-black rounded-lg"
                    placeholder="Enter your phone number"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    className="w-full p-3 bg-gray-200 text-black rounded-lg h-32"
                    placeholder="Your message..."
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select Subject?</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="subject"
                        value="General Inquiry"
                        checked={formData.subject === "General Inquiry"}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      General Inquiry
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="subject"
                        value="Support Request"
                        checked={formData.subject === "Support Request"}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      Support Request
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="subject"
                        value="Feedback"
                        checked={formData.subject === "Feedback"}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      Feedback
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="subject"
                        value="Other"
                        checked={formData.subject === "Other"}
                        onChange={handleFormChange}
                        className="mr-2"
                      />
                      Other
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-green-400 text-black font-bold rounded-lg hover:bg-green-500 transition"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;