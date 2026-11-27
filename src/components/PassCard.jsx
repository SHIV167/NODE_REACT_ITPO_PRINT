export default function PassCard({ employee }) {
  return (
    <div className="pass-card">
      {/* Top gold band */}
      <div className="pass-top-band">
        <div className="pass-top-left">
          <div className="pass-45th">45TH</div>
          <div className="pass-iitf-logo">
            <div className="iitf-globe">
              <div className="iitf-text">iitf</div>
            </div>
          </div>
        </div>
        <div className="pass-top-right">
          <div className="pass-organiser">Organiser</div>
          <div className="pass-itpo">ITPO</div>
        </div>
      </div>

      {/* Main content */}
      <div className="pass-content">
        <div className="pass-title-row">
          <div className="pass-vikas">VIKAS aur VIRASAT</div>
          <div className="pass-development">Development & Heritage</div>
        </div>
        <div className="pass-dates-row">
          <div className="pass-dates">13-27 November 2026</div>
          <div className="pass-venue">Bharat Mandapam, New Delhi</div>
        </div>
        <div className="pass-states">
          <div className="pass-state-label">PARTNER STATES : BIHAR, MAHARASHTRA, RAJASTHAN & UTTAR PRADESH</div>
          <div className="pass-state-label">FOCUS STATES : ASSAM, DELHI, JHARKHAND & WEST BENGAL</div>
        </div>
        <div className="pass-divider"></div>
        <div className="pass-person-section">
          <div className="pass-photo">
            {employee.photoPath ? (
              <img src={employee.photoPath} alt="" />
            ) : (
              <div className="pass-photo-placeholder">{employee.fullName?.[0] ?? '?'}</div>
            )}
          </div>
          <div className="pass-person-info">
            <div className="pass-name">{employee.fullName}</div>
            <div className="pass-company">{employee.company || employee.designation}</div>
          </div>
          <div className="pass-qr-section">
            <img src={employee.qrDataUrl} alt="QR" />
            <div className="pass-qr-code">{employee.qrToken}</div>
          </div>
        </div>
      </div>

      {/* Bottom gold band */}
      <div className="pass-bottom-band">
        <div className="pass-validity">Validity : 13-11-2026 to 28-11-2026</div>
        <div className="pass-status">ON DUTY</div>
      </div>
    </div>
  );
}
