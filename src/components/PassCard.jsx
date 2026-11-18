export default function PassCard({ employee }) {
  return (
    <div className="pass-card">
      <div className="pass-header">
        <div className="pass-logo">IITF</div>
        <div className="pass-title">VIKAS aur VIRASAT</div>
        <div className="pass-subtitle">Development & Heritage</div>
        <div className="pass-dates">13-27 November 2026</div>
        <div className="pass-venue">Bharat Mandapam, New Delhi</div>
      </div>
      <div className="pass-states">
        <div className="pass-states-label">PARTNER STATES</div>
        <div className="pass-states-list">BIHAR, MAHARASHTRA, RAJASTHAN & UTTAR PRADESH</div>
        <div className="pass-states-label mt-1">FOCUS STATES</div>
        <div className="pass-states-list">ASSAM, DELHI, JHARKHAND & WEST BENGAL</div>
      </div>
      <div className="pass-body">
        <div className="pass-photo">
          {employee.photoPath ? (
            <img src={employee.photoPath} alt="" />
          ) : (
            <div className="pass-photo-placeholder">{employee.fullName?.[0] ?? '?'}</div>
          )}
        </div>
        <div className="pass-details">
          <div className="pass-name">{employee.fullName}</div>
          <div className="pass-row"><span>ID:</span> {employee.employeeCode}</div>
          <div className="pass-row"><span>Designation:</span> {employee.designation}</div>
          {employee.company && <div className="pass-row"><span>Company:</span> {employee.company}</div>}
          {employee.email && <div className="pass-row"><span>Email:</span> {employee.email}</div>}
          <div className="pass-row"><span>Mobile:</span> {employee.mobile}</div>
        </div>
        <div className="pass-qr">
          <img src={employee.qrDataUrl} alt="QR" />
          <div className="pass-token">{employee.qrToken}</div>
        </div>
      </div>
      <div className="pass-footer">
        <div className="pass-validity">Validity: 13-11-2026 to 28-11-2026</div>
        <div className="pass-status">ON DUTY</div>
      </div>
    </div>
  );
}
