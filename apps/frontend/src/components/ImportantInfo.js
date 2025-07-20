import React from "react";
import "./ImportantInfo.css";

// Reusable Table component
function InfoTable({ data }) {
  return (
    <table style={{ margin: "20px auto", borderCollapse: "collapse" }}>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td
                key={j}
                style={{ border: "1px solid #ccc", padding: "8px" }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ImportantInfo() {
  const tableData = [
    ["MOT due", "26 November 2025"],
    ["Tax due", "1 September 2025"],
    ["Insurance Renewal Date", "10 August 2025"],
    ["Parking Renewal Date", "09 August 2025"],
  ];

  return (
    <div className="info-container">
      {/* <h2 className="info-title">Important Information</h2> */}
      <InfoTable data={tableData} />
    </div>
  );
}

export default ImportantInfo;