import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import TitleBar from "../components/TitleBar";
import { API_URL } from "../constants";
import { getRecentlyViewedForResults } from "../utils/recentlyViewed";
import SearchResults, { SearchResult } from "./SearchResults";

const Search = () => {
  const [results, setResults] = React.useState<Array<SearchResult>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchFailed, setSearchFailed] = React.useState<boolean>(false);
  const [initialSearchDone, setInitialSearchDone] =
    React.useState<boolean>(false);
  const [recentlyViewed, setRecentlyViewed] = React.useState<
    Array<SearchResult>
  >([]);
  const [input, setInput] = React.useState<string>(() => {
    // Initialize from localStorage with expiration check
    const getStoredSearchInput = () => {
      try {
        const stored = localStorage.getItem("searchInputData");
        if (!stored) return "";

        const { value, timestamp } = JSON.parse(stored);
        const oneHourAgo = Date.now() - 60 * 60 * 1000; // 1 hour in milliseconds

        if (timestamp < oneHourAgo) {
          // Data is older than 1 hour, clear it
          localStorage.removeItem("searchInputData");
          return "";
        }

        return value || "";
      } catch (error) {
        // Invalid JSON or other error, clear it
        localStorage.removeItem("searchInputData");
        return "";
      }
    };

    return getStoredSearchInput();
  });

  const { query } = useParams<{ query?: string }>();
  const history = useHistory();

  // Handle URL query parameter and persisted search
  React.useEffect(() => {
    if (!!query) {
      // URL has query parameter - use it
      setInput(query);
      localStorage.setItem(
        "searchInputData",
        JSON.stringify({
          value: query,
          timestamp: Date.now(),
        }),
      );
      handleSearch(query);
      setInitialSearchDone(true);
    } else if (!initialSearchDone) {
      // No URL query and haven't done initial search yet
      // The input is already loaded from localStorage with expiration check
      if (input && input.length >= 2) {
        handleSearch(input);
      }
      setInitialSearchDone(true);
    }
  }, [query, initialSearchDone, input]); // Runs when query or initialSearchDone changes

  // Load recently viewed items on component mount
  React.useEffect(() => {
    const loadRecentlyViewed = () => {
      const recent = getRecentlyViewedForResults(6);
      setRecentlyViewed(recent);
    };

    loadRecentlyViewed();

    // Listen for storage changes to update recently viewed when user navigates back
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "recentlyViewed") {
        loadRecentlyViewed();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also reload when the window gains focus (in case user viewed PDFs in another tab)
    const handleFocus = () => {
      loadRecentlyViewed();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Save to localStorage with timestamp
    localStorage.setItem(
      "searchInputData",
      JSON.stringify({
        value: value,
        timestamp: Date.now(),
      }),
    );

    value !== null && setSearchFailed(false);
    debounceSearch(value);
  };

  const handleSearch = (value: string) => {
    if (!!value && value.length >= 2) {
      setLoading(true);
      fetch(`${API_URL}/search/song?q=${encodeURI(value)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.result.length === 0) setSearchFailed(true);
          setResults(data.result);
        })
        .then(() => {
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  };

  const debounceSearch = React.useCallback(_.debounce(handleSearch, 500), []);

  const handleRandomSong = () => {
    setLoading(true);
    fetch(`${API_URL}/info/random`)
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          const { source, page, title } = data.result;
          history.push(`/source/${encodeURIComponent(source)}/${page}`, {
            title,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching random song:", error);
        setLoading(false);
      });
  };

  return (
    <>
      <TitleBar />
      <div className="container">
        <input
          placeholder="Enter a song title to search"
          onChange={handleInputChange}
          value={input}
          autoFocus
          id="search-input"
          style={{
            marginBottom: 10,
            width: "85%",
            fontSize: 18,
            padding: "7px 22px 5px 8px",
          }}
        ></input>
        <span
          onClick={() => {
            setInput("");
            setResults([]);
            // Clear from localStorage
            localStorage.removeItem("searchInputData");
            document.getElementById("search-input")?.focus();
          }}
          className="clear-button"
        >
          <FontAwesomeIcon icon={faTimes} />
        </span>

        {searchFailed && (
          <p>
            No matches for that search{" "}
            <span role="img" aria-label="sad">
              😭
            </span>
          </p>
        )}

        {!results.length && recentlyViewed.length > 0 && (
          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, marginBottom: 15, color: "#333" }}>
              <span role="img" aria-label="book">
                📖
              </span>{" "}
              Recently Viewed
            </h3>
            <SearchResults searchResults={recentlyViewed} searchQuery="" />
          </div>
        )}

        {!results.length && (
          <div style={{ marginTop: 30, marginBottom: 20 }}>
            <button
              onClick={handleRandomSong}
              disabled={loading}
              className="blue-button"
            >
              {loading ? "Loading..." : "🎲 Random song!"}
            </button>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {results && !loading && results.length > 0 && (
          <SearchResults searchResults={results} searchQuery={input} />
        )}
        {results.length === 0 && recentlyViewed.length === 0 && (
          <p style={{ fontSize: 70, margin: 0 }}>
            <span role="img" aria-label="clef">
              🎼
            </span>
          </p>
        )}
      </div>
    </>
  );
};

export default Search;
