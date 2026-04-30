import { useState } from "react";

const MEMBERSHIP_FEES = {
  "Returned & Service": 40,
  "Associate (Non-Military)": 40,
  "Youth (Under 18)": 10,
  "Over 80s": 10,
  "Over 90s": 0,
  "Life Member": 0,
};

const steps = [
  "Personal Details",
  "Membership Type",
  "Consents & Skills",
  "Service Details",
  "Nomination & Payment",
];

const inputClass =
  "w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors";
const labelClass = "block text-sm font-bold text-rsa-navy mb-2";
const sectionTitle = "text-xl font-bold font-heading text-rsa-navy mb-4";

export default function HakaruRSAMembership() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    // Personal
    fullName: "",
    fullName2: "",
    dob: "",
    dob2: "",
    mailingAddress: "",
    mailingTown: "",
    mailingPostCode: "",
    physicalAddress: "",
    physicalTown: "",
    physicalPostCode: "",
    homePhone: "",
    mobile: "",
    email: "",
    // Membership
    membershipType: "",
    transferFrom: "",
    // Consents
    consentEmail: "",
    consentAGM: "",
    consentWomens: "",
    skills: "",
    willingTasks: "",
    willingWorkingBee: "",
    willingDonate: "",
    // Service (Returned & Service only)
    serviceName: "",
    serviceDob: "",
    servicesBranch: [],
    serviceType: [],
    tradeCorp: "",
    serviceNumber: "",
    rank: "",
    confirmationMilitary: "",
    yearEnlisted: "",
    yearDischarged: "",
    wherServed: "",
    // Nomination
    nominatedBy: "",
    secondedBy: "",
    donation: "",
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggle = (field, value) =>
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }));

  const isReturned = form.membershipType === "Returned & Service";
  const fee = MEMBERSHIP_FEES[form.membershipType] || 0;
  const total = fee + (parseFloat(form.donation) || 0);

  const progress = ((step + 1) / steps.length) * 100;

  const YesNo = ({ field, label }) => (
    <div className="flex items-start gap-4 py-3 border-b border-gray-200">
      <span className="text-sm text-gray-700 flex-1 leading-snug">{label}</span>
      <div className="flex gap-2 shrink-0">
        {["Yes", "No"].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => set(field, opt)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-2 rounded-md transition-all ${
              form[field] === opt
                ? "bg-rsa-navy text-white border-rsa-navy"
                : "bg-white text-rsa-navy border-rsa-navy/30 hover:bg-rsa-navy/5"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const CheckBox = ({ field, value, label }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={() => toggle(field, value)}
        className={`w-5 h-5 border-2 border-rsa-navy/30 rounded flex items-center justify-center transition-all ${
          form[field].includes(value) ? "bg-rsa-navy border-rsa-navy" : "bg-white group-hover:bg-rsa-navy/5"
        }`}
      >
        {form[field].includes(value) && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  if (submitted) {
    return (
      <div className="bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold font-heading text-rsa-navy mb-3">Application Submitted</h2>
            <p className="text-gray-600 mb-2">
              Thank you, <strong>{form.fullName}</strong>.
            </p>
            <p className="text-gray-600 mb-6">
              Your Hakaru &amp; Districts RSA membership application has been received. A confirmation email will be sent to{" "}
              <strong>{form.email}</strong>.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left text-sm text-green-900 mb-6">
              <div className="flex justify-between py-1 border-b border-green-200">
                <span>Membership type</span>
                <span className="font-semibold">{form.membershipType || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-green-200">
                <span>Membership fee</span>
                <span className="font-semibold">${fee.toFixed(2)}</span>
              </div>
              {parseFloat(form.donation) > 0 && (
                <div className="flex justify-between py-1 border-b border-green-200">
                  <span>Donation</span>
                  <span className="font-semibold">${parseFloat(form.donation).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-1 font-bold">
                <span>Total due</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Applications must be nominated &amp; seconded. Your application will be reviewed at the next committee meeting.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4">Membership Application</h1>
          <p className="text-lg text-gray-300">
            Step {step + 1} of {steps.length}: <span className="font-bold text-rsa-gold">{steps[step]}</span>
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-600 mb-2 uppercase tracking-wider">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 bg-rsa-gold rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

        {/* STEP 0 — Personal Details */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <p className={sectionTitle}>Personal Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className={labelClass}>Full Name (Applicant 1)</label>
                  <input
                    className={inputClass}
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    placeholder="Full legal name"
                  />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth</label>
                  <input type="date" className={inputClass} value={form.dob} onChange={(e) => set("dob", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Full Name (Applicant 2 — if joint)</label>
                  <input
                    className={inputClass}
                    value={form.fullName2}
                    onChange={(e) => set("fullName2", e.target.value)}
                    placeholder="Leave blank if single applicant"
                  />
                </div>
                <div>
                  <label className={labelClass}>Date of Birth (Applicant 2)</label>
                  <input type="date" className={inputClass} value={form.dob2} onChange={(e) => set("dob2", e.target.value)} />
                </div>
              </div>
            </div>

            <div>
              <p className={sectionTitle}>Mailing Address</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Street Address</label>
                  <input
                    className={inputClass}
                    value={form.mailingAddress}
                    onChange={(e) => set("mailingAddress", e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Town</label>
                    <input
                      className={inputClass}
                      value={form.mailingTown}
                      onChange={(e) => set("mailingTown", e.target.value)}
                      placeholder="Town"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Post Code</label>
                    <input
                      className={inputClass}
                      value={form.mailingPostCode}
                      onChange={(e) => set("mailingPostCode", e.target.value)}
                      placeholder="0000"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className={sectionTitle}>
                Physical Address{" "}
                <span className="text-xs font-normal normal-case tracking-normal text-gray-500">(if different from mailing)</span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Street Address</label>
                  <input
                    className={inputClass}
                    value={form.physicalAddress}
                    onChange={(e) => set("physicalAddress", e.target.value)}
                    placeholder="Leave blank if same as mailing"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Town</label>
                    <input className={inputClass} value={form.physicalTown} onChange={(e) => set("physicalTown", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Post Code</label>
                    <input className={inputClass} value={form.physicalPostCode} onChange={(e) => set("physicalPostCode", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className={sectionTitle}>Contact</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Home Phone</label>
                  <input className={inputClass} value={form.homePhone} onChange={(e) => set("homePhone", e.target.value)} placeholder="09 xxx xxxx" />
                </div>
                <div>
                  <label className={labelClass}>Mobile</label>
                  <input className={inputClass} value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="021 xxx xxxx" />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    className={inputClass}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1 — Membership Type */}
        {step === 1 && (
          <div className="space-y-6">
            <p className={sectionTitle}>Membership Type & Fees</p>
            <div className="space-y-3">
              {Object.entries(MEMBERSHIP_FEES).map(([type, fee]) => (
                <label
                  key={type}
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    form.membershipType === type
                      ? "border-rsa-gold bg-rsa-gold/10"
                      : "border-gray-200 bg-white hover:border-rsa-navy/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        form.membershipType === type ? "border-rsa-gold bg-rsa-gold" : "border-rsa-navy/30 bg-white"
                      }`}
                    >
                      {form.membershipType === type && <div className="w-2 h-2 bg-rsa-navy rounded-full" />}
                    </div>
                    <div>
                      <span className="font-bold text-rsa-navy">{type}</span>
                      {type === "Returned & Service" && <p className="text-xs text-gray-500">Service details required</p>}
                    </div>
                  </div>
                  <span className="font-bold text-rsa-navy text-lg">{fee === 0 ? "Free" : `$${fee}.00`}</span>
                  <input
                    type="radio"
                    className="hidden"
                    checked={form.membershipType === type}
                    onChange={() => set("membershipType", type)}
                  />
                </label>
              ))}
            </div>
            <div>
              <label className={labelClass}>Transferring from another RSA/Club?</label>
              <input
                className={inputClass}
                value={form.transferFrom}
                onChange={(e) => set("transferFrom", e.target.value)}
                placeholder="Name of RSA/Club (leave blank if not applicable)"
              />
            </div>
            <div className="bg-rsa-gold/10 border-2 border-rsa-gold/30 rounded-lg p-4 text-sm text-rsa-navy">
              <strong>Note:</strong> Fees must be paid with application. Fees will be refunded if application is unsuccessful.
              Donations are always appreciated.
            </div>
          </div>
        )}

        {/* STEP 2 — Consents & Skills */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className={sectionTitle}>Consents</p>
              <div className="space-y-1">
                <YesNo field="consentEmail" label="I consent to be contacted via email for RSA related events." />
                <YesNo field="consentAGM" label="I consent to be contacted via email for Hakaru & Districts RSA AGMs & EGMs." />
                <YesNo
                  field="consentWomens"
                  label="I am female & consent to my contact details being passed to the Hakaru & Districts RSA Women's Section."
                />
              </div>
            </div>

            <div>
              <p className={sectionTitle}>Skills</p>
              <div>
                <label className={labelClass}>Please list any skills you'd like to share</label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors min-h-[100px] resize-none"
                  value={form.skills}
                  onChange={(e) => set("skills", e.target.value)}
                  placeholder="e.g. carpentry, cooking, administration..."
                />
              </div>
              <div className="space-y-1 mt-4">
                <YesNo field="willingTasks" label="I am willing to be contacted for tasks relating to my above skills at the Hakaru & Districts RSA." />
                <YesNo field="willingWorkingBee" label="I am willing to be contacted for working bees at the Hakaru & Districts RSA." />
                <YesNo field="willingDonate" label="I am willing to donate my time to the operation of the Hakaru & Districts RSA." />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 — Service Details (Returned & Service only) */}
        {step === 3 && (
          <div className="space-y-6">
            {isReturned ? (
              <>
                <div className="bg-rsa-navy/5 border-l-4 border-rsa-gold p-4 text-sm text-gray-700 rounded">
                  <strong>Returned &amp; Service Members Only</strong> — Please complete your military service details below.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Full Name/s</label>
                    <input className={inputClass} value={form.serviceName} onChange={(e) => set("serviceName", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Date of Birth</label>
                    <input type="date" className={inputClass} value={form.serviceDob} onChange={(e) => set("serviceDob", e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Services you served with / are serving with</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                    {["Airforce", "Navy", "Army", "Police"].map((b) => (
                      <CheckBox key={b} field="servicesBranch" value={b} label={b} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Type of Service</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {["Regular Force", "CMT (1950–1959)", "National Service (1962–1971)", "Territorial Forces"].map((t) => (
                      <CheckBox key={t} field="serviceType" value={t} label={t} />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Trade / Corp</label>
                    <input className={inputClass} value={form.tradeCorp} onChange={(e) => set("tradeCorp", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Service Number</label>
                    <input className={inputClass} value={form.serviceNumber} onChange={(e) => set("serviceNumber", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Rank at time of discharge</label>
                    <input className={inputClass} value={form.rank} onChange={(e) => set("rank", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Confirmation of Military Service</label>
                    <input className={inputClass} value={form.confirmationMilitary} onChange={(e) => set("confirmationMilitary", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Year Enlisted</label>
                    <input className={inputClass} value={form.yearEnlisted} onChange={(e) => set("yearEnlisted", e.target.value)} placeholder="e.g. 1972" />
                  </div>
                  <div>
                    <label className={labelClass}>Year Discharged</label>
                    <input className={inputClass} value={form.yearDischarged} onChange={(e) => set("yearDischarged", e.target.value)} placeholder="e.g. 1985" />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Where did you serve / are serving</label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors min-h-[100px] resize-none"
                    value={form.wherServed}
                    onChange={(e) => set("wherServed", e.target.value)}
                    placeholder="Locations and theatres of service..."
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-600 italic">
                  I hereby give permission for any information given above to be used by the Welfare Office, acting in his/her capacity as Welfare Officer, on my behalf in dealings with Veterans Affairs.
                  <br />
                  <br />
                  <strong>Note:</strong> If any part of this form is of a sensitive nature for any member still serving in defence of our country, please leave that part of the form blank.
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-rsa-navy/10 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-rsa-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-rsa-navy font-bold">Service details not required</p>
                <p className="text-sm text-gray-600 mt-1">This section is for Returned &amp; Service members only.</p>
                <p className="text-sm text-gray-600 mt-1">Click <strong>Next</strong> to continue.</p>
              </div>
            )}
          </div>
        )}

        {/* STEP 4 — Nomination & Payment */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <p className={sectionTitle}>Nomination</p>
              <div className="bg-rsa-gold/10 border-2 border-rsa-gold/30 rounded-lg p-3 text-xs text-rsa-navy mb-4">
                Applications must be nominated and seconded by current RSA members.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={labelClass}>Nominated By</label>
                  <input className={inputClass} value={form.nominatedBy} onChange={(e) => set("nominatedBy", e.target.value)} placeholder="Nominator's full name" />
                </div>
                <div>
                  <label className={labelClass}>Seconded By</label>
                  <input className={inputClass} value={form.secondedBy} onChange={(e) => set("secondedBy", e.target.value)} placeholder="Seconder's full name" />
                </div>
              </div>
            </div>

            <div>
              <p className={sectionTitle}>Payment Summary</p>
              <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Membership type</span>
                  <span className="font-bold text-rsa-navy">{form.membershipType || "—"}</span>
                </div>
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Membership fee</span>
                  <span className="font-bold text-rsa-navy">${fee.toFixed(2)}</span>
                </div>
                <div className="p-4 border-b border-gray-100">
                  <label className={labelClass}>Additional Donation (optional)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-rsa-navy font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      className={inputClass}
                      value={form.donation}
                      onChange={(e) => set("donation", e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Donations are always appreciated.</p>
                </div>
                <div className="flex justify-between items-center p-4 bg-rsa-gold/10">
                  <span className="font-bold text-rsa-navy uppercase tracking-wider text-sm">Total</span>
                  <span className="font-black text-rsa-navy text-2xl">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className={sectionTitle}>Card Payment</p>
              <div className="border-2 border-dashed border-rsa-navy/30 bg-rsa-navy/5 p-6 text-center rounded-lg">
                <div className="text-rsa-navy mb-2">
                  <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-rsa-navy">Stripe Payment Element</p>
                <p className="text-xs text-gray-500 mt-1">
                  Connect your Stripe publishable key to enable card payments here.
                  <br />
                  Install:{" "}
                  <code className="bg-white px-1 rounded border border-gray-200">npm install @stripe/react-stripe-js @stripe/stripe-js</code>
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-600">
              By submitting this application I confirm that all information provided is correct. I understand that my application must be approved by the committee and that fees will be refunded if my application is unsuccessful.
            </div>
          </div>
        )}

        <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={`px-6 py-3 border-2 rounded-lg font-bold text-sm transition-all ${
              step === 0
                ? "opacity-40 cursor-not-allowed border-gray-200 text-gray-400"
                : "border-rsa-navy text-rsa-navy hover:bg-rsa-navy hover:text-white"
            }`}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (step < steps.length - 1) setStep((s) => s + 1);
              else setSubmitted(true);
            }}
            className={`px-8 py-3 rounded-lg font-bold text-sm transition-colors ${
              step < steps.length - 1 ? "bg-rsa-gold text-rsa-navy hover:bg-yellow-400" : "bg-rsa-navy text-white hover:bg-opacity-90"
            }`}
          >
            {step < steps.length - 1 ? "Next →" : "Submit Application"}
          </button>
        </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6">
          Hakaru &amp; Districts RSA · Membership Application
        </div>
      </div>
    </div>
  );
}

