import React from "react";
import { Link } from "react-router-dom";
import TitleBar from "../components/TitleBar";
import { API_URL } from "../constants";

type apiInfo = {
  songCount: number;
  fakebooks: string[];
};

const Info = () => {
  const [info, setInfo] = React.useState<apiInfo>();

  React.useEffect(() => {
    fetch(`${API_URL}/info`)
      .then((response) => response.json())
      .then((data) => setInfo(data.result));
  }, []);

  return (
    <>
      <TitleBar />
      <div
        style={{
          maxWidth: 500,
          textAlign: "left",
          marginLeft: "auto",
          marginRight: "auto",
          padding: 10,
        }}
      >
        <h2>
          Total Songs: <span style={{ color: "green" }}>{info?.songCount}</span>
        </h2>

        <h2>
          Fakebooks:{" "}
          <span style={{ color: "green" }}>{info?.fakebooks.length}</span>
        </h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {info &&
            info.fakebooks &&
            info.fakebooks.map((fakebook, index) => (
              <li key={index} style={{ marginBottom: "8px" }}>
                <Link
                  to={`/fakebook/${encodeURIComponent(fakebook)}`}
                  style={{
                    color: "#007bff",
                    textDecoration: "none",
                    display: "block",
                    padding: "10px",
                    border: "1px solid #dee2e6",
                    borderRadius: "5px",
                    backgroundColor: "#f8f9fa",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#e9ecef";
                    e.currentTarget.style.color = "#0056b3";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                    e.currentTarget.style.color = "#007bff";
                  }}
                >
                  📖 {fakebook}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};

export default Info;
