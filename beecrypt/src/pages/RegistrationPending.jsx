import React from "react";
import { Link } from "react-router-dom";
import { Hexagon } from "lucide-react";

export default function RegistrationPending() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-10 max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-bc-light-honey flex items-center justify-center mx-auto mb-4">
          <Hexagon size={26} className="text-bc-amber" />
        </div>
        <div className="font-display text-2xl text-bc-deep-green">Registration submitted 🐝</div>
        <p className="text-[14.5px] text-[#6B7267] mt-2.5">
          Your application has been submitted for KVIC verification. You'll receive login access once your
          registration — including your auto-generated Actor/Organization ID — is approved.
        </p>
        <div className="inline-flex items-center gap-1.5 bg-bc-light-honey text-bc-amber font-bold text-xs px-3 py-1.5 rounded-full mt-4">
          Pending Verification
        </div>
        <Link to="/login" className="block mt-6 rounded-xl py-3 font-bold text-white bg-gradient-to-br from-bc-forest to-bc-deep-green shadow-lg">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
