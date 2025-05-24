import React from "react";

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
  ];

  return (
    <div style={{ marginTop: 40 }}>
      <h3>Information</h3>
      <InfoTable data={tableData} />
    </div>
  );
}

export default ImportantInfo;