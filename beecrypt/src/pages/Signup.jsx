import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Hexagon, CircleCheck, Circle } from "lucide-react";
import UploadBox from "../components/UploadBox.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { validateSignup } from "../utils/validators.js";
import { generateActorId, generateOrgId } from "../utils/ids.js";

const inputCls = "w-full box-border px-3.5 py-2.5 rounded-lg border-[1.5px] border-[#E5E0CE] mt-1.5 mb-4 text-[14.5px] outline-none focus:border-bc-forest";
const labelCls = "text-[12.5px] font-bold";

const ROLE_OPTIONS = [
  { key: "beekeeper", label: "🐝 Beekeeper" },
  { key: "processor", label: "🍯 Processor" },
  { key: "laboratory", label: "🧪 Laboratory" },
];

export default function Signup() {
  const { submitRegistration } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    fullName: "", username: "", phone: "", email: "", password: "", confirmPassword: "",
    region: "", organization: "", roles: [],
    honeyType: "", floralSource: "", facilityName: "", labName: "", accreditation: "",
  });
  const [govDocs, setGovDocs] = useState([]);
  const [licenseDocs, setLicenseDocs] = useState([]);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setValues((p) => ({ ...p, [k]: v }));
  const toggleRole = (r) =>
    setValues((p) => ({ ...p, roles: p.roles.includes(r) ? p.roles.filter((x) => x !== r) : [...p.roles, r] }));

  // The UI generates/mocks Actor + Organization IDs automatically — the
  // person never types these in (Section 8).
  const previewIds = useMemo(() => {
    const orgId = generateOrgId();
    const actorIds = {};
    values.roles.forEach((r) => { actorIds[r] = generateActorId(r); });
    return { orgId, actorIds };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.roles.join(",")]);

  const submit = async (e) => {
    e.preventDefault();
    const { valid, errors: errs } = validateSignup(values);
    setErrors(errs);
    if (!valid) return;
    await submitRegistration({ ...values, govDocs, licenseDocs, ...previewIds });
    navigate("/registration-pending");
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="flex items-center gap-2 font-display text-xl text-bc-deep-green mb-6">
          <Hexagon size={22} fill="#F59E0B" className="text-bc-deep-green" /> BeeCrypt
        </Link>
        <div className="bg-white rounded-2xl border border-[#ECE6D6] shadow-sm p-8">
          <div className="font-display text-2xl mb-5">Create your account</div>
          <form onSubmit={submit}>
            <div className="grid md:grid-cols-2 gap-x-4">
              <div><label className={labelCls}>Full Name</label><input className={inputCls} value={values.fullName} onChange={(e) => set("fullName", e.target.value)} /></div>
              <div><label className={labelCls}>Username</label><input className={inputCls} value={values.username} onChange={(e) => set("username", e.target.value)} /></div>
            </div>
            <div className="grid md:grid-cols-2 gap-x-4">
              <div><label className={labelCls}>Phone Number</label><input className={inputCls} value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
              <div><label className={labelCls}>Email</label><input className={inputCls} value={values.email} onChange={(e) => set("email", e.target.value)} /></div>
            </div>
            {errors.fullName && <div className="text-bc-critical text-xs -mt-3 mb-2">{errors.fullName}</div>}
            {errors.email && <div className="text-bc-critical text-xs -mt-3 mb-2">{errors.email}</div>}

            <div className="grid md:grid-cols-2 gap-x-4">
              <div><label className={labelCls}>Password</label><input type="password" className={inputCls} value={values.password} onChange={(e) => set("password", e.target.value)} /></div>
              <div><label className={labelCls}>Confirm Password</label><input type="password" className={inputCls} value={values.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} /></div>
            </div>
            {errors.password && <div className="text-bc-critical text-xs -mt-3 mb-2">{errors.password}</div>}
            {errors.confirmPassword && <div className="text-bc-critical text-xs -mt-3 mb-2">{errors.confirmPassword}</div>}

            <div className="grid md:grid-cols-2 gap-x-4">
              <div><label className={labelCls}>Organization Name</label><input className={inputCls} value={values.organization} onChange={(e) => set("organization", e.target.value)} /></div>
              <div><label className={labelCls}>Region / Location</label><input className={inputCls} value={values.region} onChange={(e) => set("region", e.target.value)} placeholder="e.g. Coimbatore" /></div>
            </div>

            <div className="font-bold text-[14.5px] mt-1 mb-2.5">Select Your Activities</div>
            <div className="flex gap-2.5 flex-wrap mb-1">
              {ROLE_OPTIONS.map((r) => {
                const active = values.roles.includes(r.key);
                return (
                  <button
                    type="button"
                    key={r.key}
                    onClick={() => toggleRole(r.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-[1.5px] text-sm font-semibold ${
                      active ? "border-bc-forest bg-bc-light-honey" : "border-[#E5E0CE] bg-white"
                    }`}
                  >
                    {active ? <CircleCheck size={16} className="text-bc-forest" /> : <Circle size={16} className="text-[#C9C2AC]" />}
                    {r.label}
                  </button>
                );
              })}
            </div>
            {errors.roles && <div className="text-bc-critical text-xs mt-1 mb-2">{errors.roles}</div>}

            {values.roles.length > 0 && (
              <div className="bg-[#F8F6EC] rounded-xl p-3.5 my-3 text-xs">
                <div className="font-bold text-[#8A9086] mb-1.5">AUTO-GENERATED IDS (preview — assigned on approval)</div>
                <div>Organization ID: <span className="font-bold text-bc-deep-green">{previewIds.orgId}</span></div>
                {values.roles.map((r) => (
                  <div key={r}>{r[0].toUpperCase() + r.slice(1)} Actor ID: <span className="font-bold text-bc-deep-green">{previewIds.actorIds[r]}</span></div>
                ))}
              </div>
            )}

            {values.roles.includes("beekeeper") && (
              <div className="border border-[#ECE6D6] rounded-xl p-4 mb-4">
                <div className="font-bold text-sm mb-2.5">Beekeeper details</div>
                <div className="grid md:grid-cols-2 gap-x-4">
                  <div><label className={labelCls}>Honey Type</label><input className={inputCls} value={values.honeyType} onChange={(e) => set("honeyType", e.target.value)} placeholder="e.g. Multifloral" /></div>
                  <div><label className={labelCls}>Floral Source</label><input className={inputCls} value={values.floralSource} onChange={(e) => set("floralSource", e.target.value)} placeholder="e.g. Eucalyptus" /></div>
                </div>
              </div>
            )}
            {values.roles.includes("processor") && (
              <div className="border border-[#ECE6D6] rounded-xl p-4 mb-4">
                <div className="font-bold text-sm mb-2.5">Processor details</div>
                <label className={labelCls}>Facility Name</label>
                <input className={inputCls} value={values.facilityName} onChange={(e) => set("facilityName", e.target.value)} />
              </div>
            )}
            {values.roles.includes("laboratory") && (
              <div className="border border-[#ECE6D6] rounded-xl p-4 mb-4">
                <div className="font-bold text-sm mb-2.5">Laboratory details</div>
                <div className="grid md:grid-cols-2 gap-x-4">
                  <div><label className={labelCls}>Laboratory Name</label><input className={inputCls} value={values.labName} onChange={(e) => set("labName", e.target.value)} /></div>
                  <div><label className={labelCls}>Accreditation</label><input className={inputCls} value={values.accreditation} onChange={(e) => set("accreditation", e.target.value)} placeholder="e.g. NABL" /></div>
                </div>
              </div>
            )}

            <div className="font-bold text-[14.5px] mt-1 mb-2.5">Government Verification Document</div>
            <UploadBox onFiles={(names) => setGovDocs((p) => [...p, ...names])} files={govDocs} onRemove={(i) => setGovDocs((p) => p.filter((_, idx) => idx !== i))} />

            <div className="font-bold text-[14.5px] mt-5 mb-2.5">Qualification / License Document</div>
            <UploadBox onFiles={(names) => setLicenseDocs((p) => [...p, ...names])} files={licenseDocs} onRemove={(i) => setLicenseDocs((p) => p.filter((_, idx) => idx !== i))} />

            <button type="submit" className="w-full mt-6 rounded-xl py-3 font-bold text-white bg-gradient-to-br from-bc-gold to-bc-amber shadow-lg">
              Submit Registration
            </button>
            <div className="text-sm text-[#8A9086] mt-4 text-center">
              Already have an account? <Link to="/login" className="text-bc-deep-green font-bold">Log In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
