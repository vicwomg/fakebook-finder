import React from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import AddToPlaylistButton from "../components/AddToPlaylistButton";
import TitleBar from "../components/TitleBar";
import { API_URL } from "../constants";
import "../styles/Global.css";

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
  const history = useHistory();

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

  const handleSongClick = (source: string, page: number, title: string) => {
    history.push(`/source/${encodeURIComponent(source)}/${page}`, {
      title,
    });
  };

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
      <div className="container">
        <h2 style={{ color: "#333", marginBottom: "10px", marginTop: 0 }}>
          {data.fakebook}
        </h2>

        <p style={{ color: "#666", marginBottom: "30px" }}>
          {data.count} songs available
        </p>

        <div>
          {data.songs
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((song, index) => (
              <React.Fragment key={index}>
                <div
                  onClick={() =>
                    handleSongClick(song.source, song.page, song.title)
                  }
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    textAlign: "left",
                    alignItems: "center",
                  }}
                  className="clickable-row" /* kept class */
                >
                  <div style={{ flex: 1 }}>{song.title}</div>
                  <div
                    style={{
                      color: "#666",
                      marginRight: "24px",
                      fontSize: "12px",
                    }}
                  >
                    p.{song.page}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <AddToPlaylistButton
                      song={{ ...song, page: String(song.page) }}
                    />
                  </div>
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
