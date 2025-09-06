import React from "react";
import { Link, useParams } from "react-router-dom";
import TitleBar from "../components/TitleBar";
import { API_URL } from "../constants";

type Song = {
  title: string;
  page: number;
  source: string;
};

type FakebookData = {
  fakebook: string;
  songs: Song[];
  count: number;
};

const FakebookIndex = () => {
  const { name } = useParams<{ name: string }>();
  const [data, setData] = React.useState<FakebookData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (name) {
      setLoading(true);
      setError(null);

      fetch(`${API_URL}/info/fakebook/${encodeURIComponent(name)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch fakebook: ${response.statusText}`);
          }
          return response.json();
        })
        .then((result) => {
          setData(result.result);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [name]);

  if (loading) {
    return (
      <>
        <TitleBar />
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h2>Loading...</h2>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TitleBar />
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h2>Error: {error}</h2>
          <Link to="/info">← Back to Info</Link>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <TitleBar />
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h2>Fakebook not found</h2>
          <Link to="/info">← Back to Info</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <TitleBar />
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px",
          textAlign: "left",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <Link to="/info" style={{ color: "#007bff", textDecoration: "none" }}>
            ← Back to All Fakebooks
          </Link>
        </div>

        <h1 style={{ color: "#333", marginBottom: "10px" }}>{data.fakebook}</h1>

        <p style={{ color: "#666", marginBottom: "30px" }}>
          {data.count} songs available
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "10px",
            fontSize: "14px",
          }}
        >
          {data.songs
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((song, index) => (
              <React.Fragment key={index}>
                <div>
                  <Link
                    to={`/source/${encodeURIComponent(song.source)}/${
                      song.page
                    }`}
                    style={{
                      color: "#007bff",
                      textDecoration: "none",
                      display: "block",
                      padding: "8px 0",
                      borderBottom: "1px solid #eee",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#0056b3";
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#007bff";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    {song.title}
                  </Link>
                </div>
                <div
                  style={{
                    color: "#666",
                    padding: "8px 0",
                    borderBottom: "1px solid #eee",
                    textAlign: "right",
                  }}
                >
                  {song.page}
                </div>
              </React.Fragment>
            ))}
        </div>

        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <Link to="/info" style={{ color: "#007bff", textDecoration: "none" }}>
            ← Back to All Fakebooks
          </Link>
        </div>
      </div>
    </>
  );
};

export default FakebookIndex;
