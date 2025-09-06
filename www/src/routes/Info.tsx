import React from "react";
import { Link } from "react-router-dom";
import TitleBar from "../components/TitleBar";
import { API_URL } from "../constants";
import "../styles/Global.css";

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
      <div className="container">
        <h3>
          Fakebooks:{" "}
          <span style={{ color: "green" }}>{info?.fakebooks.length}</span>
          &nbsp;&nbsp;Songs:{" "}
          <span style={{ color: "green" }}>{info?.songCount}</span>
        </h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {info &&
            info.fakebooks &&
            info.fakebooks.map((fakebook, index) => (
              <li key={index} style={{ marginBottom: "8px" }}>
                <Link
                  to={`/fakebook/${encodeURIComponent(fakebook)}`}
                  className="grey-button"
                >
                  {fakebook}
                </Link>
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};

export default Info;
