import {
  faChevronLeft,
  faChevronRight,
  faDownload,
  faEllipsisH,
  faEye,
  faLock,
  faLockOpen,
  faPrint,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoSleep from "nosleep.js";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { Document, Page, pdfjs } from "react-pdf";
import {
  RouteComponentProps,
  useHistory,
  useLocation,
  useParams,
} from "react-router-dom";
import AddToPlaylistButton from "../components/AddToPlaylistButton";
import LoadingSpinner from "../components/LoadingSpinner";
import TitleBar from "../components/TitleBar";
import { API_URL } from "../constants";
import { getPlaylists } from "../utils/playlist";
import { addToRecentlyViewed } from "../utils/recentlyViewed";
import "./PdfContainer.css";
import SearchResults from "./SearchResults";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

type LocationState = {
  searchQuery?: string;
  searchResults?: SearchResult[];
  title?: string;
  playlistId?: string;
  songIndex?: number;
};

type SearchResult = {
  title: string;
  page: string;
  source: string;
};

const PdfContainer = ({ location: routeLocation }: RouteComponentProps) => {
  const defaultDesktopPdfWidth = window.innerWidth / 2 - 20;
  const noSleep = new NoSleep(); // Note: NoSleep instance usage is a bit simplified here, usually needs to be ref/state if it needs persistence across renders? existing code did this.

  const { source = "", page = "" } = useParams<{
    source: string;
    page: string;
  }>();
  const history = useHistory();
  const location = useLocation<LocationState>();

  // State
  const [numPages, setNumPages] = useState<number>(0);
  const [addPage, setAddPage] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [pdfWidth, setPdfWidth] = useState<number>(
    isMobile ? window.innerWidth : defaultDesktopPdfWidth,
  );
  const [pdf, setPdf] = useState<Blob>();
  const [noSleepEnabled, setNoSleepEnabled] = useState<boolean>(false);

  // Derived state from location
  const state = location.state || {};
  const searchQuery = state.searchQuery || null;
  const searchResults = state.searchResults || null;
  const title = state.title || "";
  const playlistId = state.playlistId;
  const songIndex = state.songIndex;

  // Zoom Logic
  const isZoomed = (): boolean => {
    return pdfWidth >= window.innerWidth;
  };

  const handleZoom = () => {
    if (!isMobile) {
      !isZoomed() && setPdfWidth(window.innerWidth);
      isZoomed() && setPdfWidth(defaultDesktopPdfWidth);
    }
  };

  // NoSleep Logic
  const toggleNoSleep = () => {
    if (!noSleepEnabled) {
      noSleep.enable();
      setNoSleepEnabled(true);
    } else {
      noSleep.disable();
      setNoSleepEnabled(false);
    }
  };

  // Download Logic
  const handleDownload = () => {
    if (pdf && title) {
      const safeTitle =
        title.replace(/[^a-zA-Z0-9\s\-_]/g, "").trim() || "song";
      const safeSource = source.replace(/[^a-zA-Z0-9\s\-_]/g, "").trim();
      const filename = `${safeTitle} - ${safeSource}.pdf`;

      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Load PDF Effect
  useEffect(() => {
    setLoading(true);
    var titleAddition = ` - ${title}`;
    const loadPdf = async () => {
      const url = `${API_URL}/fetch/pdf?source=${source}&page=${page}&title=${title}&addPage=${
        addPage ? "true" : "false"
      }`;
      const response = await fetch(url);
      const content = await response.blob();
      setPdf(content);
      if (title) document.title = document.title + titleAddition;
      setLoading(false);
    };
    loadPdf();
    return () => {
      document.title = document.title.replace(titleAddition, "");
    };
  }, [source, page, title, addPage]);

  // Recently Viewed Effect
  useEffect(() => {
    if (!loading && source && page && title) {
      const timer = setTimeout(() => {
        addToRecentlyViewed({
          source,
          page,
          title,
        });
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [loading, source, page, title]);

  // Playlist Navigation Calculation
  let prevSongLink: { pathname: string; state: any } | null = null;
  let nextSongLink: { pathname: string; state: any } | null = null;

  if (playlistId && typeof songIndex === "number") {
    const allPlaylists = getPlaylists();
    const playlist = allPlaylists.find((p) => p.id === playlistId);
    if (playlist && playlist.songs) {
      if (songIndex > 0) {
        const prevSong = playlist.songs[songIndex - 1];
        prevSongLink = {
          pathname: `/source/${encodeURIComponent(prevSong.source)}/${prevSong.page}`,
          state: {
            playlistId,
            songIndex: songIndex - 1,
            title: prevSong.title,
          },
        };
      }
      if (songIndex < playlist.songs.length - 1) {
        const nextSong = playlist.songs[songIndex + 1];
        nextSongLink = {
          pathname: `/source/${encodeURIComponent(nextSong.source)}/${nextSong.page}`,
          state: {
            playlistId,
            songIndex: songIndex + 1,
            title: nextSong.title,
          },
        };
      }
    }
  }

  // Keyboard Navigation Effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is on an input or textarea (unlikely here but good practice)
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "ArrowLeft" && prevSongLink) {
        history.push(prevSongLink.pathname, prevSongLink.state);
      } else if (e.key === "ArrowRight" && nextSongLink) {
        history.push(nextSongLink.pathname, nextSongLink.state);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [prevSongLink, nextSongLink, history]);

  return (
    <>
      <TitleBar
        rightContent={
          <>
            <div
              style={{ position: "relative", display: "inline-block" }}
              className="is-clickable"
              title={
                noSleepEnabled
                  ? "Turn off screen sleep lock"
                  : "Turn on screen sleep lock"
              }
              onClick={toggleNoSleep}
            >
              <FontAwesomeIcon
                icon={noSleepEnabled ? faLock : faLockOpen}
                style={{ color: noSleepEnabled ? "rgb(18, 136, 66)" : "#bbb" }}
              />
              <FontAwesomeIcon
                icon={faEye}
                style={{
                  position: "absolute",
                  bottom: "1.5px",
                  left: "2px",
                  fontSize: "8px",
                  color: "black",
                }}
              />
            </div>

            <FontAwesomeIcon
              icon={faPrint}
              title="Print"
              style={{
                color: "#bbb",
              }}
              className="is-clickable"
              onClick={() => {
                window.print();
              }}
            />
            <FontAwesomeIcon
              icon={faDownload}
              title={`Download: ${title || "PDF"}`}
              style={{
                color: "#bbb",
                marginRight: 10,
              }}
              className="is-clickable"
              onClick={handleDownload}
            />
            {searchQuery && (
              <FontAwesomeIcon
                icon={faEllipsisH}
                title="Select another chart"
                style={{ color: "#bbb" }}
                className="is-clickable"
                onClick={() => {
                  setShowResults(!showResults);
                }}
              />
            )}
            <div style={{ display: "inline-block" }}>
              <AddToPlaylistButton
                song={{ source, page, title: title || "" }}
              />
            </div>
          </>
        }
      />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div
            className="pdf-container"
            onClick={handleZoom}
            style={{ cursor: isZoomed() ? "zoom-out" : "zoom-in" }}
          >
            <Document
              file={pdf}
              loading={<LoadingSpinner />}
              onLoadSuccess={(doc) => setNumPages(doc.numPages)}
            >
              {Array.from({ length: numPages }, (_, index) => (
                <React.Fragment key={index}>
                  <Page pageNumber={index + 1} width={pdfWidth} />
                </React.Fragment>
              ))}
            </Document>
          </div>
          <div className="pdf-container-print-only">
            <Document file={pdf}>
              {Array.from({ length: numPages }, (_, index) => (
                <React.Fragment key={index}>
                  <div style={{ height: index === 0 ? 15 : 30 }} />
                  <Page pageNumber={index + 1} />
                </React.Fragment>
              ))}
            </Document>
          </div>
          <div>
            {!!numPages && (
              <div
                className="extra-page"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <button
                  className="grey-button"
                  onClick={() => setAddPage(!addPage)}
                  style={{ marginBottom: 20, marginTop: 20 }}
                >
                  {addPage ? "Hide extra page" : "Show next page in fakebook"}
                </button>
              </div>
            )}
            {/* Playlist Navigation Buttons */}
            {(prevSongLink || nextSongLink) && (
              <div
                style={{
                  marginBottom: 20,
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                <button
                  className="blue-button"
                  disabled={!prevSongLink}
                  onClick={() =>
                    prevSongLink &&
                    history.push(prevSongLink.pathname, prevSongLink.state)
                  }
                  style={{
                    opacity: prevSongLink ? 1 : 0.5,
                    cursor: prevSongLink ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faChevronLeft}
                      style={{ marginRight: "5px" }}
                    />
                    <div>Playlist previous</div>
                  </div>
                </button>
                <button
                  className="blue-button"
                  disabled={!nextSongLink}
                  onClick={() =>
                    nextSongLink &&
                    history.push(nextSongLink.pathname, nextSongLink.state)
                  }
                  style={{
                    opacity: nextSongLink ? 1 : 0.5,
                    cursor: nextSongLink ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>Playlist next</div>
                    <FontAwesomeIcon
                      icon={faChevronRight}
                      style={{ marginLeft: "5px" }}
                    />
                  </div>
                </button>
              </div>
            )}
            {searchResults && showResults && (
              <div className="greyout" onClick={() => setShowResults(false)}>
                <div className="search-dropdown">
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div className="caret"></div>
                  </div>
                  <div className="result-container">
                    <h4 style={{ margin: "5px 0px" }}>
                      <FontAwesomeIcon
                        icon={faSearch}
                        style={{ marginRight: "8px" }}
                      />
                      More search results
                    </h4>
                    <SearchResults
                      searchResults={searchResults}
                      searchQuery={searchQuery || ""}
                      currentSelection={{ source: source, page: page }}
                      showAddButton={false}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default PdfContainer;
