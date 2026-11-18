export default function PassCard({ employee }) {
  return (
    <div className="pass-card">
      {/* Top section with ITF logo and event details */}
      <div className="pass-top">
        <div className="pass-logo-row">
          <div className="pass-itf-logo">
            <div className="itf-circle">
              <div className="itf-text">ITF</div>
            </div>
          </div>
          <div className="pass-itpo-logo">ITPO</div>
        </div>
        <div className="pass-event-title">45TH ITF</div>
        <div className="pass-slogan">VIKAS aur VIRASAT</div>
        <div className="pass-sub-slogan">Development & Heritage</div>
        <div className="pass-dates">13-27 November 2026</div>
        <div className="pass-venue">Bharat Mandapam, New Delhi</div>
      </div>

      {/* Partner and Focus States */}
      <div className="pass-states-section">
        <div className="pass-states-group">
          <div className="pass-states-label">PARTNER STATES</div>
          <div className="pass-states-names">BIHAR, MAHARASHTRA, RAJASTHAN & UTTAR PRADESH</div>
        </div>
        <div className="pass-states-group">
          <div className="pass-states-label">FOCUS STATES</div>
          <div className="pass-states-names">ASSAM, DELHI, JHARKHAND & WEST BENGAL</div>
        </div>
      </div>

      {/* Photo and details section */}
      <div className="pass-middle">
        <div className="pass-photo">
          {employee.photoPath ? (
            <img src={employee.photoPath} alt="" />
          ) : (
            <div className="pass-photo-placeholder">{employee.fullName?.[0] ?? '?'}</div>
          )}
        </div>
        <div className="pass-person-details">
          <div className="pass-name">{employee.fullName}</div>
          <div className="pass-designation">{employee.designation}</div>
          {employee.company && <div className="pass-company">{employee.company}</div>}
          {employee.email && <div className="pass-email">{employee.email}</div>}
          <div className="pass-mobile">{employee.mobile}</div>
        </div>
        <div className="pass-qr-section">
          <img src={employee.qrDataUrl} alt="QR" />
          <div className="pass-qr-text">{employee.qrToken}</div>
        </div>
      </div>

      {/* Bottom validity section */}
      <div className="pass-bottom">
        <div className="pass-validity">Validity: 13-11-2026 to 28-11-2026</div>
        <div className="pass-status">ON DUTY</div>
      </div>
    </div>
  );
}
