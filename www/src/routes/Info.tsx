import React from "react";
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
        <ul>
          {info &&
            info.fakebooks &&
            info.fakebooks.map((each, index) => <li key={index}>{each}</li>)}
        </ul>
      </div>
    </>
  );
};

export default Info;
